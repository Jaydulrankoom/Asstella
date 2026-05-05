import React, { useState, useMemo } from "react";
import {
  BarChart3,
  Download,
  Filter,
  Calendar,
  TrendingUp,
  PieChart as PieChartIcon,
  ArrowUpRight,
  FileText,
  Table as TableIcon,
  Search,
  ChevronDown,
  Activity,
  DollarSign,
  Package,
  ShieldCheck,
  Clock,
  Printer,
  Share2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { cn, downloadAsCSV } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";

// Mock Data for Charts
const acquisitionData = [
  { month: "Jan", hardware: 4500, software: 2400, furniture: 1200 },
  { month: "Feb", hardware: 3200, software: 1800, furniture: 900 },
  { month: "Mar", hardware: 6100, software: 4200, furniture: 2100 },
  { month: "Apr", hardware: 2800, software: 3100, furniture: 1500 },
  { month: "May", hardware: 4800, software: 2200, furniture: 1800 },
  { month: "Jun", hardware: 5200, software: 2800, furniture: 2400 },
];

const categoryDistrib = [
  { name: "IT Hardware", value: 45, color: "#DE3B40" }, // Brand color
  { name: "Software", value: 25, color: "#10b981" },
  { name: "Office Assets", value: 20, color: "#3b82f6" },
  { name: "Vehicles", value: 10, color: "#f59e0b" },
];

const maintenanceTrends = [
  { day: "Mon", count: 12 },
  { day: "Tue", count: 18 },
  { day: "Wed", count: 14 },
  { day: "Thu", count: 25 },
  { day: "Fri", count: 20 },
  { day: "Sat", count: 8 },
  { day: "Sun", count: 5 },
];

const reportTemplates = [
  {
    id: "RL-001",
    name: "Annual Depreciation Schedule",
    type: "Financial",
    status: "Ready",
  },
  {
    id: "RL-002",
    name: "Q2 Procurement Audit",
    type: "Procurement",
    status: "Recent",
  },
  {
    id: "RL-003",
    name: "IT Hardware Lifecycle",
    type: "Infrastructure",
    status: "Scheduled",
  },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("This Year");
  const [customDates, setCustomDates] = useState({
    start: "2024-01-01",
    end: "2024-12-31",
  });
  const [isExporting, setIsExporting] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  const filteredAcquisitionData = useMemo(() => {
    // Simulated filtering logic
    if (dateRange === "Last 30 Days") return acquisitionData.slice(-1);
    if (dateRange === "Last Quarter") return acquisitionData.slice(-3);
    if (dateRange === "Custom Range") {
      // In a real app, we would filter by the customDates.start/end
      // Here we just vary it for effect
      return acquisitionData.slice(0, 4);
    }
    return acquisitionData; // This Year
  }, [dateRange, customDates]);

  const kpis = useMemo(() => {
    const multi =
      dateRange === "Last 30 Days"
        ? 0.2
        : dateRange === "Last Quarter"
          ? 0.5
          : 1;
    return {
      value: (4.82 * multi).toFixed(2),
      age: (2.4 * multi).toFixed(1),
      ratio: (12.4 * multi).toFixed(1),
      score: (94.2).toFixed(1),
    };
  }, [dateRange]);

  const handleExport = (format: string) => {
    setIsExporting(true);
    setTimeout(() => {
      if (format === "csv") {
        downloadAsCSV(acquisitionData, "asset_master_report.csv");
      } else {
        // PDF/XLSX/ZIP would typically be server-side, but let's simulate a JSON/CSV export for now
        downloadAsCSV(acquisitionData, `report_${Date.now()}.${format}`);
      }
      setIsExporting(false);
    }, 1000);
  };

  return (
    <div
      className="space-y-8 animate-in slide-in-from-bottom-4 duration-500"
      id="reports_analytics_page"
    >
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex-1">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-brand" /> Intelligence Center
          </h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">
            Advanced lifecycle analytics and expenditure modeling
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-1 sm:flex-none bg-card-bg border border-border-dim rounded-2xl p-1 gap-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={cn(
                "flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === "overview"
                  ? "bg-brand text-white shadow-lg"
                  : "text-slate-500 hover:text-slate-900",
              )}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("financial")}
              className={cn(
                "flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === "financial"
                  ? "bg-brand text-white shadow-lg"
                  : "text-slate-500 hover:text-slate-900",
              )}
            >
              Financials
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
            {dateRange === "Custom Range" && (
              <div className="flex items-center gap-2 bg-card-bg border border-border-dim rounded-2xl px-3 py-1.5 shadow-sm animate-in fade-in slide-in-from-right-2">
                <input
                  type="date"
                  value={customDates.start}
                  onChange={(e) =>
                    setCustomDates({ ...customDates, start: e.target.value })
                  }
                  className="bg-transparent border-none text-[9px] font-black uppercase text-slate-500 outline-none w-24"
                />
                <span className="text-slate-300">/</span>
                <input
                  type="date"
                  value={customDates.end}
                  onChange={(e) =>
                    setCustomDates({ ...customDates, end: e.target.value })
                  }
                  className="bg-transparent border-none text-[9px] font-black uppercase text-slate-500 outline-none w-24"
                />
              </div>
            )}
            <div className="flex flex-1 sm:flex-none items-center gap-2 bg-card-bg border border-border-dim rounded-2xl px-4 py-2 shadow-sm">
              <Calendar className="w-4 h-4 text-brand" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="flex-1 bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-slate-500 focus:ring-0 cursor-pointer outline-none"
              >
                <option>Last 30 Days</option>
                <option>Last Quarter</option>
                <option>This Year</option>
                <option>Custom Range</option>
              </select>
            </div>
            <button
              className={cn(
                "w-full sm:w-auto px-6 sm:px-8 py-3 bg-brand text-white font-black rounded-2xl shadow-xl shadow-brand/20 active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2",
                isExporting && "opacity-70",
              )}
              onClick={() => handleExport("pdf")}
            >
              {isExporting ? (
                <Clock className="w-4 h-4 animate-spin" />
              ) : (
                <Printer className="w-4 h-4" />
              )}
              {isExporting ? "PROCESSING..." : "EXPORT SUMMARY"}
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Asset Value"
          value={`$ ${kpis.value}M`}
          trend="+4.2%"
          sub="Active appraisal"
          icon={DollarSign}
        />
        <KPICard
          title="Avg Asset Age"
          value={`${kpis.age} Yrs`}
          trend="-0.5"
          sub="Lifecycle health"
          icon={Activity}
          variant="success"
        />
        <KPICard
          title="Maintenance Ratio"
          value={`${kpis.ratio}%`}
          trend="+1.2%"
          sub="Total upkeep vs value"
          icon={Clock}
          variant="warning"
        />
        <KPICard
          title="Compliance Score"
          value={`${kpis.score}/100`}
          trend="+0.8%"
          sub="Audit readiness"
          icon={ShieldCheck}
          variant="success"
        />
      </div>

      {/* Intelligence Grid */}
      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Main Chart Area */}
            <div className="lg:col-span-2 space-y-8">
              <ChartWrapper
                title="Asset Acquisition Trends"
                sub={`Data range: ${dateRange === "Custom Range" ? `${customDates.start} to ${customDates.end}` : dateRange}`}
              >
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={filteredAcquisitionData}
                      margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorHard"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#DE3B40"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#DE3B40"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorSoft"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10b981"
                            stopOpacity={0.2}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="rgba(226, 232, 240, 0.4)"
                      />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 10,
                          fontWeight: 800,
                          fill: "#64748b",
                        }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 10,
                          fontWeight: 800,
                          fill: "#64748b",
                        }}
                        tickFormatter={(val) => `$${val / 1000}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          border: "none",
                          borderRadius: "12px",
                          color: "#fff",
                          fontSize: "12px",
                        }}
                        itemStyle={{ color: "#fff", fontWeight: 900 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="hardware"
                        stroke="#DE3B40"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorHard)"
                      />
                      <Area
                        type="monotone"
                        dataKey="software"
                        stroke="#10b981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorSoft)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </ChartWrapper>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ChartWrapper
                  title="Maintenance Volume"
                  sub="Weekly service ticket load"
                >
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={maintenanceTrends}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="rgba(226, 232, 240, 0.2)"
                        />
                        <XAxis
                          dataKey="day"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fontWeight: 700 }}
                        />
                        <YAxis hide />
                        <Tooltip
                          cursor={{ fill: "rgba(222, 59, 64, 0.05)" }}
                          contentStyle={{
                            borderRadius: "10px",
                            fontSize: "11px",
                          }}
                        />
                        <Bar
                          dataKey="count"
                          fill="#DE3B40"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartWrapper>

                <ChartWrapper
                  title="Audit Status"
                  sub="Compliance verification mapping"
                >
                  <div className="flex items-center justify-between h-[250px]">
                    <div className="flex-1 h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryDistrib}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {categoryDistrib.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: "10px" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-1/2 space-y-3 pr-4">
                      {categoryDistrib.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: item.color }}
                            ></div>
                            <span className="text-[9px] font-black uppercase text-slate-500">
                              {item.name}
                            </span>
                          </div>
                          <span className="text-[10px] font-black text-slate-900 dark:text-white">
                            {item.value}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </ChartWrapper>
              </div>
            </div>

            {/* Sidebar: Report Export Center */}
            <div className="space-y-6">
              <div className="bg-slate-900 text-white rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-40 h-40 bg-brand/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="relative z-10">
                  <FileText className="w-10 h-10 text-brand mb-6" />
                  <h3 className="text-2xl font-black uppercase tracking-tight leading-none mb-2">
                    Report Export Hub
                  </h3>
                  <p className="text-slate-400 text-xs font-bold leading-relaxed mb-8">
                    Generate certified data exports for external audits and
                    stakeholder management.
                  </p>

                  <div className="space-y-4">
                    <ExportAction
                      title="Asset Master List"
                      sub="Full audit-ready inventory CSV"
                      onClick={() => handleExport("csv")}
                      icon={TableIcon}
                    />
                    <ExportAction
                      title="Financial Statement"
                      sub="Depreciation & appraisal PDF"
                      onClick={() => handleExport("pdf")}
                      icon={DollarSign}
                    />
                    <ExportAction
                      title="Maintenance Log"
                      sub="Service history archive Excel"
                      onClick={() => handleExport("xlsx")}
                      icon={Activity}
                    />
                    <ExportAction
                      title="Compliance Package"
                      sub="Security & safety bundle ZIP"
                      onClick={() => handleExport("zip")}
                      icon={ShieldCheck}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-card-bg border border-border-dim rounded-[2.5rem] p-8 shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center justify-between">
                  Recent Activity <ChevronDown className="w-4 h-4" />
                </h3>
                <div className="space-y-6">
                  <ActivityItem
                    user="Sarah"
                    action="Generated Monthly Spend"
                    time="2h ago"
                    icon={TrendingUp}
                  />
                  <ActivityItem
                    user="System"
                    action="Depreciation Scheduled"
                    time="5h ago"
                    icon={Clock}
                  />
                  <ActivityItem
                    user="Admin"
                    action="Exported Audit Log"
                    time="1d ago"
                    icon={Download}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "financial" && (
          <motion.div
            key="financial"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <ChartWrapper
              title="Financial Appraisal History"
              sub="Book value vs replacement cost projection"
            >
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredAcquisitionData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="rgba(226, 232, 240, 0.4)"
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 800 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 800 }}
                    />
                    <Tooltip contentStyle={{ borderRadius: "12px" }} />
                    <Legend />
                    <Bar
                      dataKey="hardware"
                      name="Asset Value"
                      fill="#DE3B40"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="software"
                      name="Depreciation"
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartWrapper>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-card-bg border border-border-dim rounded-[2.5rem] p-10">
                <h3 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                  <Clock className="w-6 h-6 text-brand" /> Depreciation Matrix
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      name: "SLM Depreciation",
                      rate: "12%",
                      val: "$ 14,200/mo",
                    },
                    { name: "WTM Allowance", rate: "18%", val: "$ 22,500/mo" },
                    { name: "Tax Rebate (Est)", rate: "5%", val: "$ 5,400/mo" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-6 bg-app-bg border border-border-dim rounded-2xl"
                    >
                      <span className="text-xs font-black text-slate-500 uppercase">
                        {item.name}
                      </span>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900 dark:text-white">
                          {item.val}
                        </p>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase">
                          {item.rate} EFFICIENCY
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-900 rounded-[2.5rem] p-12 text-white flex flex-col justify-center text-center">
                <TrendingUp className="w-16 h-16 text-brand mx-auto mb-8 animate-bounce" />
                <h3 className="text-3xl font-black uppercase tracking-tight mb-4">
                  Optimise Your Taxes
                </h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10 max-w-sm mx-auto">
                  Our AI models suggest that switching to WTM depreciation for
                  IT assets could save you up to $45k this fiscal year.
                </p>
                <button className="py-5 px-10 bg-brand text-white font-black rounded-2xl shadow-2xl shadow-brand/40 uppercase tracking-widest text-xs self-center transition-all hover:scale-105 active:scale-95">
                  APPLY FINANCIAL OPTIMISATION
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function KPICard({ title, value, trend, sub, icon: Icon, variant }: any) {
  return (
    <div className="bg-card-bg border border-border-dim p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full -mr-16 -mt-16 group-hover:bg-brand/10 transition-all"></div>
      <div className="flex items-center justify-between mb-4 sm:mb-6 relative z-10">
        <div
          className={cn(
            "w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center border-4 border-app-bg shadow-xl",
            variant === "warning"
              ? "bg-amber-500 text-white"
              : variant === "success"
                ? "bg-emerald-500 text-white"
                : "bg-brand text-white",
          )}
        >
          <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
        {trend && (
          <span
            className={cn(
              "text-[9px] sm:text-[10px] font-black px-2 sm:px-3 py-1 rounded-full border uppercase tracking-widest",
              trend.startsWith("+")
                ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                : "text-amber-500 bg-amber-500/10 border-amber-500/20",
            )}
          >
            {trend}
          </span>
        )}
      </div>
      <div className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 relative z-10">
        {title}
      </div>
      <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter relative z-10">
        {value}
      </div>
      {sub && (
        <div className="text-[9px] sm:text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-widest opacity-60 underline decoration-brand/20">
          {sub}
        </div>
      )}
    </div>
  );
}

function ChartWrapper({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card-bg border border-border-dim rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-sm relative overflow-hidden group">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-10 border-b border-border-dim pb-6 gap-4">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            {title}
          </h3>
          <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
            {sub}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-all text-slate-400">
            <Printer className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-all text-slate-400">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}

function ExportAction({ title, sub, onClick, icon: Icon }: any) {
  return (
    <button
      onClick={onClick}
      className="w-full p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-between group/btn transition-all text-left"
    >
      <div className="flex items-center gap-5">
        <div className="w-10 h-10 rounded-xl bg-brand/20 flex items-center justify-center group-hover/btn:bg-brand group-hover/btn:text-white transition-all">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-black uppercase tracking-tight">
            {title}
          </div>
          <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
            {sub}
          </div>
        </div>
      </div>
      <ArrowUpRight className="w-5 h-5 text-slate-600 group-hover/btn:text-white transition-all" />
    </button>
  );
}

function ActivityItem({ user, action, time, icon: Icon }: any) {
  return (
    <div className="flex items-center gap-4 group/item">
      <div className="w-10 h-10 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center border border-border-dim shadow-inner group-hover/item:border-brand/40 transition-all">
        <Icon className="w-4 h-4 text-slate-400 group-hover/item:text-brand transition-colors" />
      </div>
      <div className="flex-1">
        <div className="text-[11px] font-black text-slate-900 dark:text-white uppercase leading-tight">
          {action}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[9px] font-bold text-slate-500 uppercase">
            {user}
          </span>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <span className="text-[9px] font-bold text-slate-400">{time}</span>
        </div>
      </div>
    </div>
  );
}
