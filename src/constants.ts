import { Region } from './types';

// NOTE: In production, use environment variables. 
// For this demo artifact, we use a public test key for Razorpay simulation.
export const RAZORPAY_TEST_KEY = "rzp_test_1DP5mmOlF5G5ag"; 

export const PRICING = {
  INDIA: {
    currency: 'INR',
    amount: 49900, // in paise
    label: '₹499',
    symbol: '₹'
  },
  GLOBAL: {
    currency: 'USD',
    amount: 999, // in cents
    label: '$9.99',
    symbol: '$'
  }
};

export const HELPLINES = {
  INDIA: {
    name: 'Kiran (Mental Health Rehab)',
    number: '1800-599-0019'
  },
  GLOBAL: {
    name: 'Universal Emergency',
    number: '911 / 112'
  }
};

export const MAX_FREE_MESSAGES = 5;

export const WELLNESS_TOOLS = [
  { id: 'breathing', name: '4-7-8 Breathing', icon: 'Wind', desc: 'Calm anxiety quickly' },
  { id: 'grounding', name: '5-4-3-2-1 Grounding', icon: 'Anchor', desc: 'Connect to the present' },
  { id: 'journal', name: 'Micro Journal', icon: 'Book', desc: 'Track your thoughts' },
  { id: 'sound', name: 'Calm Sounds', icon: 'Music', desc: 'Binaural beats' }
];