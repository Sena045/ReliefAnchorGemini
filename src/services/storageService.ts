import { UserState, MoodLog, ChatMessage, JournalEntry } from '../types';

const SESSION_KEY = 'relief_anchor_active_session';

// A hidden salt to prevent simple JSON editing in DevTools
const SECURITY_SALT = "RELIEF_ANCHOR_v1_SECURE_HASH_9988";

// Helper for consistent local YYYY-MM-DD strings (Client Local Time)
const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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
  // Robust value stringifier handling null/undefined/missing
  const val = (v: any) => {
    if (v === null || v === undefined) return '';
    return String(v);
  };
  
  // Payload structure: email|isPremium|premiumUntil|region|paymentId|planType|SALT
  // Explicitly accessing properties to ensure order and presence
  const payload = [
    val(state.email),
    val(state.isPremium),
    val(state.premiumUntil),
    val(state.region),
    val(state.paymentId),
    val(state.planType),
    SECURITY_SALT
  ].join('|');
  
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
    lastMessageDate: getTodayString(),
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
    
    // 1. SECURITY CHECK: Verify Integrity
    const currentSignature = generateSignature(user);
    
    if (user.signature !== currentSignature) {
      console.warn("Signature mismatch. Stored:", user.signature, "Calculated:", currentSignature);
      console.warn("Security Alert: User data tampering detected or Algorithm mismatch. Reverting to safe state.");
      
      user.isPremium = false;
      user.premiumUntil = null;
      user.planType = null;
      user.paymentId = undefined;
      
      // Re-sign with new algorithm
      user.signature = generateSignature(user);
      localStorage.setItem(KEYS.USER, JSON.stringify(user));
      return user; // Return early after reset
    }

    let hasUpdates = false;
    const today = getTodayString();

    // 2. EXPIRY CHECK: Check if subscription has expired
    if (user.isPremium && user.premiumUntil) {
      // If premiumUntil is strictly less than today, it's expired.
      // String comparison is valid for YYYY-MM-DD
      if (user.premiumUntil < today) {
        console.log("Subscription expired on", user.premiumUntil);
        user.isPremium = false;
        user.premiumUntil = null;
        user.planType = null;
        user.paymentId = undefined; 
        hasUpdates = true;
      }
    }

    // 3. DAILY RESET: Check message count
    if (user.lastMessageDate !== today) {
      user.messageCount = 0;
      user.lastMessageDate = today;
      hasUpdates = true;
    }

    // Save if any changes occurred
    if (hasUpdates) {
      user.signature = generateSignature(user);
      localStorage.setItem(KEYS.USER, JSON.stringify(user));
    }

    return user;
  },

  updateUser: (updates: Partial<UserState>) => {
    const KEYS = getKeys();
    const current = storageService.getUser();
    
    // Merge updates
    const updated = { ...current, ...updates };
    
    // Recalculate signature
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
  },

  // --- Recovery Token System ---

  // Generates a portable string that proves premium status
  getRecoveryToken: (): string | null => {
    const user = storageService.getUser();
    if (!user.isPremium || !user.premiumUntil) return null;
    
    // Payload: email|expiry|plan
    const payload = `${user.email}|${user.premiumUntil}|${user.planType}`;
    
    // Generate signature for this specific payload
    let hash = 5381;
    const fullStr = payload + SECURITY_SALT;
    for (let i = 0; i < fullStr.length; i++) {
        hash = ((hash << 5) + hash) + fullStr.charCodeAt(i);
    }
    const signature = hash.toString(36);
    
    // Return Base64 of payload|signature
    try {
      return btoa(`${payload}|${signature}`);
    } catch (e) {
      console.error("Failed to encode token", e);
      return null;
    }
  },

  // Validates a token and restores premium status if valid
  restorePurchase: (tokenInput: string): { success: boolean; message: string } => {
    try {
        // Aggressively clean input (remove whitespace, newlines, etc)
        const token = tokenInput.replace(/\s/g, '');
        
        if (!token) return { success: false, message: "Please enter a key." };

        let decoded;
        try {
            decoded = atob(token);
        } catch (e) {
            return { success: false, message: "Invalid key format (Not Base64)." };
        }

        const parts = decoded.split('|');
        // Expected: email | expiry | plan | signature
        if (parts.length !== 4) return { success: false, message: "Invalid token structure." };
        
        const [email, expiry, plan, sig] = parts;
        const currentUserEmail = storageService.getCurrentEmail();
        
        // 1. Verify Signature
        const payload = `${email}|${expiry}|${plan}`;
        let hash = 5381;
        const fullStr = payload + SECURITY_SALT;
        for (let i = 0; i < fullStr.length; i++) {
            hash = ((hash << 5) + hash) + fullStr.charCodeAt(i);
        }
        const calculatedSig = hash.toString(36);
        
        if (sig !== calculatedSig) {
          return { success: false, message: "Invalid key signature. Check for typos." };
        }
        
        // 2. Check ownership (Warn but allow if emails differ, as users might change emails)
        if (currentUserEmail && currentUserEmail !== email) {
           console.warn(`Restoring purchase from ${email} to ${currentUserEmail}`);
        }

        // 3. Verify Expiry
        // Use string comparison (Lexicographical works for ISO YYYY-MM-DD) which is safer for timezones
        if (expiry < getTodayString()) {
             return { success: false, message: `This subscription expired on ${expiry}.` };
        }

        // 4. Update User
        storageService.updateUser({
            isPremium: true,
            premiumUntil: expiry,
            planType: plan as any
        });
        
        return { success: true, message: "Premium restored successfully! Enjoy your benefits." };
    } catch (e) {
        console.error(e);
        return { success: false, message: "Failed to process key. Ensure you copied the full code." };
    }
  }
};