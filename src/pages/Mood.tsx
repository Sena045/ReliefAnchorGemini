import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Smile, Meh, Frown, Plus } from 'lucide-react';
import { storageService } from '../services/storageService';
import { MoodLog } from '../types';
import { format } from 'date-fns';

export default function Mood() {
  const [moods, setMoods] = useState<MoodLog[]>([]);
  const [todayLogged, setTodayLogged] = useState(false);

  useEffect(() => {
    loadMoods();
  }, []);

  const loadMoods = () => {
    const data = storageService.getMoods();
    setMoods(data);
    const today = new Date().toDateString();
    setTodayLogged(data.some(m => new Date(m.timestamp).toDateString() === today));
  };

  const handleLogMood = (score: number) => {
    storageService.addMood(score);
    loadMoods();
  };

  const chartData = moods.slice(-7).map(m => ({
    date: format(new Date(m.timestamp), 'dd/MM'),
    score: m.score
  }));

  return (
    <div className="flex flex-col h-full bg-slate-50 p-4 overflow-y-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Mood Tracker</h1>

      {/* Chart */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 h-64">
        <h2 className="text-sm font-semibold text-slate-500 mb-4">Past 7 Entries</h2>
        {moods.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{fontSize: 10}} stroke="#94a3b8" />
              <YAxis domain={[1, 5]} hide />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#0d9488" 
                strokeWidth={3} 
                dot={{ fill: '#0d9488', strokeWidth: 2 }} 
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            Not enough data yet
          </div>
        )}
      </div>

      {/* Logger */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          {todayLogged ? "You've checked in today!" : "How are you feeling?"}
        </h2>
        
        {!todayLogged ? (
          <div className="flex justify-between gap-2">
            {[
              { score: 1, icon: Frown, color: 'text-red-500', bg: 'bg-red-50' },
              { score: 3, icon: Meh, color: 'text-yellow-500', bg: 'bg-yellow-50' },
              { score: 5, icon: Smile, color: 'text-green-500', bg: 'bg-green-50' },
            ].map((item) => (
              <button
                key={item.score}
                onClick={() => handleLogMood(item.score)}
                className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl transition-transform active:scale-95 hover:bg-slate-50 border border-slate-200 ${item.bg}`}
              >
                <item.icon size={32} className={`${item.color} mb-2`} />
                <span className="text-xs font-medium text-slate-600">
                  {item.score === 1 ? 'Rough' : item.score === 3 ? 'Okay' : 'Great'}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="inline-block p-3 bg-brand-50 rounded-full text-brand-600 mb-2">
              <CheckIcon />
            </div>
            <p className="text-slate-500 text-sm">Come back tomorrow to track your progress.</p>
            <button 
              onClick={() => setTodayLogged(false)}
              className="mt-4 text-xs text-brand-600 font-medium hover:underline"
            >
              Log again
            </button>
          </div>
        )}
      </div>

      {/* History List */}
      <div className="mt-6">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Recent Logs</h3>
        <div className="space-y-3">
          {[...moods].reverse().slice(0, 5).map((log) => (
            <div key={log.id} className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between">
              <span className="text-sm text-slate-600">
                {format(new Date(log.timestamp), 'MMM d, h:mm a')}
              </span>
              <div className={`px-2 py-1 rounded-md text-xs font-bold ${
                log.score >= 4 ? 'bg-green-100 text-green-700' :
                log.score === 3 ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {log.score}/5
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  )
}