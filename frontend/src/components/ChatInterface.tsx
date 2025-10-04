import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';
import { sendChatMessage } from '../lib/api';

interface ChatInterfaceProps {
  llabNumbers: number[];
  quizMode: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ llabNumbers, quizMode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-greeting
  useEffect(() => {
    const greeting: Message = {
      role: 'assistant',
      content: `Welcome, Cadet! I'm Lani Bot, your study assistant. I'm ready to help you prepare for ${llabNumbers.map(n => `LLAB ${n}`).join(', ')}.\n\nSay hello to get started!`
    };
    setMessages([greeting]);
  }, [llabNumbers]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsSending(true);

    // Create assistant message placeholder
    const assistantMessage: Message = {
      role: 'assistant',
      content: ''
    };
    setMessages(prev => [...prev, assistantMessage]);

    // Filter out the initial greeting message (first message) when sending to backend
    // Only send actual user/assistant conversation messages
    const conversationMessages = messages.slice(1).concat([userMessage]);

    try {
      await sendChatMessage(
        {
          messages: conversationMessages,
          llab_numbers: llabNumbers,
          quiz_mode: quizMode,
        },
        (chunk) => {
          // Update the last message with streaming content
          setMessages(prev => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            // Create a NEW object instead of mutating
            updated[lastIndex] = {
              ...updated[lastIndex],
              content: updated[lastIndex].content + chunk
            };
            return updated;
          });
        },
        () => {
          setIsLoading(false);
          setIsSending(false);
        },
        (error) => {
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1].content = `⚠️ Error: ${error}`;
            return updated;
          });
          setIsLoading(false);
          setIsSending(false);
        }
      );
    } catch (error) {
      console.error('Send error:', error);
      setIsLoading(false);
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      height: 'calc(100vh - 120px)',
      display: 'flex',
      flexDirection: 'column',
      maxWidth: '900px',
      margin: '0 auto',
      padding: 'var(--spacing-md)',
    }}>
      {/* Messages area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: 'var(--spacing-md)',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--border-radius)',
        marginBottom: 'var(--spacing-md)',
      }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: 'var(--spacing-md)',
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div style={{
              maxWidth: '80%',
              padding: 'var(--spacing-md)',
              borderRadius: 'var(--border-radius)',
              background: msg.role === 'user' ? 'var(--primary)' : 'var(--bg-tertiary)',
              color: msg.role === 'user' ? 'var(--text-light)' : 'var(--text-primary)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {msg.role === 'assistant' && (
                <div style={{
                  fontWeight: 'bold',
                  marginBottom: 'var(--spacing-xs)',
                  color: 'var(--primary)',
                  fontSize: '0.85rem',
                }}>
                  🪽 Lani Bot
                </div>
              )}
              {msg.content ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Style headings
                    h1: ({node, ...props}) => <h1 style={{fontSize: '1.5em', fontWeight: 'bold', marginTop: '0.5em', marginBottom: '0.5em'}} {...props} />,
                    h2: ({node, ...props}) => <h2 style={{fontSize: '1.3em', fontWeight: 'bold', marginTop: '0.5em', marginBottom: '0.5em'}} {...props} />,
                    h3: ({node, ...props}) => <h3 style={{fontSize: '1.1em', fontWeight: 'bold', marginTop: '0.5em', marginBottom: '0.5em'}} {...props} />,
                    // Style code blocks
                    code: ({node, inline, ...props}: any) => 
                      inline ? (
                        <code style={{
                          background: 'rgba(0, 0, 0, 0.1)',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          fontFamily: 'monospace',
                          fontSize: '0.9em'
                        }} {...props} />
                      ) : (
                        <code style={{
                          display: 'block',
                          background: 'rgba(0, 0, 0, 0.1)',
                          padding: '12px',
                          borderRadius: '6px',
                          fontFamily: 'monospace',
                          fontSize: '0.9em',
                          overflowX: 'auto',
                          marginTop: '0.5em',
                          marginBottom: '0.5em'
                        }} {...props} />
                      ),
                    // Style lists
                    ul: ({node, ...props}) => <ul style={{marginLeft: '1.5em', marginTop: '0.5em', marginBottom: '0.5em'}} {...props} />,
                    ol: ({node, ...props}) => <ol style={{marginLeft: '1.5em', marginTop: '0.5em', marginBottom: '0.5em'}} {...props} />,
                    li: ({node, ...props}) => <li style={{marginBottom: '0.3em'}} {...props} />,
                    // Style links
                    a: ({node, ...props}) => <a style={{color: 'var(--primary)', textDecoration: 'underline'}} target="_blank" rel="noopener noreferrer" {...props} />,
                    // Style paragraphs
                    p: ({node, ...props}) => <p style={{marginTop: '0.5em', marginBottom: '0.5em'}} {...props} />,
                    // Style blockquotes
                    blockquote: ({node, ...props}) => <blockquote style={{
                      borderLeft: '4px solid var(--primary)',
                      paddingLeft: '1em',
                      marginLeft: '0',
                      fontStyle: 'italic',
                      opacity: 0.9
                    }} {...props} />,
                    // Style strong/bold
                    strong: ({node, ...props}) => <strong style={{fontWeight: 'bold'}} {...props} />,
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              ) : (isLoading && idx === messages.length - 1 && (
                <span className="loading">Thinking...</span>
              ))}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div style={{
        background: 'var(--bg-secondary)',
        padding: 'var(--spacing-md)',
        borderRadius: 'var(--border-radius)',
        display: 'flex',
        gap: 'var(--spacing-sm)',
      }}>
        <div className="cf-turnstile" data-sitekey="1x00000000000000000000AA" style={{ display: 'none' }}></div>
        
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your answer or ask a question..."
          disabled={isSending}
          style={{
            flex: 1,
            padding: 'var(--spacing-md)',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--border-radius-sm)',
            fontSize: '1rem',
            resize: 'none',
            minHeight: '60px',
            fontFamily: 'inherit',
          }}
        />

        <button
          onClick={handleSend}
          disabled={!input.trim() || isSending}
          style={{
            padding: '0 var(--spacing-xl)',
            background: input.trim() && !isSending ? 'var(--primary)' : 'var(--silver)',
            color: 'var(--text-light)',
            borderRadius: 'var(--border-radius)',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: input.trim() && !isSending ? 'pointer' : 'not-allowed',
            opacity: input.trim() && !isSending ? 1 : 0.5,
            transition: 'var(--transition)',
          }}
        >
          {isSending ? '...' : 'Send'}
        </button>
      </div>

      <p style={{
        marginTop: 'var(--spacing-sm)',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)',
        textAlign: 'center',
      }}>
        Press Enter to send • Shift+Enter for new line
      </p>
    </div>
  );
};

export default ChatInterface;
