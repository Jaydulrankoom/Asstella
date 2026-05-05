import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  CreditCard,
  RefreshCw,
  PieChart as PieIcon,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Calendar
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Cell,
  Pie
} from "recharts";
import { cn } from "@/src/lib/utils";
import api from "../../lib/api";

export default function PlatformAnalytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await api.get("/platform/analytics/growth");
      setData(response.data.data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <RefreshCw className="w-10 h-10 text-brand animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Aggregating Global SaaS Metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 uppercase">
            <BarChart3 className="w-8 h-8 text-brand" /> Ecosystem Growth
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Macro-level performance analysis across the multi-tenant architecture.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500">
          <Calendar className="w-3.5 h-3.5" /> Fiscal Year 2026
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <AnalyticsCard title="Net Tenant Growth" value={`+${data?.tenants_by_month?.reduce((acc: any, curr: any) => acc + curr.net, 0)}`} sub="Total new this year" icon={TrendingUp} color="text-emerald-500" />
         <AnalyticsCard title="Avg. Churn Rate" value={`${data?.churn_rate || 0.8}%`} sub="Last 30 day window" icon={Activity} color="text-brand" />
         <AnalyticsCard title="Revenue Expansion" value="+12.4%" sub="Upgrade/Expansion MRR" icon={ArrowUpRight} color="text-emerald-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-card-bg border border-border-dim rounded-[2.5rem] p-10 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Monthly Revenue Breakdown</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">MRR Composition by Month</p>
               </div>
            </div>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={data?.revenue_by_month}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `$${value / 1000}k`}
                        tick={{ fontSize: 10, fill: '#64748b' }}
                      />
                      <RechartsTooltip 
                        cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} 
                      />
                      <Bar dataKey="mrr" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={24} />
                      <Bar dataKey="new_mrr" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
                   </BarChart>
                </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-card-bg border border-border-dim rounded-[2.5rem] p-10 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Tenant Distribution</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">By Market Segment & Country</p>
               </div>
            </div>
            <div className="h-80 flex items-center justify-center">
                 <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-4">
                    <div className="space-y-4">
                       <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Plan Distribution</h5>
                       {data?.tenants_by_plan?.map((p: any, i: number) => (
                         <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                            <span className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400">{p.plan}</span>
                            <span className="text-sm font-black text-slate-900 dark:text-white">{p.percentage}%</span>
                         </div>
                       ))}
                    </div>
                    <div className="space-y-4">
                       <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Global Footprint</h5>
                       {data?.tenants_by_country?.map((c: any, i: number) => (
                         <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                            <span className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400">{c.country}</span>
                            <span className="text-sm font-black text-slate-900 dark:text-white">{c.count} Labs</span>
                         </div>
                       ))}
                    </div>
                 </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function AnalyticsCard({ title, value, sub, icon: Icon, color }: any) {
  return (
    <div className="bg-card-bg border border-border-dim p-8 rounded-[3rem] shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 rounded-full -mr-12 -mt-12 transition-all group-hover:scale-150"></div>
      <div className={cn("w-12 h-12 bg-white dark:bg-white/5 border border-border-dim rounded-2xl flex items-center justify-center mb-6 shadow-inner", color)}>
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</h4>
      <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</div>
      <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-tighter">{sub}</p>
    </div>
  );
}
