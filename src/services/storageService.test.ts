import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from './storageService';

describe('ReliefAnchor Logic Tests', () => {
  
  beforeEach(() => {
    localStorage.clear();
  });

  describe('User Management', () => {
    it('should initialize a default user correctly', () => {
      const user = storageService.getUser();
      expect(user.isPremium).toBe(false);
      expect(user.region).toBe('GLOBAL');
      expect(user.messageCount).toBe(0);
      expect(user.signature).toBeDefined(); // Security Check
    });

    it('should update user properties and regenerate signature', () => {
      const oldUser = storageService.getUser();
      storageService.updateUser({ region: 'INDIA' });
      const newUser = storageService.getUser();
      expect(newUser.region).toBe('INDIA');
      expect(newUser.signature).not.toBe(oldUser.signature); // Signature must change
    });

    it('should handle Premium upgrade', () => {
      storageService.updateUser({ 
        isPremium: true,
        premiumUntil: '2099-12-31'
      });
      const user = storageService.getUser();
      expect(user.isPremium).toBe(true);
      expect(user.premiumUntil).toBe('2099-12-31');
    });
    
    it('should detect tampering and revert premium status', () => {
      // 1. Create a legitimate free user
      const legitimateUser = storageService.getUser();
      
      // 2. Hacker attempts to modify LocalStorage directly
      const hackedUser = { ...legitimateUser, isPremium: true, premiumUntil: '2099-12-31' };
      // Hacker DOES NOT know how to generate the correct signature, so they leave old signature or make one up
      localStorage.setItem('relief_anchor_user', JSON.stringify(hackedUser));
      
      // 3. Application loads user
      const reloadedUser = storageService.getUser();
      
      // 4. Expect system to have detected mismatch and reverted to Free
      expect(reloadedUser.isPremium).toBe(false);
      expect(reloadedUser.premiumUntil).toBeNull();
    });

    it('should reset message count on a new day', () => {
      // 1. Create a valid past state
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // We use updateUser to ensure signature is valid for the setup
      storageService.updateUser({
        messageCount: 10,
        lastMessageDate: yesterdayStr
      });

      // 2. Get user (should trigger reset logic)
      const user = storageService.getUser();
      const todayStr = new Date().toISOString().split('T')[0];

      expect(user.messageCount).toBe(0);
      expect(user.lastMessageDate).toBe(todayStr);
    });
  });

  describe('Mood Tracking', () => {
    it('should add mood logs', () => {
      storageService.addMood(5, "Feeling great");
      const moods = storageService.getMoods();
      expect(moods.length).toBe(1);
      expect(moods[0].score).toBe(5);
      expect(moods[0].note).toBe("Feeling great");
    });
  });

  describe('Journaling', () => {
    it('should save journal entries in reverse chronological order', () => {
      storageService.addJournalEntry("Entry 1");
      storageService.addJournalEntry("Entry 2");
      
      const entries = storageService.getJournalEntries();
      expect(entries.length).toBe(2);
      expect(entries[0].text).toBe("Entry 2"); // Newest first
      expect(entries[1].text).toBe("Entry 1");
    });
  });

  describe('Chat History', () => {
    it('should persist chat messages', () => {
      const msg = { 
        id: '1', 
        role: 'user' as const, 
        text: 'Hello', 
        timestamp: 123 
      };
      
      storageService.saveChatHistory([msg]);
      const history = storageService.getChatHistory();
      
      expect(history.length).toBe(1);
      expect(history[0].text).toBe('Hello');
    });
  });
});