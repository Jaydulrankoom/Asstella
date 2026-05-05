import React, { useEffect, useState } from "react";
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
} from "recharts";
import {
  Users,
  Activity,
  CreditCard,
  Building,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import api from "../../lib/api";

export default function PlatformDashboard() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [tenantData, setTenantData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [kpiRes, revenueRes, growthRes] = await Promise.all([
        api.get('/platform/dashboard/kpis'),
        api.get('/platform/dashboard/revenue-graph'),
        api.get('/platform/dashboard/tenant-growth'),
      ]);

      setKpis(kpiRes.data.data);
      setRevenueData(revenueRes.data.data);
      setTenantData(growthRes.data.data);
      
      if (kpiRes.data.data._action_required) {
        setError(kpiRes.data.data._error);
      }
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(err.response?.data?.message || err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchData();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <RefreshCw className="w-10 h-10 text-brand animate-spin" />
        <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Syncing Platform Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertTriangle className="w-12 h-12 text-rose-500" />
        <p className="text-slate-900 font-black uppercase tracking-tight">{error}</p>
        <button 
          onClick={fetchData}
          className="px-6 py-2 bg-brand text-white font-black rounded-xl text-xs uppercase tracking-widest"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            SaaS Overview
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Monitor platform health, revenue metrics, and tenant growth.
          </p>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-all text-xs font-black uppercase tracking-widest"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Monthly Recurring Revenue"
          value={`$${(kpis?.revenue?.mrr || 0).toLocaleString()}`}
          trend={`$${(kpis?.revenue?.revenue_this_month || 0).toLocaleString()} this month`}
          trendUp={true}
          icon={CreditCard}
        />
        <KpiCard
          title="Annual Recurring Revenue"
          value={`$${(kpis?.revenue?.arr || 0).toLocaleString()}`}
          trend="Projected based on current MRR"
          trendUp={true}
          icon={TrendingUp}
        />
        <KpiCard
          title="Active Tenants"
          value={kpis?.tenants?.active || 0}
          trend={`${kpis?.tenants?.new_this_month || 0} new this month`}
          trendUp={true}
          icon={Building}
        />
        <KpiCard
          title="Open Support Tickets"
          value={kpis?.platform?.open_support_tickets || 0}
          trend={`${kpis?.platform?.api_errors_24h || 0} API errors (24h)`}
          trendUp={false}
          icon={Activity}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-card-bg border border-border-dim rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-lg font-black uppercase tracking-tight">Revenue Growth (MRR)</h3>
              <p className="text-sm text-slate-500 font-bold uppercase text-[10px]">12-month trend projection</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `$${value / 1000}k`}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                />
                <RechartsTooltip
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "MRR"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Small Chart */}
        <div className="bg-card-bg border border-border-dim rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-lg font-black uppercase tracking-tight">Tenant Acquisition</h3>
              <p className="text-sm text-slate-500 font-bold uppercase text-[10px]">New tenants per month</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tenantData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <RechartsTooltip
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="new" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-card-bg border border-border-dim rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-4 font-black uppercase tracking-tight">System Health & Infrastructure</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-border-dim rounded-xl bg-emerald-50 dark:bg-emerald-900/10 flex items-start gap-4">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-800/30 rounded-lg shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-bold text-sm uppercase">API Gateway</p>
              <p className="text-[10px] text-slate-500 mt-1 uppercase font-black">{kpis?.platform?.uptime_percent}% Uptime • {kpis?.platform?.api_errors_24h} errors (24h)</p>
            </div>
          </div>
          <div className="p-4 border border-border-dim rounded-xl bg-emerald-50 dark:bg-emerald-900/10 flex items-start gap-4">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-800/30 rounded-lg shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-bold text-sm uppercase">Cloud Nodes</p>
              <p className="text-[10px] text-slate-500 mt-1 uppercase font-black">Healthy • 0 Suspicious Logins</p>
            </div>
          </div>
          <div className="p-4 border border-emerald-200 dark:border-emerald-900/50 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 flex items-start gap-4">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-800/30 rounded-lg shrink-0">
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-bold text-sm uppercase">Support SLA</p>
              <p className="text-[10px] text-slate-500 mt-1 uppercase font-black">{kpis?.platform?.open_support_tickets} Active Tickets • Within SLA</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, trend, trendUp, icon: Icon }: any) {
  return (
    <div className="bg-white dark:bg-white/5 border border-border-dim rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {title}
          </p>
          <h3 className="text-2xl font-black mt-1 text-slate-900 dark:text-white tracking-tighter">
            {value}
          </h3>
        </div>
        <div className="p-2 bg-brand/10 rounded-xl">
          <Icon className="w-5 h-5 text-brand" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1.5">
        <span
          className={cn(
            "text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter",
            trendUp
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
          )}
        >
          {trend}
        </span>
      </div>
    </div>
  );
}

