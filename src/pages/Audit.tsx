import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Plus, 
  Search, 
  FileBarChart, 
  Calendar, 
  CheckSquare, 
  AlertTriangle, 
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  Scan,
  MoreVertical,
  History,
  X,
  FileCheck,
  Maximize
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

interface AuditItem {
  id: string;
  assetName: string;
  category: string;
  lastVerified: string;
  status: "Verified" | "Missing" | "Pending";
}

interface Audit {
  id: string;
  title: string;
  location: string;
  type: "Physical Check" | "Financial Audit" | "Systems Check";
  status: "In-Progress" | "Completed" | "Pending";
  dueDate: string;
  completion: number;
  items: AuditItem[];
}

const initialAudits: Audit[] = [
  { 
    id: "AUD-201", 
    title: "Quarterly IT Assets Verification", 
    location: "Main HQ", 
    type: "Physical Check", 
    status: "In-Progress", 
    dueDate: "30 June 2024", 
    completion: 65,
    items: [
      { id: "AST-1001", assetName: "Dell XPS 15 - Dev Lab", category: "Laptops", lastVerified: "15 Apr 2024", status: "Verified" },
      { id: "AST-1002", assetName: "MacBook Pro M3 - UI Team", category: "Laptops", lastVerified: "Now", status: "Verified" },
      { id: "AST-1003", assetName: "Sony Alpha A7 - Marketing", category: "Equipment", lastVerified: "Pending", status: "Pending" },
      { id: "AST-1004", assetName: "Epson Projector P5", category: "Office", lastVerified: "Pending", status: "Missing" },
    ]
  },
  { 
    id: "AUD-212", 
    title: "Fixed Asset Depreciation Verify", 
    location: "Accounts Dept", 
    type: "Financial Audit", 
    status: "Completed", 
    dueDate: "15 June 2024", 
    completion: 100,
    items: [
      { id: "AST-9001", assetName: "Company Vehicle V-12", category: "Vehicles", lastVerified: "12 May 2024", status: "Verified" },
      { id: "AST-9005", assetName: "Server Rack Alpha", category: "Infrastructure", lastVerified: "11 May 2024", status: "Verified" },
    ]
  },
  { 
    id: "AUD-230", 
    title: "Server Room Hardware Audit", 
    location: "DC-01", 
    type: "Systems Check", 
    status: "Pending", 
    dueDate: "10 July 2024", 
    completion: 0,
    items: []
  },
];

