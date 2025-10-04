import { ChatRequest } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Get Turnstile token from Cloudflare widget
 */
export const getTurnstileToken = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    // In development or if Turnstile is not configured, return a test token
    if (import.meta.env.DEV || !import.meta.env.VITE_TURNSTILE_SITE_KEY) {
      resolve('test-token');
      return;
    }

    const turnstileElement = document.querySelector('.cf-turnstile');
    if (!turnstileElement) {
      reject(new Error('Turnstile not initialized'));
      return;
    }

    // @ts-ignore - Turnstile API
    const token = window.turnstile?.getResponse();
    if (token) {
      resolve(token);
    } else {
      reject(new Error('Failed to get Turnstile token'));
    }
  });
};

/**
 * Send chat message and stream response
 */
export const sendChatMessage = async (
  request: ChatRequest,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: string) => void
): Promise<void> => {
  try {
    const turnstileToken = await getTurnstileToken();

    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Turnstile-Token': turnstileToken,
      },
      body: JSON.stringify({
        ...request,
        turnstile_token: turnstileToken,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        onComplete();
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      
      // Keep the last incomplete line in buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data.trim() === '[DONE]') {
            onComplete();
            return;
          }

          try {
            const parsed = JSON.parse(data);
            
            if (parsed.error) {
              onError(parsed.error);
              return;
            }

            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              onChunk(content);
            }
          } catch (e) {
            // Skip invalid JSON
            console.warn('Failed to parse SSE data:', data);
          }
        }
      }
    }
  } catch (error) {
    console.error('Chat error:', error);
    onError(error instanceof Error ? error.message : 'Unknown error');
  }
};

/**
 * Get a random static question
 */
export const getStaticQuestion = async (llabNumbers: number[]): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/static-question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ llab_numbers: llabNumbers }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.question;
  } catch (error) {
    console.error('Static question error:', error);
    return null;
  }
};

/**
 * Health check
 */
export const checkHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return data.ok === true;
  } catch {
    return false;
  }
};
