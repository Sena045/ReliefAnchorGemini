import { UserState, MoodLog, ChatMessage, Region } from '../types';

const KEYS = {
  USER: 'relief_anchor_user',
  MOOD: 'relief_anchor_moods',
  CHAT: 'relief_anchor_chat'
};

const INITIAL_USER: UserState = {
  region: 'GLOBAL',
  isPremium: false,
  premiumUntil: null,
  messageCount: 0,
  lastMessageDate: new Date().toISOString().split('T')[0]
};

export const storageService = {
  getUser: (): UserState => {
    const stored = localStorage.getItem(KEYS.USER);
    if (!stored) return INITIAL_USER;
    const user = JSON.parse(stored);
    
    // Reset daily count if date changed
    const today = new Date().toISOString().split('T')[0];
    if (user.lastMessageDate !== today) {
      user.messageCount = 0;
      user.lastMessageDate = today;
      localStorage.setItem(KEYS.USER, JSON.stringify(user));
    }
    return user;
  },

  updateUser: (updates: Partial<UserState>) => {
    const current = storageService.getUser();
    const updated = { ...current, ...updates };
    localStorage.setItem(KEYS.USER, JSON.stringify(updated));
    return updated;
  },

  getMoods: (): MoodLog[] => {
    const stored = localStorage.getItem(KEYS.MOOD);
    return stored ? JSON.parse(stored) : [];
  },

  addMood: (score: number, note?: string) => {
    const moods = storageService.getMoods();
    const newMood: MoodLog = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      score,
      note
    };
    localStorage.setItem(KEYS.MOOD, JSON.stringify([...moods, newMood]));
    return newMood;
  },

  getChatHistory: (): ChatMessage[] => {
    const stored = localStorage.getItem(KEYS.CHAT);
    return stored ? JSON.parse(stored) : [];
  },

  saveChatHistory: (messages: ChatMessage[]) => {
    localStorage.setItem(KEYS.CHAT, JSON.stringify(messages));
  },

  clearChat: () => {
    localStorage.removeItem(KEYS.CHAT);
  }
};