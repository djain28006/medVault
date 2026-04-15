import React from 'react';
import { motion } from 'framer-motion';

export default function DashboardStats({ stats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass-card p-5 group"
        >
          <div className="flex items-start justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">{stat.label}</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.iconBg || 'bg-brand-500/10'}`}>
              <stat.icon className={`w-4 h-4 ${stat.iconColor || 'text-brand-400'}`} />
            </div>
          </div>
          <p className="stat-value">{stat.value}</p>
          {stat.sub && <p className="text-xs text-slate-500 mt-1">{stat.sub}</p>}
        </motion.div>
      ))}
    </div>
  );
}
