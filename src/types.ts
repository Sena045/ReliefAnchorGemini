export type Region = 'INDIA' | 'GLOBAL';

export interface UserState {
  region: Region;
  isPremium: boolean;
  premiumUntil: string | null;
  messageCount: number;
  lastMessageDate: string; // YYYY-MM-DD
}

export interface MoodLog {
  id: string;
  timestamp: number;
  score: number; // 1-5
  note?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  currency: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image: string;
  handler: (response: any) => void;
  prefill: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme: {
    color: string;
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}