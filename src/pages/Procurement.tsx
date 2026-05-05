import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Plus,
  Search,
  FileText,
  ShoppingCart,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Filter,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  Users,
  Truck,
  X,
  Eye,
  Check,
  Ban,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface ProcurementItem {
  id: string;
  title: string;
  vendor: string;
  amount: string;
  status:
    | "Draft"
    | "Pending Approval"
    | "Approve"
    | "Ordered"
    | "Received"
    | "Cancelled";
  date: string;
  category: string;
  requester: string;
}

const initialProcurements: ProcurementItem[] = [
  {
    id: "PR-5021",
    title: "Standard Issue Dev Laptops x10",
    vendor: "Global Tech Solutions",
    amount: "$ 18,500.00",
    status: "Pending Approval",
    date: "02 May 2024",
    category: "Hardware",
    requester: "Sarah Jenkins",
  },
  {
    id: "PR-4998",
    title: "Office Chair Ergonomic x25",
    vendor: "Modern Spaces Ltd",
    amount: "$ 6,250.00",
    status: "Received",
    date: "28 Apr 2024",
    category: "Furniture",
    requester: "Admin Office",
  },
  {
    id: "PR-5015",
    title: "Cisco Core Switch Upgrade",
    vendor: "NetWorks Pro",
    amount: "$ 12,400.00",
    status: "Ordered",
    date: "01 May 2024",
    category: "Network",
    requester: "IT Infrastructure",
  },
  {
    id: "PR-4850",
    title: "Cloud Storage Seasonal Sub",
    vendor: "AWS Asia",
    amount: "$ 2,100.00",
    status: "Approve",
    date: "15 Apr 2024",
    category: "Software",
    requester: "Engineering",
  },
];

