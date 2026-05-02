import { useState, useEffect } from "react";
import { Wrench, Plus, Search, Filter, History, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

interface Ticket {
  id: string;
  assetName: string;
  assetCode: string;
  type: "Preventive" | "Breakdown" | "Calibration";
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Pending" | "In-Progress" | "Completed";
  date: string;
  assignedTo: string;
}

const initialTickets: Ticket[] = [
  { id: "T-1001", assetName: "Laptop Dell Latitude", assetCode: "A001", type: "Preventive", priority: "Low", status: "Completed", date: "20 May 2024", assignedTo: "Suresh Kumar" },
  { id: "T-1002", assetName: "Generator Honda 5kVA", assetCode: "G-125", type: "Breakdown", priority: "Critical", status: "In-Progress", date: "22 May 2024", assignedTo: "Anil Thompson" },
  { id: "T-1003", assetName: "HP LaserJet Printer", assetCode: "A002", type: "Calibration", priority: "Medium", status: "Pending", date: "24 May 2024", assignedTo: "David Bek" },
  { id: "T-1004", assetName: "Cisco Switch Core", assetCode: "N-402", type: "Preventive", priority: "High", status: "In-Progress", date: "25 May 2024", assignedTo: "Sarah Jenkins" },
  { id: "T-1005", assetName: "Air Conditioner LG 2T", assetCode: "AC-05", type: "Breakdown", priority: "High", status: "Pending", date: "26 May 2024", assignedTo: "Rauf Ahmed" },
  { id: "T-1006", assetName: "Biometric Scanner", assetCode: "S-102", type: "Calibration", priority: "Low", status: "Completed", date: "15 May 2024", assignedTo: "David Bek" },
];

export default function Maintenance() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    if (searchParams.get("action") === "create") {
      setIsModalOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500" id="maintenance_page">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Maintenance & Repair</h2>
          <p className="text-slate-500 text-sm">Track asset health and service requests</p>
        </div>
        <button 
          className="w-full xl:w-auto btn-primary flex items-center justify-center gap-2"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-4 h-4" /> CREATE TICKET
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tickets" value="156" icon={History} color="blue" />
        <StatCard label="Pending" value="24" icon={Clock} color="orange" />
        <StatCard label="In-Progress" value="12" icon={AlertCircle} color="red" />
        <StatCard label="Completed" value="120" icon={CheckCircle2} color="green" />
      </div>

      {/* Desktop Search Controls */}
      <div className="bg-card-bg border border-border-dim rounded-2xl p-4 sm:p-5 flex flex-col xl:flex-row xl:items-center gap-4 shadow-sm transition-colors duration-300">
         <div className="w-full xl:flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search maintenance tickets..." className="w-full bg-app-bg border border-border-dim pl-10 pr-4 py-3 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand/20 transition-all" />
         </div>
         <div className="flex items-center gap-3 w-full xl:w-auto">
            <button className="flex-1 xl:flex-none p-3 bg-app-bg border border-border-dim rounded-xl text-slate-400 hover:text-brand transition-all flex items-center justify-center gap-2">
               <Filter className="w-4 h-4" /> <span className="xl:hidden text-[10px] font-black uppercase tracking-widest">Filter</span>
            </button>
         </div>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 md:hidden gap-4">
        {tickets.map(ticket => (
          <div 
             key={ticket.id} 
             onClick={() => setSelectedTicket(ticket)}
             className="bg-card-bg border border-border-dim rounded-2xl p-5 space-y-4 shadow-sm hover:border-brand transition-all"
          >
             <div className="flex items-center justify-between">
                <span className="text-brand font-black text-[10px] uppercase">{ticket.id}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{ticket.date}</span>
             </div>
             <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{ticket.assetName}</h4>
                <p className="text-[10px] text-slate-400 font-mono uppercase transition-colors">{ticket.assetCode}</p>
             </div>
             
             <div className="grid grid-cols-2 gap-4 py-3 border-y border-border-dim/50">
                <div className="space-y-1">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Type</p>
                   <span className="text-[10px] font-bold text-slate-900 dark:text-white">{ticket.type}</span>
                </div>
                <div className="space-y-1">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Priority</p>
                   <PriorityBadge priority={ticket.priority} />
                </div>
             </div>

             <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center text-[10px] text-brand">SA</div>
                   <span className="text-[10px] font-black text-slate-500 uppercase">{ticket.assignedTo}</span>
                </div>
                <StatusBadge status={ticket.status} />
             </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="bg-card-bg border border-border-dim rounded-2xl overflow-hidden shadow-xl hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase font-bold text-slate-500 border-b border-border-dim">
                <th className="px-6 py-4">Ticket ID</th>
                <th className="px-6 py-4">Asset</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Assigned To</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dim">
              {tickets.map(ticket => (
                <tr 
                  key={ticket.id} 
                  className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <td className="px-6 py-4 font-bold text-brand text-xs">{ticket.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold group-hover:text-brand transition-colors">{ticket.assetName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{ticket.assetCode}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium">{ticket.type}</td>
                  <td className="px-6 py-4">
                    <PriorityBadge priority={ticket.priority} />
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-medium">{ticket.assignedTo}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-slate-400 font-bold">{ticket.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <CreateTicketModal 
            onClose={() => setIsModalOpen(false)} 
            onSave={(t: any) => {
              setTickets(prev => [{...t, id: `T-${Math.floor(Math.random() * 1000) + 2000}`, status: "Pending", date: new Date().toLocaleDateString('en-GB')}, ...prev]);
              setIsModalOpen(false);
            }} 
          />
        )}
        {selectedTicket && (
          <TicketPreviewModal 
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function TicketPreviewModal({ ticket, onClose }: { ticket: Ticket, onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 text-slate-900 dark:text-white">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-app-bg border border-border-dim w-full max-w-xl rounded-none sm:rounded-3xl overflow-hidden shadow-2xl relative h-full sm:h-auto overflow-y-auto">
        <div className="p-6 sm:p-8 border-b border-border-dim flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-brand/10 text-brand rounded-lg">
                <Wrench className="w-5 h-5" />
             </div>
             <h3 className="font-black text-lg sm:text-xl uppercase tracking-tight">Service Ticket</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-brand transition-colors p-2 text-2xl font-bold">×</button>
        </div>
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Ticket Reference</span>
              <span className="text-xl sm:text-2xl font-black text-brand tracking-tighter">{ticket.id}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Logged Date</span>
              <span className="text-sm font-bold uppercase">{ticket.date}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 py-6 border-y border-border-dim/50">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Asset Information</label>
                <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{ticket.assetName}</div>
                <div className="text-xs text-slate-500 font-mono font-bold uppercase">{ticket.assetCode}</div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Service Type</label>
                <div className="text-xs sm:text-sm font-black uppercase">{ticket.type}</div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Status & Priority</label>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={ticket.status} />
                  <PriorityBadge priority={ticket.priority} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Engineer Allocated</label>
                <div className="text-xs sm:text-sm font-black flex items-center gap-2 uppercase">
                  <div className="w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center text-[10px] text-brand">SA</div>
                  {ticket.assignedTo}
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Issue Description / Task Notes</label>
             <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-white/5 p-4 sm:p-5 rounded-2xl italic font-medium border border-border-dim/50 uppercase">
               "{ticket.type === "Breakdown" ? "Asset reported non-functional by user. Initial diagnostics suggest power supply failure. Spare parts ordered and awaiting arrival." : 
                 ticket.type === "Preventive" ? "Routine inspection as per manufacturer guideline. Cleaning and optimization performed. Next service due in 6 months." :
                 "Regular calibration performed to ensure accuracy and compliance. Device within tolerance limits."}"
             </p>
          </div>

          <button onClick={onClose} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl mt-4 uppercase tracking-widest shadow-xl transition-all active:scale-95 text-xs">
            CLOSE PREVIEW
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatCard({ label, value, icon: Icon, color }: any) {
  const colors: Record<string, string> = {
    blue: "text-blue-500 bg-blue-500/10",
    orange: "text-orange-500 bg-orange-500/10",
    red: "text-red-500 bg-red-500/10",
    green: "text-emerald-500 bg-emerald-500/10",
  };
  return (
    <div className="bg-card-bg border border-border-dim p-5 rounded-2xl flex items-center gap-4 transition-all hover:scale-[1.02]">
      <div className={cn("p-3 rounded-xl", colors[color])}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</div>
        <div className="text-xl font-bold">{value}</div>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    "Low": "bg-slate-500/10 text-slate-500",
    "Medium": "bg-blue-500/10 text-blue-500",
    "High": "bg-orange-500/10 text-orange-500",
    "Critical": "bg-red-500/10 text-red-500 animate-pulse",
  };
  return <span className={cn("px-2 py-0.5 rounded text-[10px] font-black uppercase border border-current/20", styles[priority])}>{priority}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Pending": "bg-slate-500/10 text-slate-500",
    "In-Progress": "bg-brand/10 text-brand",
    "Completed": "bg-emerald-500/10 text-emerald-500",
  };
  return <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border border-current/20", styles[status])}>{status}</span>;
}

function CreateTicketModal({ onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    assetName: "",
    assetCode: "",
    type: "Preventive",
    priority: "Medium",
    assignedTo: "Auto Sync"
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 text-slate-900 dark:text-white">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-app-bg border border-border-dim w-full max-w-lg rounded-none sm:rounded-3xl overflow-hidden shadow-2xl relative h-full sm:h-auto overflow-y-auto">
        <div className="p-6 sm:p-8 border-b border-border-dim flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
          <h3 className="font-black text-lg sm:text-xl uppercase tracking-tight">Create Ticket</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-brand transition-colors p-2 text-2xl font-bold">×</button>
        </div>
        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Asset Name</label>
            <input value={formData.assetName} onChange={e => setFormData({...formData, assetName: e.target.value})} className="w-full bg-card-bg p-4 rounded-xl sm:rounded-2xl text-sm font-bold border border-border-dim outline-none focus:ring-1 focus:ring-brand/40 uppercase" placeholder="E.G. DELL MONITOR" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Asset Code</label>
              <input value={formData.assetCode} onChange={e => setFormData({...formData, assetCode: e.target.value})} className="w-full bg-card-bg p-4 rounded-xl sm:rounded-2xl text-sm font-bold border border-border-dim outline-none focus:ring-1 focus:ring-brand/40 uppercase" placeholder="A-00X" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Type</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-card-bg p-4 rounded-xl sm:rounded-2xl text-sm font-bold border border-border-dim outline-none focus:ring-1 focus:ring-brand/40 uppercase">
                <option>Preventive</option>
                <option>Breakdown</option>
                <option>Calibration</option>
              </select>
            </div>
          </div>
          <button onClick={() => onSave(formData)} className="w-full py-4 sm:py-5 bg-brand text-white font-black rounded-xl sm:rounded-2xl mt-4 uppercase tracking-[0.2em] shadow-xl shadow-brand/20 active:scale-95 transition-all text-xs">
            SUBMIT TICKET
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
