import { UserState, MoodLog, ChatMessage, JournalEntry } from '../types';

const KEYS = {
  USER: 'relief_anchor_user',
  MOOD: 'relief_anchor_moods',
  CHAT: 'relief_anchor_chat',
  JOURNAL: 'relief_anchor_journal'
};

// A hidden salt to prevent simple JSON editing in DevTools
const SECURITY_SALT = "RELIEF_ANCHOR_v1_SECURE_HASH_9988";

// Generate a checksum for critical fields
const generateSignature = (state: Partial<UserState>): string => {
  // We sign the fields that involve money or access control
  const payload = `${state.isPremium}|${state.premiumUntil}|${state.region}|${state.paymentId || ''}|${SECURITY_SALT}`;
  
  // Simple DJB2-like hashing for client-side obfuscation
  let hash = 5381;
  for (let i = 0; i < payload.length; i++) {
    hash = ((hash << 5) + hash) + payload.charCodeAt(i); /* hash * 33 + c */
  }
  return hash.toString(36);
};

const createInitialUser = (): UserState => {
  const base: UserState = {
    region: 'GLOBAL',
    isPremium: false,
    premiumUntil: null,
    messageCount: 0,
    lastMessageDate: new Date().toISOString().split('T')[0],
    paymentId: undefined
  };
  // Sign the initial state
  base.signature = generateSignature(base);
  return base;
};

export const storageService = {
  getUser: (): UserState => {
    const stored = localStorage.getItem(KEYS.USER);
    if (!stored) return createInitialUser();
    
    let user: UserState;
    try {
      user = JSON.parse(stored);
    } catch {
      return createInitialUser();
    }
    
    // SECURITY CHECK: Verify Integrity
    const expectedSignature = generateSignature(user);
    if (user.signature !== expectedSignature) {
      console.warn("Security Alert: User data tampering detected. Reverting to safe state.");
      // Tampering detected (e.g., user changed isPremium: true manually)
      // We strip premium access but keep non-critical data like messageCount if possible, 
      // or just reset critical fields.
      user.isPremium = false;
      user.premiumUntil = null;
      user.paymentId = undefined;
      // Re-sign the sanitized user
      user.signature = generateSignature(user);
      localStorage.setItem(KEYS.USER, JSON.stringify(user));
    }

    // Reset daily count if date changed
    const today = new Date().toISOString().split('T')[0];
    if (user.lastMessageDate !== today) {
      user.messageCount = 0;
      user.lastMessageDate = today;
      // Re-sign because we changed state
      user.signature = generateSignature(user);
      localStorage.setItem(KEYS.USER, JSON.stringify(user));
    }
    return user;
  },

  updateUser: (updates: Partial<UserState>) => {
    const current = storageService.getUser();
    const updated = { ...current, ...updates };
    
    // Always recalculate signature on any update
    updated.signature = generateSignature(updated);
    
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
  },

  getJournalEntries: (): JournalEntry[] => {
    const stored = localStorage.getItem(KEYS.JOURNAL);
    return stored ? JSON.parse(stored) : [];
  },

  addJournalEntry: (text: string) => {
    const entries = storageService.getJournalEntries();
    const newEntry: JournalEntry = {
      id: crypto.randomUUID(),
      text,
      timestamp: Date.now()
    };
    localStorage.setItem(KEYS.JOURNAL, JSON.stringify([newEntry, ...entries]));
    return newEntry;
  },

  // CRITICAL: Wipes content but PRESERVES the Account/Premium keys
  clearPrivateData: () => {
    localStorage.removeItem(KEYS.CHAT);
    localStorage.removeItem(KEYS.MOOD);
    localStorage.removeItem(KEYS.JOURNAL);
    // Note: We deliberately do NOT remove KEYS.USER to protect the payment/premium status
  }
};