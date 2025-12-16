import React, { Suspense } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { MessageCircle, Activity, Heart, Settings } from 'lucide-react';
import { clsx } from 'clsx';

// Lazy load pages
const Chat = React.lazy(() => import('./pages/Chat'));
const Mood = React.lazy(() => import('./pages/Mood'));
const Wellness = React.lazy(() => import('./pages/Wellness'));
const SettingsPage = React.lazy(() => import('./pages/Settings'));

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: MessageCircle, label: 'Anya' },
    { path: '/mood', icon: Activity, label: 'Mood' },
    { path: '/wellness', icon: Heart, label: 'Wellness' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50">
      <main className="flex-1 overflow-hidden relative">
        <Suspense fallback={
          <div className="flex items-center justify-center h-full text-brand-600">
            <div className="animate-pulse flex flex-col items-center">
              <Heart className="w-12 h-12 mb-2 animate-bounce" />
              <p>Loading ReliefAnchor...</p>
            </div>
          </div>
        }>
          {children}
        </Suspense>
      </main>

      {/* Bottom Nav */}
      <nav className="bg-white border-t border-slate-200 safe-bottom">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  "flex flex-col items-center justify-center w-full h-full transition-colors duration-200",
                  isActive ? "text-brand-600" : "text-slate-400 hover:text-brand-400"
                )}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Chat />} />
          <Route path="/mood" element={<Mood />} />
          <Route path="/wellness" element={<Wellness />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}