export default function ProcurementPage() {
  const navigate = useNavigate();
  const [procurements, setProcurements] =
    useState<ProcurementItem[]>(initialProcurements);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPR, setSelectedPR] = useState<ProcurementItem | null>(null);

  const filteredProcurements = procurements.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.vendor.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === "all") return matchesSearch;
    return matchesSearch && p.status.toLowerCase() === filter.toLowerCase();
  });

  const handleUpdatePR = (updatedPR: ProcurementItem) => {
    setProcurements((prev) =>
      prev.map((p) => (p.id === updatedPR.id ? updatedPR : p)),
    );
    if (selectedPR?.id === updatedPR.id) {
      setSelectedPR(updatedPR);
    }
  };

  return (
    <div
      className="space-y-6 animate-in slide-in-from-bottom-4 duration-500"
      id="procurement_page"
    >
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-brand" /> Procurement & Supply
          </h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">
            Acquisition lifecycle and strategic vendor sourcing
          </p>
        </div>
        <button
          className="w-full xl:w-auto px-6 sm:px-8 py-3.5 bg-brand text-white font-black rounded-2xl shadow-xl shadow-brand/20 active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-4 h-4" /> CREATE REQUISITION
        </button>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <ProcurementCard
          title="Total Spend YTD"
          value="$ 2.4M"
          trend="+12%"
          icon={DollarSign}
        />
        <ProcurementCard
          title="Pending Approvals"
          value={procurements
            .filter((p) => p.status === "Pending Approval")
            .length.toString()}
          sub="Requiring action"
          icon={Clock}
          variant="warning"
        />
        <ProcurementCard
          title="Active Vendors"
          value="48"
          sub="Global supply chain"
          icon={Users}
        />
        <ProcurementCard
          title="On-Time Delivery"
          value="96.4%"
          trend="+3.2%"
          icon={Truck}
          variant="success"
        />
      </div>

      {/* Filters & Actions */}
      <div className="bg-card-bg border border-border-dim rounded-2xl p-2 sm:p-3 flex flex-col xl:flex-row xl:items-center gap-3 shadow-sm transition-colors duration-300">
        <div className="w-full xl:flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by PR #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-app-bg border border-border-dim rounded-xl pl-9 pr-4 py-2.5 text-xs font-medium focus:ring-1 focus:ring-brand/40 outline-none"
          />
        </div>
        <div className="flex items-center gap-3 w-full xl:w-auto">
          <div className="flex-1 xl:flex-none flex items-center gap-2 px-3 py-2 border border-border-dim rounded-xl xl:border-none xl:rounded-none pr-2 xl:border-r">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex-1 xl:flex-none bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-slate-500 focus:ring-0 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="pending approval">Approvals</option>
              <option value="ordered">Ordered</option>
              <option value="received">Received</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 text-slate-500 hover:text-brand transition-all border border-border-dim rounded-xl xl:border-none xl:rounded-none">
            <FileText className="w-3.5 h-3.5" />{" "}
            <span className="text-[10px] font-black uppercase tracking-widest">
              PDF Export
            </span>
          </button>
        </div>
      </div>

      <div className="bg-card-bg border border-border-dim rounded-[1.5rem] sm:rounded-[2rem] shadow-xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-border-dim bg-slate-50/50 dark:bg-white/5 flex items-center justify-between">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Package className="w-4 h-4" /> Requisitions
          </h3>
          <span className="text-[10px] font-black text-slate-300">
            Total {filteredProcurements.length}
          </span>
        </div>
        <div className="divide-y divide-border-dim">
          {filteredProcurements.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center">
              <ShoppingCart className="w-12 h-12 text-slate-200 mb-4" />
              <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">
                No procurement records matching search
              </p>
            </div>
          ) : (
            filteredProcurements.map((pr) => (
              <div
                key={pr.id}
                className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-brand/5 transition-all group cursor-pointer"
                onClick={() => setSelectedPR(pr)}
              >
                <div className="flex items-center gap-4 sm:gap-6">
                  <div
                    className={cn(
                      "w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center border-4 border-app-bg shadow-xl transition-transform group-hover:scale-110",
                      pr.status === "Received"
                        ? "bg-emerald-500 text-white"
                        : pr.status === "Pending Approval"
                          ? "bg-brand text-white"
                          : pr.status === "Cancelled"
                            ? "bg-rose-500 text-white"
                            : pr.status === "Approve"
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-400 text-white",
                    )}
                  >
                    <FileText className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[10px] font-black text-brand uppercase tracking-tighter font-mono">
                      {pr.id}
                    </span>
                    <span className="text-sm sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-brand transition-colors uppercase tracking-tight truncate">
                      {pr.title}
                    </span>
                    <div className="hidden sm:flex items-center gap-3 text-[10px] text-slate-500 mt-1 font-black uppercase tracking-widest">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const vMap: Record<string, string> = {
                            "Global Tech Solutions": "VEN-001",
                            "Modern Spaces Ltd": "VEN-002",
                            "NetWorks Pro": "VEN-003",
                            "Cheap Gadgets Co.": "VEN-004",
                          };
                          const vId = vMap[pr.vendor] || "VEN-001";
                          navigate(`/vendors/${vId}`);
                        }}
                        className="flex items-center gap-1.5 hover:text-brand transition-colors"
                      >
                        <Users className="w-3.5 h-3.5 text-brand" /> {pr.vendor}
                      </button>
                      <span className="opacity-20">|</span>
                      <span>{pr.category}</span>
                      <span className="opacity-20">|</span>
                      <span className="text-brand/80">{pr.requester}</span>
                    </div>
                    <div className="sm:hidden flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-bold text-slate-500 truncate">
                        {pr.vendor}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[9px] font-bold text-slate-400">
                        {pr.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-10 border-t border-border-dim/50 sm:border-0 pt-3 sm:pt-0">
                  <div className="flex flex-col sm:items-end">
                    <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tighter">
                      {pr.amount}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={pr.status} />
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest opacity-60">
                        {pr.date}
                      </span>
                    </div>
                  </div>
                  <button className="hidden sm:block p-3 bg-app-bg border border-border-dim rounded-xl text-slate-300 opacity-0 group-hover:opacity-100 group-hover:bg-brand group-hover:text-white group-hover:border-brand transition-all shadow-xl">
                    <ArrowUpRight className="w-5 h-5" />
                  </button>
                  <ChevronRight className="sm:hidden w-5 h-5 text-slate-300" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isModalOpen && (
          <CreatePRModal
            onClose={() => setIsModalOpen(false)}
            onSave={(newPR: any) => {
              setProcurements((prev) => [
                {
                  ...newPR,
                  id: `PR-${Math.floor(Math.random() * 900) + 5000}`,
                  status: "Pending Approval",
                  date: "Now",
                },
                ...prev,
              ]);
              setIsModalOpen(false);
            }}
          />
        )}
        {selectedPR && (
          <PRDetailModal
            pr={selectedPR}
            onClose={() => setSelectedPR(null)}
            onUpdate={handleUpdatePR}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ProcurementCard({
  title,
  value,
  trend,
  sub,
  icon: Icon,
  variant,
}: any) {
  return (
    <div className="bg-card-bg border border-border-dim p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] shadow-xl relative overflow-hidden group">
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
          <span className="text-[9px] sm:text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 sm:px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">
            {trend}
          </span>
        )}
      </div>
      <div className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 relative z-10">
        {title}
      </div>
      <div className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight relative z-10">
        {value}
      </div>
      {sub && (
        <div className="text-[9px] sm:text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-widest opacity-60 relative z-10">
          {sub}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Pending Approval": "bg-brand/10 text-brand",
    Received: "bg-emerald-500/10 text-emerald-500",
    Ordered: "bg-blue-500/10 text-blue-500",
    Draft: "bg-slate-500/10 text-slate-500",
    Cancelled: "bg-rose-500/10 text-rose-500",
    Approve: "bg-emerald-500/10 text-emerald-500",
  };
  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
        styles[status],
      )}
    >
      {status}
    </span>
  );
}

function CreatePRModal({ onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    title: "",
    vendor: "",
    amount: "$ ",
    category: "Hardware",
    requester: "Admin",
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-app-bg border border-border-dim w-full max-w-xl rounded-none sm:rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] relative h-full sm:h-auto overflow-y-auto"
      >
        {/* Absolute Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 p-2 sm:p-2.5 bg-slate-100 dark:bg-white/10 hover:bg-brand hover:text-white rounded-xl border border-border-dim transition-all shadow-lg group"
        >
          <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
        </button>

        <div className="p-6 sm:p-8 border-b border-border-dim flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
          <div className="flex items-center gap-4">
            <div className="p-2 sm:p-3 bg-brand text-white rounded-xl sm:rounded-2xl shadow-xl shadow-brand/20">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="font-black text-lg sm:text-xl uppercase tracking-tight text-slate-900 dark:text-white">
              New Requisition
            </h3>
          </div>
        </div>
        <div className="p-6 sm:p-10 space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
              Description / Title
            </label>
            <input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full bg-card-bg p-4 rounded-xl sm:rounded-2xl text-sm font-bold border border-border-dim outline-none uppercase"
              placeholder="E.G. SERVER MAINTENANCE RENEWAL"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                Vendor
              </label>
              <input
                value={formData.vendor}
                onChange={(e) =>
                  setFormData({ ...formData, vendor: e.target.value })
                }
                className="w-full bg-card-bg p-4 rounded-xl sm:rounded-2xl text-sm font-bold border border-border-dim outline-none uppercase"
                placeholder="PREFERRED VENDOR"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                Est. Amount
              </label>
              <input
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="w-full bg-card-bg p-4 rounded-xl sm:rounded-2xl text-sm font-bold border border-border-dim outline-none font-black"
                placeholder="$ 0.00"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full bg-card-bg p-4 rounded-xl sm:rounded-2xl text-sm font-bold border border-border-dim outline-none uppercase"
              >
                <option>Hardware</option>
                <option>Software</option>
                <option>Furniture</option>
                <option>Infrastructure</option>
                <option>Others</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                Requester
              </label>
              <input
                value={formData.requester}
                onChange={(e) =>
                  setFormData({ ...formData, requester: e.target.value })
                }
                className="w-full bg-card-bg p-4 rounded-xl sm:rounded-2xl text-sm font-bold border border-border-dim outline-none uppercase"
                placeholder="NAME/DEPT"
              />
            </div>
          </div>
          <button
            onClick={() => onSave(formData)}
            className="w-full py-4 sm:py-5 bg-brand text-white font-black rounded-xl sm:rounded-2xl shadow-2xl shadow-brand/30 active:scale-95 transition-all uppercase tracking-[0.2em] text-[10px] sm:text-xs mt-4 sm:mt-6"
          >
            SUBMIT REQUISITION
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function PRDetailModal({
  pr,
  onClose,
  onUpdate,
}: {
  pr: ProcurementItem;
  onClose: () => void;
  onUpdate: (p: ProcurementItem) => void;
}) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-app-bg border border-border-dim w-full max-w-2xl rounded-none sm:rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] relative h-full sm:h-auto overflow-y-auto"
      >
        {/* Absolute Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-8 sm:right-8 z-50 p-2 sm:p-3 bg-slate-100 dark:bg-white/10 hover:bg-brand hover:text-white rounded-xl sm:rounded-2xl border border-border-dim transition-all shadow-lg group"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-300" />
        </button>

        <div className="p-6 sm:p-8 border-b border-border-dim flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
          <div className="flex items-center gap-4">
            <div className="p-2 sm:p-3 bg-brand text-white rounded-xl sm:rounded-2xl shadow-xl shadow-brand/20">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] font-black text-brand uppercase tracking-widest font-mono">
                {pr.id}
              </span>
              <h3 className="font-black text-lg sm:text-xl uppercase tracking-tight text-slate-900 dark:text-white">
                Requisition Detail
              </h3>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-10 space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Requisition Title
              </h4>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase leading-tight">
                {pr.title}
              </p>
            </div>
            <div className="sm:text-right">
              <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Est. Amount
              </h4>
              <p className="text-2xl sm:text-3xl font-black text-brand">
                {pr.amount}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="space-y-1">
              <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Vendor
              </h4>
              <button
                onClick={() => {
                  const vMap: Record<string, string> = {
                    "Global Tech Solutions": "VEN-001",
                    "Modern Spaces Ltd": "VEN-002",
                    "NetWorks Pro": "VEN-003",
                    "Cheap Gadgets Co.": "VEN-004",
                  };
                  const vId = vMap[pr.vendor] || "VEN-001";
                  navigate(`/vendors/${vId}`);
                }}
                className="font-black text-slate-900 dark:text-white uppercase flex items-center gap-1.5 hover:text-brand transition-colors text-left text-xs sm:text-sm"
              >
                <Users className="w-3.5 h-3.5 text-brand" /> {pr.vendor}
              </button>
            </div>
            <div className="space-y-1">
              <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Department
              </h4>
              <p className="font-black text-slate-900 dark:text-white uppercase text-xs sm:text-sm">
                {pr.requester}
              </p>
            </div>
            <div className="space-y-1 sm:text-right col-span-2 sm:col-span-1">
              <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Status
              </h4>
              <StatusBadge status={pr.status} />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-white/5 border border-border-dim rounded-2xl sm:rounded-[1.5rem] p-4 sm:p-6 space-y-4">
            <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 underline">
              <TrendingUp className="w-3.5 h-3.5" /> Approval Workflow
            </h4>
            <div className="space-y-4 relative pl-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-brand/20">
              <div className="relative flex items-center justify-between">
                <div className="absolute left-[-21px] w-[13px] h-[13px] bg-emerald-500 rounded-full border-2 border-app-bg shadow-lg"></div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase text-slate-900 dark:text-white">
                  Dept Head Approval
                </span>
                <span className="text-[8px] sm:text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                  Approved
                </span>
              </div>
              <div className="relative flex items-center justify-between opacity-60">
                <div className="absolute left-[-21px] w-[13px] h-[13px] bg-brand rounded-full border-2 border-app-bg shadow-lg animate-pulse"></div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase text-slate-900 dark:text-white">
                  Finance Verification
                </span>
                <span className="text-[8px] sm:text-[9px] font-bold text-brand uppercase tracking-widest">
                  Pending
                </span>
              </div>
              <div className="relative flex items-center justify-between opacity-30">
                <div className="absolute left-[-21px] w-[13px] h-[13px] bg-slate-300 rounded-full border-2 border-app-bg shadow-lg"></div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase text-slate-900 dark:text-white">
                  CFO Authorization
                </span>
                <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest hover:text-brand">
                  Waiting
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 pb-4">
            {pr.status === "Pending Approval" && (
              <>
                <button
                  onClick={() => onUpdate({ ...pr, status: "Cancelled" })}
                  className="w-full sm:flex-1 py-4 bg-rose-500/10 text-rose-500 border border-rose-500/20 font-black rounded-2xl hover:bg-rose-500 hover:text-white transition-all text-[10px] sm:text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Ban className="w-4 h-4" /> REJECT
                </button>
                <button
                  onClick={() => onUpdate({ ...pr, status: "Approve" })}
                  className="w-full sm:flex-1 py-4 bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all text-[10px] sm:text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> AUTHORIZE
                </button>
              </>
            )}
            {pr.status === "Approve" && (
              <button
                onClick={() => onUpdate({ ...pr, status: "Ordered" })}
                className="w-full py-4 bg-brand text-white font-black rounded-2xl shadow-xl shadow-brand/20 text-[10px] sm:text-xs uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" /> CONVERT TO PURCHASE ORDER
              </button>
            )}
            {pr.status === "Ordered" && (
              <button
                onClick={() => onUpdate({ ...pr, status: "Received" })}
                className="w-full py-4 bg-brand text-white font-black rounded-2xl shadow-xl shadow-brand/20 text-[10px] sm:text-xs uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <Truck className="w-4 h-4" /> CONFIRM RECEIPT (GRN)
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full sm:w-auto p-4 bg-app-bg border border-border-dim rounded-2xl text-slate-400 hover:text-brand transition-all flex items-center justify-center"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
