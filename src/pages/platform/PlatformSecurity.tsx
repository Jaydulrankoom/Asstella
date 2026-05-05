import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Activity,
  Search,
  Filter,
  Lock,
  Unlock,
  AlertTriangle,
  RefreshCw,
  Clock,
  User,
  ExternalLink,
  Info,
  Terminal,
  Shield
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import api from "../../lib/api";

export default function PlatformSecurity() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);

  const fetchSecurityData = async () => {
    setLoading(true);
    try {
      const [logsRes, summaryRes] = await Promise.all([
        api.get("/platform/security/logs"),
        api.get("/platform/security/summary"),
      ]);
      setLogs(logsRes.data.data?.logs || []);
      setSummary(summaryRes.data.data);
    } catch (error) {
      console.error("Failed to fetch security data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const logsList = Array.isArray(logs) ? logs : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-7xl mx-auto p-4 md:p-6 pb-20">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-brand" /> Global Security Sentinel
          </h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">
            Real-time audit trails, suspicious Activity Monitoring, and Cryptographic Compliance
          </p>
        </div>
        <button 
           onClick={fetchSecurityData}
           className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl border border-border-dim hover:bg-brand hover:text-white transition-all shadow-sm"
        >
          <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
         <SecurityStatCard title="Active Shield" value="ENABLED" sub="Real-time monitoring" icon={Shield} color="text-emerald-500" />
         <SecurityStatCard title="Total Audit Logs" value={logsList.length} sub="Last 30 days" icon={Terminal} color="text-brand" />
         <SecurityStatCard title="Suspicious Events" value={summary?.suspicious_count || 0} sub="Requires investigation" icon={AlertTriangle} color="text-rose-500" />
         <SecurityStatCard title="Auth Failures" value={summary?.auth_failures_24h || 0} sub="Last 24 hours" icon={Lock} color="text-amber-500" />
      </div>

      <div className="bg-card-bg border border-border-dim rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col xl:flex-row">
         <div className="flex-1 p-8 overflow-x-auto">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-brand" /> Security Audit Log
               </h3>
               <div className="flex items-center gap-2">
                  <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                     <input placeholder="Filter by user or IP..." className="bg-app-bg border border-border-dim rounded-xl pl-9 pr-4 py-2 text-[10px] font-bold uppercase tracking-widest outline-none w-64" />
                  </div>
               </div>
            </div>

            {loading ? (
              <div className="py-20 text-center">
                 <RefreshCw className="w-10 h-10 text-brand animate-spin mx-auto mb-4 opacity-20" />
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scanning Audit Replicas...</p>
              </div>
            ) : logsList.length === 0 ? (
               <div className="py-20 text-center border-2 border-dashed border-border-dim rounded-[2rem] bg-slate-50 dark:bg-white/5">
                  <Terminal className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No security incidents detected in current cluster</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase mt-2">Historical logs might be archived or database is empty</p>
               </div>
            ) : (
              <div className="space-y-3">
                 {logsList.map((log: any) => (
                    <div key={log.id} className="flex items-center justify-between p-5 bg-app-bg border border-border-dim rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
                       <div className="flex items-center gap-5">
                          <div className={cn("p-3 rounded-xl", log.severity === 'high' ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-100 text-slate-500')}>
                             {log.severity === 'high' ? <ShieldAlert className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                          </div>
                          <div>
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{log.action}</span>
                                <span className={cn("px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest", log.severity === 'high' ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-600')}>{log.severity}</span>
                             </div>
                             <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">{log.details}</p>
                          </div>
                       </div>
                       <div className="text-right flex flex-col items-end">
                          <div className="flex items-center gap-2 text-[10px] font-black text-slate-700 dark:text-slate-300">
                             <User className="w-3 h-3 text-brand" /> {log.user_email || 'System'}
                          </div>
                          <div className="flex items-center gap-2 text-[8px] font-bold text-slate-400 uppercase mt-1">
                             <Clock className="w-3 h-3" /> {new Date(log.created_at).toLocaleString()}
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
            )}
         </div>
      </div>
    </div>
  );
}

function SecurityStatCard({ title, value, sub, icon: Icon, color }: any) {
  return (
    <div className="bg-card-bg border border-border-dim p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-2.5 rounded-xl bg-white dark:bg-white/5 border border-border-dim shadow-inner", color)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</h4>
      <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{value}</div>
      <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-tighter">{sub}</p>
    </div>
  );
}
