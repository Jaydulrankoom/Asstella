import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  CheckCircle,
  Wrench,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  TrendingDown,
  Clock,
  ShieldCheck,
  Truck,
  AlertCircle,
  FileText,
  ShoppingCart,
  Search,
  RotateCcw,
  Calendar,
  MapPin,
  Zap,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";

const categoryData = [
  { name: "IT Equipment", value: 3586, color: "#1a3ff0", percentage: "28.5%" },
  { name: "Machinery", value: 2781, color: "#0ecfb0", percentage: "22.1%" },
  { name: "Furniture", value: 1927, color: "#8b5cf6", percentage: "15.3%" },
  { name: "Vehicles", value: 1472, color: "#f5a623", percentage: "11.7%" },
  { name: "Electrical", value: 1086, color: "#e0334c", percentage: "8.6%" },
];

const trendData = [
  { month: "Dec 2023", purchaseValue: 180, bookValue: 140, depreciation: 40 },
  { month: "Jan 2024", purchaseValue: 195, bookValue: 152, depreciation: 43 },
  { month: "Feb 2024", purchaseValue: 210, bookValue: 160, depreciation: 50 },
  { month: "Mar 2024", purchaseValue: 225, bookValue: 165, depreciation: 60 },
  { month: "Apr 2024", purchaseValue: 240, bookValue: 168, depreciation: 72 },
  { month: "May 2024", purchaseValue: 245, bookValue: 168, depreciation: 77 },
];

const maintenanceCostData = [
  { month: "Dec 2023", cost: 3.2 },
  { month: "Jan 2024", cost: 3.8 },
  { month: "Feb 2024", cost: 4.1 },
  { month: "Mar 2024", cost: 4.7 },
  { month: "Apr 2024", cost: 4.2 },
  { month: "May 2024", cost: 4.9 },
];

const radarData = [
  { subject: "Quality", A: 120, B: 110, fullMark: 150 },
  { subject: "Response", A: 98, B: 130, fullMark: 150 },
  { subject: "Service", A: 86, B: 130, fullMark: 150 },
  { subject: "Cost Efficiency", A: 99, B: 100, fullMark: 150 },
  { subject: "SLA COMP", A: 85, B: 90, fullMark: 150 },
];

const healthData = [
  { x: 10, y: 30, z: 200, name: "IT" },
  { x: 100, y: 70, z: 400, name: "Machinery" },
  { x: 1000, y: 50, z: 300, name: "Furniture" },
  { x: 5000, y: 90, z: 500, name: "Vehicles" },
  { x: 10000, y: 25, z: 150, name: "Other" },
];

