export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: Message[];
  llab_numbers: number[];
  quiz_mode: string;
  turnstile_token?: string;
}

export interface StaticQuestion {
  id: string;
  type: string;
  questionType: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  image?: string;
  aircraft?: string;
}

export interface AppState {
  llabNumbers: number[];
  quizMode: 'mixed' | 'static_only' | 'ai_only';
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sessionStarted: boolean;
  theme: 'light' | 'dark';
}
