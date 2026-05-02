import { useState } from "react";
import { 
  ShieldCheck, 
  Plus, 
  Search, 
  Calendar, 
  FileCheck, 
  AlertCircle, 
  Clock, 
  ChevronRight, 
  ExternalLink,
  ShieldAlert,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  X
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface Warranty {
  id: string;
  assetName: string;
  assetCode: string;
  provider: string;
  type: "Standard" | "Extended" | "Manufacturer";
  status: "Active" | "Expiring Soon" | "Expired" | "Claimed";
  expiryDate: string;
  coverage: string;
}

const initialWarranties: Warranty[] = [
  { id: "WR-101", assetName: "MacBook Pro M3", assetCode: "A001", provider: "AppleCare+", type: "Extended", status: "Active", expiryDate: "15 Dec 2026", coverage: "Hardware & Accidental damage" },
  { id: "WR-105", assetName: "Dell Latitude 5420", assetCode: "A003", provider: "Dell Support Assist", type: "Standard", status: "Expiring Soon", expiryDate: "10 June 2024", coverage: "Hardware Repair" },
  { id: "WR-202", assetName: "Epson Projector", assetCode: "A005", provider: "Epson Service", type: "Manufacturer", status: "Expired", expiryDate: "01 May 2024", coverage: "Lamp & Optics" },
  { id: "WR-309", assetName: "Cisco Catalyst Switch", assetCode: "A008", provider: "Cisco SmartNet", type: "Extended", status: "Active", expiryDate: "20 Jan 2025", coverage: "Next Business Day Replacement" },
  { id: "WR-412", assetName: "LG Industrial AC", assetCode: "AC-05", provider: "LG Enterprise", type: "Manufacturer", status: "Claimed", expiryDate: "15 Nov 2024", coverage: "Compressor Warranty" },
];

export default function WarrantyPage() {
  const [warranties, setWarranties] = useState<Warranty[]>(initialWarranties);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredWarranties = warranties.filter(w => 
    w.assetName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    w.assetCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileClaim = (warrantyId: string) => {
    setWarranties(prev => prev.map(w => w.id === warrantyId ? { ...w, status: "Claimed" } : w));
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500" id="warranty_page">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Warranty Management</h2>
          <p className="text-slate-500 text-sm">Monitor coverage status and service level agreements</p>
        </div>
        <button 
          className="w-full xl:w-auto px-8 py-3.5 bg-brand text-white font-black rounded-2xl shadow-xl shadow-brand/20 active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-4 h-4" /> ADD WARRANTY RECORD
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Active" value="142" icon={ShieldCheck} border="border-emerald-500/20" text="text-emerald-500" />
        <StatCard label="Expiring" value="8" icon={Clock} border="border-amber-500/20" text="text-amber-500" />
        <StatCard label="Expired" value="24" icon={ShieldAlert} border="border-rose-500/20" text="text-rose-500" />
        <StatCard label="Coverage" value="$ 1.2M" icon={FileCheck} border="border-brand/20" text="text-brand" />
      </div>

      <div className="bg-card-bg border border-border-dim rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-border-dim flex flex-col xl:flex-row xl:items-center justify-between bg-slate-50/50 dark:bg-white/5 gap-4">
          <div className="relative w-full xl:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search ID, Asset or Code..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-app-bg border border-border-dim pl-10 pr-4 py-3 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand/20 transition-all font-medium" 
            />
          </div>
          <div className="flex gap-2 w-full xl:w-auto">
            <button className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-app-bg border border-border-dim rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-brand transition-colors">
              <Filter className="w-4 h-4" /> <span className="">Filters</span>
            </button>
          </div>
        </div>

        {/* Table View - Hidden on Mobile */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 text-[10px] uppercase font-black text-slate-400 tracking-widest border-b border-border-dim">
                <th className="px-6 py-4">Warranty ID</th>
                <th className="px-6 py-4">Associated Asset</th>
                <th className="px-6 py-4">Provider</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Expiry Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dim">
              {filteredWarranties.map(warranty => (
                <tr 
                  key={warranty.id} 
                  className="hover:bg-slate-50 dark:hover:bg-brand/5 transition-all cursor-pointer group"
                  onClick={() => setSelectedWarranty(warranty)}
                >
                  <td className="px-6 py-5">
                    <span className="text-xs font-black text-brand uppercase tracking-tighter">{warranty.id}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold group-hover:text-brand transition-colors">{warranty.assetName}</span>
                      <span className="text-[10px] text-slate-400 font-mono tracking-tight uppercase">{warranty.assetCode}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-slate-600 dark:text-slate-300">
                    {warranty.provider}
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{warranty.type}</span>
                  </td>
                  <td className="px-6 py-5">
                    <StatusBadge status={warranty.status} />
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <span className="text-xs font-bold text-slate-500">{warranty.expiryDate}</span>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand transform group-hover:translate-x-1 transition-all" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="sm:hidden divide-y divide-border-dim">
          {filteredWarranties.map(warranty => (
            <div 
              key={warranty.id} 
              className="p-4 space-y-4 hover:bg-slate-50 dark:hover:bg-brand/5 transition-all active:bg-slate-100"
              onClick={() => setSelectedWarranty(warranty)}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-brand uppercase tracking-tighter">{warranty.id}</span>
                <StatusBadge status={warranty.status} />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">{warranty.assetName}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{warranty.provider} • {warranty.type}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border-dim/50">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Reference</span>
                  <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase font-mono">{warranty.assetCode}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Expires</span>
                  <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase">{warranty.expiryDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredWarranties.length === 0 && (
          <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-300">
              <Search className="w-8 h-8" />
            </div>
            <p className="text-slate-400 font-medium">No warranty records matched your search criteria.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <AddWarrantyModal 
            onClose={() => setIsModalOpen(false)}
            onSave={(w) => {
              setWarranties(prev => [{...w, id: `WR-${Math.floor(Math.random() * 900) + 500}`, status: "Active"}, ...prev]);
              setIsModalOpen(false);
            }}
          />
        )}
        {selectedWarranty && (
          <WarrantyPreviewModal 
            warranty={selectedWarranty}
            onClose={() => setSelectedWarranty(null)}
            onClaim={handleFileClaim}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, border, text }: any) {
  return (
    <div className={cn("bg-card-bg border p-6 rounded-3xl shadow-sm transition-all hover:translate-y-[-2px]", border)}>
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-app-bg shadow-sm", text)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
      <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Active": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    "Expiring Soon": "bg-amber-500/10 text-amber-500 border-amber-500/20",
    "Expired": "bg-rose-500/10 text-rose-500 border-rose-500/20",
    "Claimed": "bg-brand/10 text-brand border-brand/20",
  };
  return <span className={cn("px-2.5 py-0.5 rounded text-[10px] font-black uppercase border", styles[status])}>{status}</span>;
}

function AddWarrantyModal({ onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    assetName: "",
    assetCode: "",
    provider: "",
    type: "Standard",
    expiryDate: "",
    coverage: ""
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-app-bg border border-border-dim w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-border-dim flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-brand/10 text-brand rounded-lg">
                <Plus className="w-5 h-5" />
             </div>
             <h3 className="font-bold text-lg uppercase tracking-tight">Add Warranty Record</h3>
           </div>
           <button onClick={onClose} className="text-slate-400 p-2"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-8 space-y-4">
           <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Asset Information</label>
              <div className="grid grid-cols-2 gap-4">
                <input value={formData.assetName} onChange={e => setFormData({...formData, assetName: e.target.value})} className="w-full bg-card-bg border border-border-dim p-4 rounded-2xl text-sm" placeholder="Asset Name" />
                <input value={formData.assetCode} onChange={e => setFormData({...formData, assetCode: e.target.value})} className="w-full bg-card-bg border border-border-dim p-4 rounded-2xl text-sm" placeholder="Asset Code (A-XXX)" />
              </div>
           </div>
           <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Warranty Details</label>
              <div className="grid grid-cols-2 gap-4">
                <input value={formData.provider} onChange={e => setFormData({...formData, provider: e.target.value})} className="w-full bg-card-bg border border-border-dim p-4 rounded-2xl text-sm" placeholder="Provider (e.g. Apple)" />
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-card-bg border border-border-dim p-4 rounded-2xl text-sm">
                  <option>Standard</option>
                  <option>Extended</option>
                  <option>Manufacturer</option>
                </select>
              </div>
           </div>
           <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Expiry Date</label>
              <input type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} className="w-full bg-card-bg border border-border-dim p-4 rounded-2xl text-sm" />
           </div>
           <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Coverage Scope</label>
              <textarea value={formData.coverage} onChange={e => setFormData({...formData, coverage: e.target.value})} className="w-full bg-card-bg border border-border-dim p-4 rounded-2xl text-sm min-h-[80px]" placeholder="Summary of what's covered..." />
           </div>
           <button onClick={() => onSave(formData)} className="w-full py-4 bg-brand text-white font-black rounded-2xl mt-4 uppercase tracking-widest shadow-xl shadow-brand/20 active:scale-95 transition-all">
             Save Warranty Record
           </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function WarrantyPreviewModal({ warranty, onClose, onClaim }: { warranty: Warranty, onClose: () => void, onClaim: (id: string) => void }) {
  const [step, setStep] = useState<"view" | "claim" | "success">("view");
  const [claimReason, setClaimReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClaimSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onClaim(warranty.id);
      setIsSubmitting(false);
      setStep("success");
    }, 1500);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 text-slate-900 dark:text-white">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-app-bg border border-border-dim w-full max-w-xl rounded-none sm:rounded-[2.5rem] overflow-hidden shadow-2xl relative h-full sm:h-auto overflow-y-auto">
        <AnimatePresence mode="wait">
          {step === "view" && (
            <motion.div key="view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-0">
              <div className="p-6 sm:p-8 pb-0 flex flex-col items-center">
                <div className={cn(
                  "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 border-4 border-app-bg shadow-xl",
                  warranty.status === "Active" ? "bg-emerald-500 text-white" :
                  warranty.status === "Expired" ? "bg-rose-500 text-white" :
                  warranty.status === "Claimed" ? "bg-brand text-white" :
                  "bg-amber-500 text-white"
                )}>
                    <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-center">{warranty.assetName}</h3>
                <p className="text-slate-500 font-bold uppercase text-[9px] sm:text-[10px] tracking-widest mt-1">Ref: {warranty.assetCode} • ID: {warranty.id}</p>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-card-bg border border-border-dim p-4 rounded-xl sm:rounded-2xl">
                      <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Status</label>
                      <StatusBadge status={warranty.status} />
                    </div>
                    <div className="bg-card-bg border border-border-dim p-4 rounded-xl sm:rounded-2xl">
                      <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Provider</label>
                      <span className="text-xs sm:text-sm font-black uppercase truncate block">{warranty.provider}</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-border-dim relative overflow-hidden">
                      <div className="z-10">
                        <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Coverage Valid Until</label>
                        <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase">{warranty.expiryDate}</span>
                      </div>
                      <Calendar className="absolute -right-4 -bottom-4 w-20 h-20 sm:w-24 sm:h-24 text-slate-500/5 rotate-12" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1 font-mono uppercase">Scope of Coverage</label>
                      <div className="bg-card-bg border border-border-dim p-5 rounded-2xl text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400 font-medium italic uppercase">
                        "{warranty.coverage}"
                      </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6 pb-4">
                    {warranty.status !== "Claimed" && warranty.status !== "Expired" && (
                      <button 
                        onClick={() => setStep("claim")}
                        className="w-full sm:flex-1 py-4 bg-emerald-500 text-white font-black rounded-2xl uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-[10px] sm:text-xs"
                      >
                        <ArrowUpRight className="w-5 h-5" /> FILE CLAIM
                      </button>
                    )}
                    <button onClick={onClose} className="w-full sm:flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl uppercase tracking-widest shadow-xl active:scale-95 transition-all text-[10px] sm:text-xs">
                      {warranty.status === "Claimed" || warranty.status === "Expired" ? "CLOSE PREVIEW" : "CANCEL"}
                    </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === "claim" && (
            <motion.div key="claim" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 sm:p-8 space-y-6 h-full sm:h-auto">
              <div className="flex items-center gap-4 border-b border-border-dim pb-6">
                 <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                    <AlertCircle className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="text-xl font-black uppercase">Claim Request</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Asset: {warranty.assetCode}</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description of Issue</label>
                    <textarea 
                      autoFocus
                      value={claimReason}
                      onChange={(e) => setClaimReason(e.target.value)}
                      placeholder="DESCRIBE THE FAULT OR DAMAGE IN DETAIL..."
                      className="w-full bg-card-bg border border-border-dim p-4 sm:p-5 rounded-2xl text-xs sm:text-sm min-h-[120px] sm:min-h-[150px] outline-none focus:ring-2 focus:ring-brand/20 transition-all font-medium uppercase"
                    />
                 </div>
                 <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-border-dim">
                    <p className="text-[9px] text-slate-500 font-bold leading-relaxed uppercase">
                      DAMAGES MUST BE WITHIN COVERAGE SCOPE. MISUSE MAY VOID WARRANTY.
                    </p>
                 </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                 <button 
                   onClick={handleClaimSubmit}
                   disabled={!claimReason || isSubmitting}
                   className="w-full sm:flex-1 py-4 bg-brand text-white font-black rounded-2xl uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-brand/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale text-[10px] sm:text-xs"
                 >
                   {isSubmitting ? "PROCESSING..." : "SUBMIT CLAIM"}
                 </button>
                 <button onClick={() => setStep("view")} className="w-full sm:px-8 py-4 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-black rounded-2xl uppercase tracking-widest text-[10px] sm:text-xs">
                    GO BACK
                 </button>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-8 sm:p-12 text-center space-y-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-500/20">
                <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black tracking-tight uppercase">Claim Filed</h3>
                <p className="text-slate-500 text-xs sm:text-sm font-medium">Request logged. Provider notified. <br/><span className="font-mono text-brand mt-2 block uppercase">CLM-{Math.floor(Math.random()*10000)}</span></p>
              </div>
              <button onClick={onClose} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl uppercase tracking-widest shadow-xl text-xs">
                 FINISH
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
