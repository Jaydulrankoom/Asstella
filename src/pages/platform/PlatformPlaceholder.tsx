import React from "react";
import { UserCog, Users, Package, Settings, BarChart3, AlertTriangle, ShieldCheck, Share2, Coins } from "lucide-react";

export default function PlatformPlaceholder({ title, description, icon: Icon }: any) {
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            {title}
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            {description}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-white/5 border border-border-dim rounded-2xl shadow-sm p-12 text-center">
        <div className="w-20 h-20 bg-brand/10 text-brand rounded-full flex items-center justify-center mb-6">
          {Icon ? <Icon className="w-10 h-10" /> : <Settings className="w-10 h-10" />}
        </div>
        <h2 className="text-2xl font-black mb-2">{title} Module</h2>
        <p className="text-slate-500 max-w-md">
          This module is part of the Platform Admin feature set. The backend API is ready and the UI dashboard is currently being connected to the new multi-tenant architecture.
        </p>
        <button className="mt-8 px-6 py-2 bg-brand text-white font-bold rounded-xl shadow-lg shadow-brand/20 hover:bg-brand/90 transition-all active:scale-95">
          Refresh Status
        </button>
      </div>
    </div>
  );
}