export default function AuditPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [audits, setAudits] = useState<Audit[]>(initialAudits);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (searchParams.get("action") === "start") {
      setIsModalOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const filteredAudits = audits.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.id.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === "all") return matchesSearch;
    return matchesSearch && a.status.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500" id="audit_page">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase flex items-center gap-3">
             <ShieldCheck className="w-8 h-8 text-brand" /> Audit & Compliance
          </h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Verify asset accuracy and regulatory compliance benchmarks</p>
        </div>
        <button 
          className="w-full md:w-auto px-6 sm:px-8 py-3.5 bg-brand text-white font-black rounded-2xl shadow-xl shadow-brand/20 active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-4 h-4" /> INITIATE NEW AUDIT
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ComplianceCard title="Total Compliance" value="94.2%" trend="+2.1%" icon={CheckCircle2} />
        <ComplianceCard title="Active Audits" value={audits.filter(a => a.status === "In-Progress").length.toString()} sub="Verified recently" icon={Clock} />
        <ComplianceCard title="Risk Flagged" value="12" sub="Requires attention" icon={AlertTriangle} variant="danger" />
      </div>

      {/* Filters & Actions */}
      <div className="bg-card-bg border border-border-dim rounded-[1.5rem] p-3 flex flex-wrap items-center gap-4 shadow-sm">
         <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search audits by ID or title..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-app-bg border border-border-dim rounded-xl pl-9 pr-4 py-2.5 text-xs font-medium focus:ring-1 focus:ring-brand/40 outline-none"
            />
         </div>
         <div className="flex items-center gap-2 pr-2 border-r border-border-dim">
           <Filter className="w-4 h-4 text-slate-400" />
           <select 
             value={filter}
             onChange={(e) => setFilter(e.target.value)}
             className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-slate-500 focus:ring-0 cursor-pointer"
           >
             <option value="all">All Batches</option>
             <option value="in-progress">In Progress</option>
             <option value="completed">Completed</option>
             <option value="pending">Upcoming</option>
           </select>
         </div>
         <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-white/5 border border-border-dim rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-brand transition-all">
            <History className="w-3.5 h-3.5" /> History
         </button>
      </div>

      <div className="bg-card-bg border border-border-dim rounded-[2rem] shadow-xl overflow-hidden">
        <div className="p-6 border-b border-border-dim bg-slate-50/50 dark:bg-white/5 flex items-center justify-between">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <FileBarChart className="w-4 h-4" /> Scheduled Audit Batches
          </h3>
          <span className="text-[10px] font-black text-slate-300">Total: {filteredAudits.length}</span>
        </div>
        <div className="divide-y divide-border-dim">
          {filteredAudits.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center">
              <Search className="w-12 h-12 text-slate-200 mb-4" />
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No matching audits found</p>
            </div>
          ) : (
            filteredAudits.map(audit => (
              <div 
                key={audit.id} 
                className={cn(
                  "p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-brand/5 transition-all group cursor-pointer",
                  audit.status === "In-Progress" && "border-l-4 border-l-brand"
                )}
                onClick={() => setSelectedAudit(audit)}
              >
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center border-4 border-app-bg shadow-xl",
                    audit.status === "Completed" ? "bg-emerald-500 text-white" :
                    audit.status === "In-Progress" ? "bg-brand text-white" :
                    "bg-slate-400 text-white"
                  )}>
                    <CheckSquare className="w-7 h-7" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-brand uppercase tracking-tighter font-mono">{audit.id}</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white group-hover:text-brand transition-colors">{audit.title}</span>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1 font-black uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-brand" /> {audit.dueDate}</span>
                      <span className="opacity-20">|</span>
                      <span>{audit.location}</span>
                      <span className="opacity-20">|</span>
                      <span className="text-brand/80">{audit.type}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-10">
                  <div className="flex flex-col items-end gap-2 w-48">
                    <div className="flex items-center justify-between w-full text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      <span>{audit.status}</span>
                      <span className="text-slate-900 dark:text-white">{audit.completion}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden border border-border-dim">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${audit.completion}%` }}
                        className={cn(
                          "h-full rounded-full transition-all duration-1000",
                          audit.status === "Completed" ? "bg-emerald-500" : "bg-brand"
                        )}
                      />
                    </div>
                  </div>

                  <button className="p-3 bg-app-bg border border-border-dim rounded-xl text-slate-100 opacity-0 group-hover:opacity-100 group-hover:bg-brand group-hover:text-white group-hover:border-brand transition-all shadow-xl">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <AuditModal 
            onClose={() => setIsModalOpen(false)} 
            onSave={(a: any) => {
              setAudits(prev => [{...a, id: `AUD-${Math.floor(Math.random() * 900) + 300}`, status: "Pending", completion: 0, items: []}, ...prev]);
              setIsModalOpen(false);
            }} 
          />
        )}
        {selectedAudit && (
          <AuditExecutionModal 
            audit={selectedAudit} 
            onClose={() => setSelectedAudit(null)} 
            onUpdate={(updatedAudit: Audit) => {
              setAudits(prev => prev.map(a => a.id === updatedAudit.id ? updatedAudit : a));
              setSelectedAudit(updatedAudit);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ComplianceCard({ title, value, trend, sub, icon: Icon, variant }: any) {
  return (
    <div className="bg-card-bg border border-border-dim p-8 rounded-[2rem] shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full -mr-16 -mt-16 group-hover:bg-brand/10 transition-all"></div>
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center border-4 border-app-bg shadow-xl",
          variant === "danger" ? "bg-rose-500 text-white" : "bg-brand text-white"
        )}>
          <Icon className="w-7 h-7" />
        </div>
        {trend && (
          <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">
            {trend}
          </span>
        )}
      </div>
      <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 relative z-10">{title}</div>
      <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tight relative z-10">{value}</div>
      {sub && <div className="text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-widest opacity-60">{sub}</div>}
    </div>
  );
}

function AuditModal({ onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    title: "",
    location: "Main HQ",
    type: "Physical Check",
    dueDate: new Date().toLocaleDateString('en-GB')
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-app-bg border border-border-dim w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
        {/* Absolute Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-50 p-2.5 bg-slate-100 dark:bg-white/10 hover:bg-brand hover:text-white rounded-xl border border-border-dim transition-all shadow-lg group"
        >
          <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
        </button>

        <div className="p-8 border-b border-border-dim flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-brand text-white rounded-2xl shadow-xl shadow-brand/20">
                <FileCheck className="w-6 h-6" />
             </div>
             <h3 className="font-black text-xl uppercase tracking-tight text-slate-900 dark:text-white">Initiate New Batch</h3>
          </div>
        </div>
        <div className="p-10 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Audit Batch Title</label>
            <input 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              className="w-full bg-card-bg p-4 rounded-2xl text-sm font-bold border border-border-dim focus:outline-none focus:ring-2 focus:ring-brand/40 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-inner" 
              placeholder="e.g. Q4 2024 Server Verification" 
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Type</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})} className="w-full bg-card-bg p-4 rounded-2xl text-sm font-bold border border-border-dim shadow-inner cursor-pointer">
                <option>Physical Check</option>
                <option>Financial Audit</option>
                <option>Systems Check</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Target Deadline</label>
              <input value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full bg-card-bg p-4 rounded-2xl text-sm font-bold border border-border-dim shadow-inner" placeholder="DD/MM/YYYY" />
            </div>
          </div>
          <div className="pt-4">
             <button onClick={() => onSave(formData)} className="w-full py-5 bg-brand text-white font-black rounded-2xl shadow-2xl shadow-brand/30 active:scale-95 transition-all uppercase tracking-[0.2em] text-xs">
               DEPLOY AUDIT PROTOCOL
             </button>
             <p className="text-center text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-4 opacity-60">System will automatically assign auditors for this batch</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function AuditExecutionModal({ audit, onClose, onUpdate }: { audit: Audit, onClose: () => void, onUpdate: (a: Audit) => void }) {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [items, setItems] = useState<AuditItem[]>(audit.items);

  // Sync state with props if audit changes
  useEffect(() => {
    setItems(audit.items);
  }, [audit.id, audit.items]);

  const performScan = () => {
    if (items.every(i => i.status !== "Pending")) return;
    
    setScanning(true);
    setTimeout(() => {
      // Find the first pending item and verify it
      const pendingIndex = items.findIndex(item => item.status === "Pending");
      if (pendingIndex > -1) {
        const newItems = [...items];
        newItems[pendingIndex] = { ...newItems[pendingIndex], status: "Verified", lastVerified: "Now" };
        setItems(newItems);
        
        const verifiedCount = newItems.filter(i => i.status === "Verified").length;
        const completion = Math.round((verifiedCount / newItems.length) * 100);
        
        onUpdate({ ...audit, items: newItems, completion });
      }
      setScanning(false);
    }, 2000); // Slightly longer for dramatic effect
  };

  const markMissing = (id: string) => {
    const newItems = items.map(item => item.id === id ? { ...item, status: "Missing" as const, lastVerified: "Manual Flag" } : item);
    setItems(newItems);
    const verifiedCount = newItems.filter(i => i.status === "Verified").length;
    const completion = Math.round((verifiedCount / newItems.length) * 100);
    onUpdate({ ...audit, items: newItems, completion });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-0 sm:p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 30 }} className="bg-app-bg border border-border-dim w-full max-w-5xl h-full sm:h-[85vh] rounded-none sm:rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col relative">
        {/* Absolute Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 sm:top-8 sm:right-8 z-50 p-2 sm:p-3 bg-slate-100 dark:bg-white/10 hover:bg-brand hover:text-white rounded-xl sm:rounded-2xl border border-border-dim transition-all shadow-xl group"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-300" />
        </button>

        {/* Header */}
        <div className="p-6 sm:p-10 border-b border-border-dim bg-slate-50/50 dark:bg-white/5 flex flex-col sm:flex-row sm:items-center justify-between shrink-0 gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
             <div className="w-12 h-12 sm:w-16 sm:h-16 bg-brand text-white rounded-[1rem] sm:rounded-[1.5rem] flex items-center justify-center shadow-2xl border-4 border-app-bg">
                <CheckSquare className="w-6 h-6 sm:w-8 sm:h-8" />
             </div>
             <div>
                <div className="flex items-center gap-3">
                   <div className="text-[8px] sm:text-[10px] font-black text-brand uppercase tracking-widest font-mono truncate max-w-[100px] sm:max-w-none">EXECUTION: {audit.id}</div>
                   <span className="px-2 py-0.5 bg-brand/10 text-brand rounded text-[8px] sm:text-[9px] font-black uppercase tracking-widest">{audit.status}</span>
                </div>
                <h3 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mt-1">{audit.title}</h3>
                <p className="text-[8px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">{audit.location} • {audit.type}</p>
             </div>
          </div>
          <div className="flex gap-4">
             <button 
               disabled={scanning || items.every(i => i.status !== "Pending")}
               onClick={performScan} 
               className={cn(
                 "w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs flex items-center justify-center gap-3 transition-all",
                 scanning ? "bg-slate-200 text-slate-400 dark:bg-white/10" : "bg-brand text-white shadow-2xl shadow-brand/30 hover:scale-105 active:scale-95"
               )}
             >
                {scanning ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
                    Accessing Scanner...
                  </div>
                ) : (
                  <>
                    <Scan className="w-5 h-5 flex-shrink-0" /> <span className="truncate">START SCANNER</span>
                  </>
                )}
             </button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
           {/* Scanning Overlay Viewfinder */}
           <AnimatePresence>
             {scanning && (
               <motion.div 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 exit={{ opacity: 0 }}
                 className="absolute inset-0 z-40 bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6"
               >
                  <div className="relative w-full max-w-xs aspect-square">
                     {/* Corner brackets */}
                     <div className="absolute top-0 left-0 w-8 h-8 sm:w-12 sm:h-12 border-t-4 border-l-4 border-brand rounded-tl-2xl sm:rounded-tl-3xl"></div>
                     <div className="absolute top-0 right-0 w-8 h-8 sm:w-12 sm:h-12 border-t-4 border-r-4 border-brand rounded-tr-2xl sm:rounded-tr-3xl"></div>
                     <div className="absolute bottom-0 left-0 w-8 h-8 sm:w-12 sm:h-12 border-b-4 border-l-4 border-brand rounded-bl-2xl sm:rounded-bl-3xl"></div>
                     <div className="absolute bottom-0 right-0 w-8 h-8 sm:w-12 sm:h-12 border-b-4 border-r-4 border-brand rounded-br-2xl sm:rounded-br-3xl"></div>
                     
                     {/* Scanning line */}
                     <motion.div 
                        animate={{ top: ["10%", "90%", "10%"] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute left-[5%] right-[5%] h-1 bg-brand shadow-[0_0_15px_#DE3B40] z-10"
                     />
                     
                     <div className="w-full h-full flex flex-col items-center justify-center gap-4 sm:gap-6 text-center">
                        <Scan className="w-12 h-12 sm:w-20 sm:h-20 text-brand animate-pulse" />
                        <div className="space-y-2">
                           <p className="text-lg sm:text-xl font-black uppercase tracking-[0.2em] animate-pulse">Scanning...</p>
                           <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Searching for asset tags</p>
                        </div>
                     </div>
                  </div>
                  
                  <div className="mt-8 sm:mt-12 flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-full">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                     <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">Neural Engine: ACTIVE</span>
                  </div>
               </motion.div>
             )}
           </AnimatePresence>

           {/* Items List */}
           <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification Checklist ({items.length} assets)</h4>
                 <div className="flex gap-2">
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[8px] sm:text-[10px] font-black rounded uppercase tracking-widest">Verified: {items.filter(i => i.status === "Verified").length}</span>
                    <span className="px-2 py-1 bg-rose-500/10 text-rose-500 text-[8px] sm:text-[10px] font-black rounded uppercase tracking-widest">Missing: {items.filter(i => i.status === "Missing").length}</span>
                 </div>
              </div>
              
              {items.length === 0 ? (
                <div className="bg-slate-50 dark:bg-white/5 border-2 border-dashed border-border-dim rounded-[1.5rem] sm:rounded-[2.5rem] p-10 sm:p-20 text-center flex flex-col items-center">
                   <Plus className="w-10 h-10 sm:w-12 sm:h-12 text-slate-200 mb-4" />
                   <h3 className="text-lg sm:text-xl font-black uppercase text-slate-400">Empty Scope</h3>
                   <p className="text-slate-500 text-[10px] sm:text-xs mt-1 max-w-xs">There are no assets assigned to this specific audit batch yet.</p>
                   <button className="mt-6 sm:mt-8 px-6 sm:px-8 py-3 bg-app-bg border border-border-dim text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand hover:text-white transition-all border-brand/20">Assign Assets</button>
                </div>
              ) : (
                <div className="space-y-4 pb-20 lg:pb-0">
                   {items.map((item, idx) => (
                     <motion.div 
                       key={item.id}
                       initial={{ opacity: 0, x: -20 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: idx * 0.05 }}
                       className={cn(
                         "p-4 sm:p-6 rounded-[1.2rem] sm:rounded-[1.5rem] border flex flex-col sm:flex-row sm:items-center justify-between transition-all gap-4",
                         item.status === "Verified" ? "bg-emerald-500/5 border-emerald-500/20" :
                         item.status === "Missing" ? "bg-rose-500/5 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]" :
                         "bg-card-bg border-border-dim"
                       )}
                     >
                        <div className="flex items-center gap-4 sm:gap-5">
                           <div className={cn(
                             "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border-2 border-app-bg shadow-lg flex-shrink-0",
                             item.status === "Verified" ? "bg-emerald-500 text-white" :
                             item.status === "Missing" ? "bg-rose-500 text-white" :
                             "bg-slate-100 dark:bg-white/10 text-slate-400"
                           )}>
                              {item.status === "Verified" ? <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" /> :
                               item.status === "Missing" ? <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" /> :
                               <Clock className="w-5 h-5 sm:w-6 sm:h-6" />}
                           </div>
                           <div className="min-w-0">
                              <div className="text-[8px] sm:text-[10px] font-black text-brand uppercase tracking-tighter font-mono truncate">{item.id}</div>
                              <h5 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm sm:text-base truncate">{item.assetName}</h5>
                              <p className="text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 truncate">L.V: {item.lastVerified} • {item.category}</p>
                           </div>
                        </div>

                        <div className="flex items-center justify-end gap-3">
                           {item.status === "Pending" && (
                             <>
                               <button 
                                 onClick={() => markMissing(item.id)}
                                 className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-rose-500/10 text-rose-500 text-[8px] sm:text-[10px] font-black rounded-lg border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all uppercase tracking-widest"
                               >
                                  Flag Missing
                               </button>
                               <button 
                                 onClick={() => {
                                   const newItems = items.map(i => i.id === item.id ? { ...i, status: "Verified" as const, lastVerified: "Now" } : i);
                                   setItems(newItems);
                                   const verifiedCount = newItems.filter(i => i.status === "Verified").length;
                                   const completion = Math.round((verifiedCount / newItems.length) * 100);
                                   onUpdate({ ...audit, items: newItems, completion });
                                 }}
                                 className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-emerald-500/10 text-emerald-500 text-[8px] sm:text-[10px] font-black rounded-lg border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all uppercase tracking-widest"
                               >
                                  Verify
                               </button>
                             </>
                           )}
                           {item.status !== "Pending" && (
                             <button className="p-2 text-slate-300 hover:text-brand transition-colors"><MoreVertical className="w-4 h-4" /></button>
                           )}
                        </div>
                     </motion.div>
                   ))}
                </div>
              )}
           </div>

           {/* Metrics Sidebar */}
           <div className="w-full lg:w-96 bg-slate-50 dark:bg-black/20 border-t lg:border-t-0 lg:border-l border-border-dim p-10 space-y-10">
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Audit Progress</h4>
                 <div className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-200 dark:text-white/5" />
                      <motion.circle 
                        cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" 
                        strokeDasharray="283" 
                        animate={{ strokeDashoffset: 283 - (283 * audit.completion) / 100 }}
                        className="text-brand" 
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{audit.completion}%</span>
                       <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">Complete</span>
                    </div>
                 </div>
              </div>

              <div className="space-y-4 hidden sm:block">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Readiness</h4>
                 <div className="space-y-3">
                    {[
                      { label: "Blockchain Integrity", status: "Active" },
                      { label: "Asset Tag Sync", status: "Ready" },
                      { label: "Auditor Identity", status: "Verified" }
                    ].map((m, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-app-bg border border-border-dim rounded-2xl shadow-sm">
                         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{m.label}</span>
                         <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-[9px] font-black text-emerald-500 uppercase">{m.status}</span>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="bg-brand/10 border border-brand/20 p-6 rounded-[2rem] space-y-3">
                 <h5 className="text-[10px] font-black text-brand uppercase tracking-widest">Compliance Tip</h5>
                 <p className="text-xs font-bold text-brand leading-relaxed">
                   "Ensure all physical tags are visible. If a tag is damaged, use the 'Flag Damaged' action from the item menu."
                 </p>
              </div>
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

