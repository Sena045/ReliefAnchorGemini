import { UserState, MoodLog, ChatMessage, JournalEntry } from '../types';

const SESSION_KEY = 'relief_anchor_active_session';

// A hidden salt to prevent simple JSON editing in DevTools
const SECURITY_SALT = "RELIEF_ANCHOR_v1_SECURE_HASH_9988";

// Helper to get namespaced keys based on active user
const getKeys = () => {
  const email = localStorage.getItem(SESSION_KEY);
  if (!email) {
    throw new Error("No active user session");
  }
  // Sanitize email for use in keys (replace non-alphanumeric chars)
  const safeKey = email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  
  return {
    USER: `relief_anchor_user_${safeKey}`,
    MOOD: `relief_anchor_moods_${safeKey}`,
    CHAT: `relief_anchor_chat_${safeKey}`,
    JOURNAL: `relief_anchor_journal_${safeKey}`
  };
};

// Generate a checksum for critical fields
const generateSignature = (state: Partial<UserState>): string => {
  // We sign the fields that involve money or access control
  const payload = `${state.email}|${state.isPremium}|${state.premiumUntil}|${state.region}|${state.paymentId || ''}|${state.planType || ''}|${SECURITY_SALT}`;
  
  // Simple DJB2-like hashing for client-side obfuscation
  let hash = 5381;
  for (let i = 0; i < payload.length; i++) {
    hash = ((hash << 5) + hash) + payload.charCodeAt(i); /* hash * 33 + c */
  }
  return hash.toString(36);
};

const createInitialUser = (email: string): UserState => {
  const base: UserState = {
    email: email,
    region: 'GLOBAL',
    isPremium: false,
    premiumUntil: null,
    planType: null,
    messageCount: 0,
    lastMessageDate: new Date().toISOString().split('T')[0],
    paymentId: undefined
  };
  // Sign the initial state
  base.signature = generateSignature(base);
  return base;
};

export const storageService = {
  // --- Session Management ---
  login: (email: string) => {
    if (!email) throw new Error("Email required");
    localStorage.setItem(SESSION_KEY, email);
    // Ensure user profile exists upon login
    storageService.getUser(); 
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  isLoggedIn: (): boolean => {
    return !!localStorage.getItem(SESSION_KEY);
  },

  getCurrentEmail: (): string | null => {
    return localStorage.getItem(SESSION_KEY);
  },

  // --- Data Access ---

  getUser: (): UserState => {
    const email = localStorage.getItem(SESSION_KEY);
    if (!email) throw new Error("User not logged in");
    
    const KEYS = getKeys();
    const stored = localStorage.getItem(KEYS.USER);
    
    if (!stored) {
      const newUser = createInitialUser(email);
      localStorage.setItem(KEYS.USER, JSON.stringify(newUser));
      return newUser;
    }
    
    let user: UserState;
    try {
      user = JSON.parse(stored);
    } catch {
      return createInitialUser(email);
    }
    
    // SECURITY CHECK: Verify Integrity
    const expectedSignature = generateSignature(user);
    if (user.signature !== expectedSignature) {
      console.warn("Security Alert: User data tampering detected. Reverting to safe state.");
      // Tampering detected
      user.isPremium = false;
      user.premiumUntil = null;
      user.planType = null;
      user.paymentId = undefined;
      // Re-sign
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
    const KEYS = getKeys();
    const current = storageService.getUser();
    const updated = { ...current, ...updates };
    
    // Always recalculate signature on any update
    updated.signature = generateSignature(updated);
    
    localStorage.setItem(KEYS.USER, JSON.stringify(updated));
    return updated;
  },

  getMoods: (): MoodLog[] => {
    const KEYS = getKeys();
    const stored = localStorage.getItem(KEYS.MOOD);
    return stored ? JSON.parse(stored) : [];
  },

  addMood: (score: number, note?: string) => {
    const KEYS = getKeys();
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
    const KEYS = getKeys();
    const stored = localStorage.getItem(KEYS.CHAT);
    return stored ? JSON.parse(stored) : [];
  },

  saveChatHistory: (messages: ChatMessage[]) => {
    const KEYS = getKeys();
    localStorage.setItem(KEYS.CHAT, JSON.stringify(messages));
  },

  clearChat: () => {
    const KEYS = getKeys();
    localStorage.removeItem(KEYS.CHAT);
  },

  getJournalEntries: (): JournalEntry[] => {
    const KEYS = getKeys();
    const stored = localStorage.getItem(KEYS.JOURNAL);
    return stored ? JSON.parse(stored) : [];
  },

  addJournalEntry: (text: string) => {
    const KEYS = getKeys();
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
    const KEYS = getKeys();
    localStorage.removeItem(KEYS.CHAT);
    localStorage.removeItem(KEYS.MOOD);
    localStorage.removeItem(KEYS.JOURNAL);
  }
};