const riskMatrixData = [
  { val: 5, bg: "bg-rose-500" },
  { val: 8, bg: "bg-rose-500" },
  { val: 12, bg: "bg-rose-600" },
  { val: 9, bg: "bg-orange-500" },
  { val: 7, bg: "bg-orange-400" },
  { val: 6, bg: "bg-orange-500" },
  { val: 14, bg: "bg-emerald-500" },
  { val: 10, bg: "bg-emerald-500" },
  { val: 8, bg: "bg-emerald-400" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDate, setSelectedDate] = useState("2024-05-31");

  // Filter States
  const [filters, setFilters] = useState({
    company: "All Companies",
    branch: "All Branches",
    department: "All Departments",
    location: "All Locations",
    category: "All Categories",
  });

  const [kpis, setKpis] = useState({
    assets: { value: "12,586", sub: "8.4%", trend: "up" },
    value: { value: "$ 245.67M", sub: "6.7%", trend: "up" },
    book: { value: "$ 168.45M", sub: "5.5%", trend: "up" },
    depr: { value: "$ 77.22M", sub: "7.3%", trend: "up" },
    high: { value: "1,254", sub: "12.5%", trend: "up" },
    missing: { value: "48", sub: "4.0%", trend: "down" },
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    setIsSearching(true);
    // Simulate data fetching and changing based on filters
    setTimeout(() => {
      setIsSearching(false);
      // Update KPIs based on filters to show "responsiveness"
      const multiplier =
        filters.category === "IT Equipment"
          ? 0.3
          : filters.category === "Machinery"
            ? 0.25
            : filters.category === "Vehicles"
              ? 0.15
              : 1;

      setKpis({
        assets: {
          value: Math.floor(12586 * multiplier).toLocaleString(),
          sub: (8.4 * multiplier).toFixed(1) + "%",
          trend: "up",
        },
        value: {
          value: "$ " + (245.67 * multiplier).toFixed(2) + "M",
          sub: (6.7 * multiplier).toFixed(1) + "%",
          trend: "up",
        },
        book: {
          value: "$ " + (168.45 * multiplier).toFixed(2) + "M",
          sub: (5.5 * multiplier).toFixed(1) + "%",
          trend: "up",
        },
        depr: {
          value: "$ " + (77.22 * multiplier).toFixed(2) + "M",
          sub: (7.3 * multiplier).toFixed(1) + "%",
          trend: "up",
        },
        high: {
          value: Math.floor(1254 * multiplier).toLocaleString(),
          sub: (12.5 * multiplier).toFixed(1) + "%",
          trend: "up",
        },
        missing: {
          value: Math.floor(48 * multiplier).toLocaleString(),
          sub: (4 * multiplier).toFixed(1) + "%",
          trend: "down",
        },
      });
    }, 800);
  };

  const handleReset = () => {
    setSelectedDate("2024-05-31");
    setFilters({
      company: "All Companies",
      branch: "All Branches",
      department: "All Departments",
      location: "All Locations",
      category: "All Categories",
    });
    setKpis({
      assets: { value: "12,586", sub: "8.4%", trend: "up" },
      value: { value: "$ 245.67M", sub: "6.7%", trend: "up" },
      book: { value: "$ 168.45M", sub: "5.5%", trend: "up" },
      depr: { value: "$ 77.22M", sub: "7.3%", trend: "up" },
      high: { value: "1,254", sub: "12.5%", trend: "up" },
      missing: { value: "48", sub: "4.0%", trend: "down" },
    });
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-3 py-2 px-1 lg:h-[calc(100vh-84px)] animate-in fade-in duration-700 overflow-x-hidden lg:overflow-hidden",
        isSearching && "opacity-50 pointer-events-none",
      )}
      id="dashboard_viewport"
    >
      {/* 1. Header & Filters (Now fully functional and mobile responsive) */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 shrink-0"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
              Executive Dashboard
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              Real-time overview of your asset ecosystem
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="bg-card-bg border border-border-dim rounded-xl p-1 flex items-center lg:gap-2 shadow-sm overflow-x-auto no-scrollbar min-w-0">
              <FilterSelect
                id="f_comp"
                label="Company"
                options={["All Companies", "Global HQ", "Regional Office"]}
                value={filters.company}
                onChange={(v: string) => handleFilterChange("company", v)}
              />
              <FilterSelect
                id="f_branch"
                label="Branch"
                options={["All Branches", "New York", "London", "Tokyo"]}
                value={filters.branch}
                onChange={(v: string) => handleFilterChange("branch", v)}
              />
              <FilterSelect
                id="f_dept"
                label="Department"
                options={[
                  "All Departments",
                  "IT",
                  "HR",
                  "Finance",
                  "Operations",
                ]}
                value={filters.department}
                onChange={(v: string) => handleFilterChange("department", v)}
              />
              <FilterSelect
                id="f_loc"
                label="Location"
                options={["All Locations", "Floor 1", "Floor 2", "Warehouse A"]}
                value={filters.location}
                onChange={(v: string) => handleFilterChange("location", v)}
              />
              <FilterSelect
                id="f_cat"
                label="Asset Category"
                options={[
                  "All Categories",
                  "IT Equipment",
                  "Machinery",
                  "Furniture",
                  "Vehicles",
                ]}
                value={filters.category}
                onChange={(v: string) => handleFilterChange("category", v)}
              />
              <div className="hidden lg:block w-px h-4 bg-border-dim mx-1 shrink-0" />
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-white/5 rounded-lg border border-border-dim/30 mx-1 shrink-0">
                <Calendar className="w-3 h-3 text-brand" />
                <span className="text-[9px] font-black uppercase whitespace-nowrap">
                  01 May - 31 May 2024
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSearch}
                className="flex-1 sm:flex-none bg-brand text-white text-[10px] font-black px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-brand/20 uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all"
              >
                <Search className="w-3 h-3" /> Search
              </button>
              <button
                onClick={handleReset}
                className="flex-1 sm:flex-none bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-[10px] font-black px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 border border-border-dim uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 active:scale-95 transition-all"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>
          </div>
        </div>

        {/* 2. Primary KPI Ribbon (Responsive Grid) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <KPICard
            id="kpi_assets"
            label="Total Assets"
            value={kpis.assets.value}
            sub={kpis.assets.sub}
            trend={kpis.assets.trend}
            color="brand"
            icon={Package}
            delay={0.1}
          />
          <KPICard
            id="kpi_value"
            label="Total Asset Value"
            value={kpis.value.value}
            sub={kpis.value.sub}
            trend={kpis.value.trend}
            color="green"
            icon={TrendingUp}
            delay={0.2}
          />
          <KPICard
            id="kpi_book"
            label="Current Book Value"
            value={kpis.book.value}
            sub={kpis.book.sub}
            trend={kpis.book.trend}
            color="purple"
            icon={CheckCircle}
            delay={0.3}
          />
          <KPICard
            id="kpi_depr"
            label="Accumulated Depreciation"
            value={kpis.depr.value}
            sub={kpis.depr.sub}
            trend={kpis.depr.trend}
            color="orange"
            icon={TrendingUp}
            delay={0.4}
          />
          <KPICard
            id="kpi_high"
            label="High Value Assets"
            value={kpis.high.value}
            sub={kpis.high.sub}
            trend={kpis.high.trend}
            color="cyan"
            icon={ShieldCheck}
            delay={0.5}
          />
          <KPICard
            id="kpi_missing"
            label="Missing Assets"
            value={kpis.missing.value}
            sub={kpis.missing.sub}
            trend={kpis.missing.trend}
            color="red"
            icon={AlertTriangle}
            delay={0.6}
          />
        </div>

        {/* 3. Operational Min-Metrics Ribbon (Scrollable or Adaptive) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2">
          <MiniMetric
            icon={Wrench}
            label="Open Maintenance"
            value="156"
            color="blue"
          />
          <MiniMetric
            icon={Clock}
            label="Preventive Due"
            value="278"
            color="amber"
          />
          <MiniMetric
            icon={AlertCircle}
            label="Breakdown Assets"
            value="34"
            color="orange"
          />
          <MiniMetric
            icon={ShieldCheck}
            label="Warranty Expiring"
            value="62"
            color="rose"
          />
          <MiniMetric
            icon={FileText}
            label="AMC Renewal Due"
            value="19"
            color="orange"
          />
          <MiniMetric
            icon={CheckCircle}
            label="Audit Completion"
            value="78%"
            color="emerald"
          />
          <MiniMetric
            icon={Truck}
            label="Vehicles Online"
            value="42/68"
            color="cyan"
          />
          <MiniMetric
            icon={AlertTriangle}
            label="SLA Violations"
            value="15"
            color="red"
          />
        </div>
      </motion.div>

      {/* 4. Main Dashboard Body (Responsive Grid) */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 min-h-0">
        {/* Main Column (Charts) */}
        <div className="col-span-1 lg:col-span-8 xl:col-span-10 grid grid-cols-1 gap-3 min-h-0">
          {/* Row 1: Trend, Distribution, Maint Cost */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="h-[220px] lg:h-auto">
              <ChartCard title="Asset Value Trend" delay={0.2}>
                <div className="flex-1 min-h-0 pt-2 text-slate-400">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="currentColor"
                        className="opacity-10"
                      />
                      <XAxis
                        dataKey="month"
                        fontSize={8}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis fontSize={8} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          fontSize: "10px",
                          borderRadius: "8px",
                          backgroundColor: "var(--bg-card)",
                          border: "1px solid var(--border-dim)",
                        }}
                      />
                      <Legend
                        iconType="circle"
                        wrapperStyle={{ fontSize: "8px", paddingTop: "5px" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="purchaseValue"
                        stroke="#1a3ff0"
                        strokeWidth={2}
                        dot={false}
                        name="Purchase Value"
                      />
                      <Line
                        type="monotone"
                        dataKey="bookValue"
                        stroke="#0ecfb0"
                        strokeWidth={2}
                        dot={false}
                        name="Book Value"
                      />
                      <Line
                        type="monotone"
                        dataKey="depreciation"
                        stroke="#f5a623"
                        strokeWidth={2}
                        dot={false}
                        name="Depreciation"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>

            <div className="h-[220px] lg:h-auto">
              <ChartCard title="Asset Category Distribution" delay={0.3}>
                <div className="flex-1 min-h-0 flex items-center">
                  <div className="w-1/2 h-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          innerRadius="60%"
                          outerRadius="90%"
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {categoryData.map((e, i) => (
                            <Cell key={i} fill={e.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-sm font-black tracking-tighter">
                        {kpis.assets.value}
                      </span>
                      <span className="text-[6px] text-slate-500 font-bold uppercase whitespace-nowrap">
                        Total Assets
                      </span>
                    </div>
                  </div>
                  <div className="w-1/2 flex flex-col gap-1 pr-2">
                    {categoryData.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-[8px] font-bold text-slate-500 truncate uppercase">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-[9px] font-black shrink-0">
                          {item.percentage}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </ChartCard>
            </div>

            <div className="h-[220px] lg:h-auto md:col-span-2 lg:col-span-1">
              <ChartCard title="Maintenance Cost Trend" delay={0.4}>
                <div className="flex-1 min-h-0 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={maintenanceCostData}>
                      <XAxis
                        dataKey="month"
                        fontSize={8}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis fontSize={8} tickLine={false} axisLine={false} />
                      <Tooltip
                        cursor={{ fill: "currentColor", opacity: 0.05 }}
                      />
                      <Bar
                        dataKey="cost"
                        fill="#1a3ff0"
                        radius={[4, 4, 0, 0]}
                        barSize={25}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>
          </div>

          {/* Row 2: Audit, Risk, Vendor, Health (Responsive grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="h-[180px] lg:h-auto">
              <ChartCard title="Audit Compliance Score" delay={0.3}>
                <div className="flex-1 min-h-0 flex flex-col items-center justify-center">
                  <div className="relative w-32 h-20">
                    <svg viewBox="0 0 100 50" className="w-full h-full">
                      <path
                        d="M 10 45 A 35 35 0 0 1 90 45"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="10"
                        strokeLinecap="round"
                        className="dark:stroke-white/10"
                      />
                      <motion.path
                        initial={{ strokeDashoffset: 125.66 }}
                        animate={{ strokeDashoffset: 27.64 }}
                        transition={{
                          duration: 1.5,
                          delay: 0.5,
                          ease: "easeOut",
                        }}
                        d="M 10 45 A 35 35 0 0 1 90 45"
                        fill="none"
                        stroke="#0ecfb0"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray="125.66"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-1.5">
                      <span className="text-sm font-black leading-none">
                        78%
                      </span>
                      <span className="text-[7px] font-black text-slate-400 uppercase">
                        Completed
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 w-full mt-2 text-center">
                    <MetricMini label="Total" val="36" />
                    <MetricMini
                      label="Done"
                      val="28"
                      color="text-emerald-500"
                    />
                    <MetricMini
                      label="Pending"
                      val="6"
                      color="text-amber-500"
                    />
                    <MetricMini label="Overdue" val="2" color="text-red-500" />
                  </div>
                </div>
              </ChartCard>
            </div>

            <div className="h-[180px] lg:h-auto">
              <ChartCard title="Warranty & AMC Risk Matrix" delay={0.4}>
                <div className="flex-1 min-h-0 grid grid-cols-3 grid-rows-3 gap-1 p-2">
                  {riskMatrixData.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                      className={cn(
                        "rounded-lg flex items-center justify-center font-bold text-[9px] text-white shadow-sm",
                        item.bg,
                      )}
                    >
                      {item.val}
                    </motion.div>
                  ))}
                </div>
              </ChartCard>
            </div>

            <div className="h-[180px] lg:h-auto">
              <ChartCard title="Vendor Performance Score" delay={0.5}>
                <div className="flex-1 min-h-0 text-slate-400">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      cx="50%"
                      cy="50%"
                      outerRadius="70%"
                      data={radarData}
                    >
                      <PolarGrid strokeOpacity={0.1} stroke="currentColor" />
                      <PolarAngleAxis dataKey="subject" fontSize={7} />
                      <Radar
                        name="Vendor A"
                        dataKey="A"
                        stroke="#1a3ff0"
                        fill="#1a3ff0"
                        fillOpacity={0.5}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>

            <div className="h-[180px] lg:h-auto">
              <ChartCard title="Asset Health Score" delay={0.6}>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
                    >
                      <XAxis
                        type="number"
                        dataKey="x"
                        name="value"
                        unit="$"
                        hide
                      />
                      <YAxis
                        type="number"
                        dataKey="y"
                        name="health"
                        unit="%"
                        hide
                      />
                      <ZAxis type="number" dataKey="z" range={[10, 200]} />
                      <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                      <Scatter name="Assets" data={healthData} fill="#1a3ff0">
                        {healthData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              categoryData[index % categoryData.length]
                                ?.color || "#ccc"
                            }
                          />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>
          </div>

          {/* Row 3: GPS, Status, Forecast, Depreciation (Responsive) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="h-[160px] lg:h-auto">
              <ChartCard title="Vehicle GPS Live Map" delay={0.4}>
                <div className="flex-1 min-h-0 bg-slate-100 dark:bg-white/5 rounded-xl overflow-hidden relative border border-border-dim">
                  <img
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800"
                    className="w-full h-full object-cover opacity-50 grayscale contrast-125"
                    alt="Map Placeholder"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                    <MapPin className="w-4 h-4 text-red-500 absolute" />
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[7px] font-black text-white uppercase tracking-widest">
                    Live: NYC Sector 4
                  </div>
                </div>
              </ChartCard>
            </div>

            <div className="h-[160px] lg:h-auto">
              <ChartCard title="Vehicles Status Overview" delay={0.5}>
                <div className="flex-1 min-h-0 flex items-center">
                  <div className="w-1/2 h-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { v: 68, c: "#1a3ff0" },
                            { v: 16, c: "#e2e8f0" },
                            { v: 6, c: "#f5a623" },
                            { v: 4, c: "#e0334c" },
                          ]}
                          innerRadius="60%"
                          outerRadius="90%"
                          paddingAngle={0}
                          dataKey="v"
                        >
                          {[
                            { v: 68, c: "#1a3ff0" },
                            { v: 16, c: "#e2e8f0" },
                            { v: 6, c: "#f5a623" },
                            { v: 4, c: "#e0334c" },
                          ].map((e, i) => (
                            <Cell key={i} fill={e.c} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[10px] font-black">68</span>
                      <span className="text-[6px] font-bold text-slate-500 uppercase">
                        Total
                      </span>
                    </div>
                  </div>
                  <div className="w-1/2 flex flex-col gap-1">
                    <StatusLine label="Online" val="42" color="#1a3ff0" />
                    <StatusLine label="Offline" val="16" color="#94a3b8" />
                    <StatusLine label="Idle" val="6" color="#f5a623" />
                    <StatusLine label="Maint." val="4" color="#ef4444" />
                  </div>
                </div>
              </ChartCard>
            </div>

            <div className="h-[160px] lg:h-auto">
              <ChartCard title="Replacement Forecast" delay={0.6}>
                <div className="flex-1 min-h-0 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <XAxis dataKey="month" hide />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{ fontSize: "9px", borderRadius: "4px" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="purchaseValue"
                        stroke="#1a3ff0"
                        fill="#1a3ff0"
                        fillOpacity={0.15}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>

            <div className="bg-brand text-white rounded-xl p-4 flex flex-col justify-between shadow-xl shadow-brand/20 overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-blue-100/70">
                    Depreciation MTD
                  </h4>
                  <FileText className="w-3.5 h-3.5 text-blue-100/50 group-hover:rotate-12 transition-transform" />
                </div>
                <div className="text-2xl font-black tracking-tight leading-none">
                  $ 1.35M
                </div>
                <div className="text-[9px] font-bold text-emerald-300 flex items-center gap-1 mt-1 uppercase tracking-tight">
                  <ArrowUpRight className="w-3 h-3" /> 6.2% vs Last Month
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-2.5 mt-2 relative z-10">
                <div>
                  <div className="text-[7px] font-black uppercase text-blue-100/50 tracking-widest mb-0.5">
                    Entries
                  </div>
                  <div className="text-sm font-black">124</div>
                </div>
                <div>
                  <div className="text-[7px] font-black uppercase text-blue-100/50 tracking-widest mb-0.5">
                    Pending
                  </div>
                  <div className="text-sm font-black">8</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Intelligence (Alerts) - Adjusted for responsivity */}
        <div className="col-span-1 lg:col-span-4 xl:col-span-2 flex flex-col gap-3 min-h-[300px] lg:min-h-0">
          <div className="bg-card-bg border border-border-dim rounded-xl p-4 flex flex-col flex-1 min-h-0 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Smart Center
                </h3>
              </div>
              <button
                onClick={() => navigate("/app/notifications")}
                className="text-[8px] font-black text-brand uppercase tracking-widest cursor-pointer hover:underline"
              >
                Full Feed
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 no-scrollbar">
              <AlertItemSmall
                type="critical"
                title="Power Failure"
                desc="Generator #G-1250"
                time="10m"
              />
              <AlertItemSmall
                type="warning"
                title="Warranty Risk"
                desc="SLA breach #W-44"
                time="30m"
              />
              <AlertItemSmall
                type="error"
                title="GPS Breach"
                desc="Vehicle #V-239 off"
                time="45m"
              />
              <AlertItemSmall
                type="info"
                title="Insurance"
                desc="Group B renewal"
                time="1h"
              />
              <AlertItemSmall
                type="warning"
                title="AMC Warning"
                desc="HVAC contract exp."
                time="2h"
              />
              <AlertItemSmall
                type="critical"
                title="Asset Discrepancy"
                desc="Building C audit find"
                time="3h"
              />
              <AlertItemSmall
                type="error"
                title="SLA Missed"
                desc="Target missed: Zone 9"
                time="4h"
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shrink-0 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand/10 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-brand/20 transition-colors" />
            <div className="flex items-center justify-between mb-3 relative z-10">
              <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Quick Command
              </h3>
              <Zap className="w-3.5 h-3.5 text-brand" />
            </div>
            <div className="grid grid-cols-1 gap-1.5 relative z-10">
              <ActionBtn
                label="Onboard Asset"
                onClick={() => navigate("/app/assets?action=add")}
              />
              <ActionBtn
                label="Log Maintenance"
                onClick={() => navigate("/app/maintenance?action=create")}
              />
              <ActionBtn
                label="Verify Audit"
                onClick={() => navigate("/app/audit")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusLine({ label, val, color }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-[8px] font-bold text-slate-500 uppercase">
          {label}
        </span>
      </div>
      <span className="text-[9px] font-black">{val}</span>
    </div>
  );
}

function ActionBtn({ label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="w-full py-1 bg-white/5 border border-white/5 rounded text-[8px] font-black uppercase tracking-widest text-slate-300 hover:bg-brand hover:text-white hover:border-brand transition-all"
    >
      {label}
    </button>
  );
}

function AlertItemSmall({ type, title, desc, time }: any) {
  const icons: any = {
    critical: AlertTriangle,
    warning: Clock,
    error: AlertCircle,
    info: ShieldCheck,
  };
  const colors: any = {
    critical: "text-red-500 bg-red-500/10",
    warning: "text-amber-500 bg-amber-500/10",
    error: "text-orange-500 bg-orange-500/10",
    info: "text-blue-500 bg-blue-500/10",
  };
  const Icon = icons[type];
  return (
    <div className="flex items-start gap-2">
      <div
        className={cn(
          "w-6 h-6 rounded flex items-center justify-center shrink-0",
          colors[type],
        )}
      >
        <Icon className="w-3 h-3" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[9px] font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">
            {title}
          </span>
          <span className="text-[7px] text-slate-400 font-bold uppercase shrink-0">
            {time}
          </span>
        </div>
        <p className="text-[8px] text-slate-500 line-clamp-1 truncate">
          {desc}
        </p>
      </div>
    </div>
  );
}

function MetricMini({
  label,
  val,
  color = "text-slate-900 dark:text-white",
}: any) {
  return (
    <div className="flex flex-col">
      <span className="text-[6px] font-bold text-slate-400 uppercase leading-none mb-0.5">
        {label}
      </span>
      <span className={cn("text-[9px] font-black leading-none", color)}>
        {val}
      </span>
    </div>
  );
}

function ChartCard({ title, children, delay = 0 }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-card-bg border border-border-dim rounded-xl p-2.5 flex flex-col h-full overflow-hidden transition-colors duration-300 shadow-sm"
    >
      <div className="flex items-center justify-between mb-1.5 shrink-0">
        <h3 className="text-[8px] font-black text-slate-400 uppercase tracking-[0.1em]">
          {title}
        </h3>
        <div className="flex gap-0.5">
          <div className="w-0.5 h-0.5 rounded-full bg-slate-300" />
          <div className="w-0.5 h-0.5 rounded-full bg-slate-200" />
        </div>
      </div>
      {children}
    </motion.div>
  );
}

function KPICard({
  id,
  label,
  value,
  sub,
  trend,
  color,
  icon: Icon,
  delay = 0,
}: any) {
  const colorStyles: Record<string, string> = {
    brand: "text-brand",
    green: "text-emerald-500",
    purple: "text-purple-500",
    orange: "text-amber-500",
    cyan: "text-cyan-400",
    red: "text-red-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-card-bg border border-border-dim rounded-xl p-2 flex items-center gap-2.5 transition-all hover:shadow-md h-[48px]"
      id={id}
    >
      <div
        className={cn(
          "w-7 h-7 rounded flex items-center justify-center shrink-0",
          "bg-slate-100 dark:bg-white/5",
          colorStyles[color],
        )}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[7px] font-black text-slate-400 uppercase tracking-widest truncate leading-tight">
          {label}
        </div>
        <div className="flex items-baseline gap-1.5 leading-tight">
          <span className="text-xs font-black text-slate-900 dark:text-white tracking-tighter truncate">
            {value}
          </span>
          <span
            className={cn(
              "text-[7px] font-bold flex items-center shrink-0",
              trend === "up" ? "text-emerald-500" : "text-red-500",
            )}
          >
            {trend === "up" ? "↑" : "↓"}
            {sub}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function MiniMetric({ icon: Icon, label, value, color }: any) {
  const colors: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-500",
    amber: "bg-amber-500/10 text-amber-500",
    orange: "bg-orange-500/10 text-orange-500",
    rose: "bg-rose-500/10 text-rose-500",
    emerald: "bg-emerald-500/10 text-emerald-500",
    cyan: "bg-cyan-500/10 text-cyan-500",
    red: "bg-red-500/10 text-red-500",
  };

  return (
    <div className="bg-card-bg border border-border-dim rounded-lg px-2 py-1 flex items-center gap-2 min-w-max hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group">
      <div
        className={cn(
          "w-6 h-6 rounded flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
          colors[color],
        )}
      >
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex flex-col">
        <span className="text-[6px] font-black text-slate-400 uppercase tracking-[0.1em] leading-none mb-0.5">
          {label}
        </span>
        <div className="flex items-center gap-1 leading-none">
          <span className="text-[10px] font-black text-slate-900 dark:text-white">
            {value}
          </span>
          <span className="text-[6px] text-brand font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
            View
          </span>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ id, label, options, value, onChange }: any) {
  return (
    <div
      className="flex flex-col px-2.5 min-w-max border-r last:border-r-0 border-border-dim/30"
      id={`filter_container_${id}`}
    >
      <span className="text-[6px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] leading-none mb-1">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent border-none text-[9px] font-black text-slate-900 dark:text-white focus:outline-none transition-all appearance-none cursor-pointer p-0 h-3 leading-none truncate uppercase pr-4"
        id={id}
      >
        {options.map((opt: string) => (
          <option key={opt} value={opt} className="bg-white dark:bg-slate-900">
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
