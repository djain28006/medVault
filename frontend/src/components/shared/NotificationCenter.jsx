import React, { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, ShieldCheck, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Mock listener for system events (in a real app, this would be a Context or WebSockets)
  useEffect(() => {
    const handleNotification = (e) => {
      const newNotif = {
        id: Date.now(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ...e.detail
      };
      setNotifications(prev => [newNotif, ...prev].slice(0, 10));
      // Auto-open on any new alert
      setIsOpen(true);
    };

    window.addEventListener('app-notification', handleNotification);
    return () => window.removeEventListener('app-notification', handleNotification);
  }, []);

  const unreadCount = notifications.length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full bg-slate-900 p-2 text-slate-400 border border-slate-800 transition-all hover:bg-slate-800 hover:text-slate-100"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-[0_0_10px_rgba(244,63,94,0.5)]">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute right-0 z-50 mt-4 w-[calc(100vw-2rem)] sm:w-96 max-w-full origin-top-right rounded-3xl border border-slate-800 bg-slate-950/90 p-2 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-900">
                <h3 className="text-lg font-bold text-slate-100">Clinical Alerts</h3>
                <button 
                  onClick={() => {
                    setNotifications([]);
                    setIsOpen(false);
                  }}
                  className="text-xs text-slate-500 hover:text-rose-400 transition-colors"
                >
                  Clear All
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto p-2 scrollbar-none">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <ShieldCheck className="h-10 w-10 text-emerald-500/30 mb-2" />
                    <p className="text-sm text-slate-500">System Secure. No active alerts.</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      className={`mb-2 flex items-start gap-4 rounded-2xl p-4 transition-all ${
                        notif.type === 'critical' ? 'bg-rose-500/10 border border-rose-500/20' : 'bg-slate-900/40 border border-slate-800/50'
                      }`}
                    >
                      <div className={`mt-1 rounded-full p-2 ${
                        notif.type === 'critical' ? 'bg-rose-500/20 text-rose-500' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {notif.type === 'critical' ? <AlertTriangle className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-500">{notif.time}</span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${
                             notif.type === 'critical' ? 'text-rose-500' : 'text-slate-500'
                          }`}>
                            {notif.category || 'Notification'}
                          </span>
                        </div>
                        <p className="mt-1 text-sm font-semibold text-slate-100">{notif.title}</p>
                        <p className="text-xs text-slate-400 leading-relaxed mt-1">{notif.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Utility to trigger notifications globally
export const notify = (data) => {
  window.dispatchEvent(new CustomEvent('app-notification', { detail: data }));
};
