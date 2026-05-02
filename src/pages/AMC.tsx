import { useState, useEffect } from "react";
import { ClipboardCheck, Plus, Search, FileText, Calendar, DollarSign, ArrowUpRight, ShieldCheck, MoreHorizontal } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

interface Contract {
  id: string;
  vendor: string;
  assetCount: number;
  value: string;
  status: "Active" | "Expiring Soon" | "Expired";
  expiryDate: string;
  coverage: string;
  contactPerson: string;
  phone: string;
}

const initialContracts: Contract[] = [
  { id: "AMC-2024-01", vendor: "Dell Enterprise Services", assetCount: 450, value: "$ 12,500/yr", status: "Active", expiryDate: "30 Dec 2024", coverage: "Hardware replacement & on-site support for all Latitude laptops.", contactPerson: "Michael Scott", phone: "+1 (555) 012-3456" },
  { id: "AMC-2024-05", vendor: "APC Power Care", assetCount: 12, value: "$ 2,200/yr", status: "Expiring Soon", expiryDate: "15 June 2024", coverage: "Quarterly battery health checks and UPS firmware updates.", contactPerson: "Jim Halpert", phone: "+1 (555) 987-6543" },
  { id: "AMC-2023-11", vendor: "Elevator Solutions Co.", assetCount: 4, value: "$ 8,400/yr", status: "Expired", expiryDate: "01 May 2024", coverage: "Monthly safety inspection and emergency rescue system testing.", contactPerson: "Pam Beesly", phone: "+1 (555) 456-7890" },
  { id: "AMC-2024-09", vendor: "Honeywell Fire & Safety", assetCount: 120, value: "$ 5,500/yr", status: "Active", expiryDate: "20 Oct 2024", coverage: "Annual smoke detector calibration and sprinkler system auditing.", contactPerson: "Dwight Schrute", phone: "+1 (555) 333-2222" },
  { id: "AMC-2025-02", vendor: "Schneider Electric", assetCount: 8, value: "$ 11,200/yr", status: "Active", expiryDate: "12 Mar 2025", coverage: "High-voltage switchgear maintenance and thermal imaging reports.", contactPerson: "Angela Martin", phone: "+1 (555) 111-0000" },
  { id: "AMC-2024-12", vendor: "Cisco Systems", assetCount: 25, value: "$ 15,000/yr", status: "Expiring Soon", expiryDate: "10 May 2024", coverage: "Core network backbone maintenance and priority software updates.", contactPerson: "Oscar Martinez", phone: "+1 (555) 777-8888" },
  { id: "AMC-2024-15", vendor: "Konica Minolta", assetCount: 30, value: "$ 4,300/yr", status: "Expiring Soon", expiryDate: "22 May 2024", coverage: "Printer fleet managed services and toner supply automation.", contactPerson: "Kevin Malone", phone: "+1 (555) 999-1111" },
];

export default function AMCPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  const handleRenewContract = (contractId: string) => {
    setContracts(prev => prev.map(c => {
      if (c.id === contractId) {
        // Simple logic to extend by 1 year for demo
        const currentYear = parseInt(c.expiryDate.split(" ").pop() || "2024");
        const newExpiry = c.expiryDate.replace(currentYear.toString(), (currentYear + 1).toString());
        return { ...c, status: "Active", expiryDate: newExpiry };
      }
      return c;
    }));
  };

  useEffect(() => {
    if (searchParams.get("action") === "create") {
      setIsModalOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500" id="amc_page">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">AMC Contracts</h2>
          <p className="text-slate-500 text-sm">Manage annual maintenance and service agreements</p>
        </div>
        <button 
          className="w-full xl:w-auto btn-primary flex items-center justify-center gap-2"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-4 h-4" /> NEW AMC CONTRACT
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard label="Active AMC" value="19" icon={ShieldCheck} color="brand" />
        <MetricCard label="Total Value" value="$ 84.5K" icon={DollarSign} color="green" />
        <MetricCard label="Expiring" value="2" icon={Calendar} color="orange" />
        <MetricCard label="Asset Covered" value="1,250" icon={FileText} color="blue" />
      </div>

      <div className="bg-card-bg border border-border-dim rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-border-dim flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-slate-50/50 dark:bg-white/5">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Contract Registry</h3>
            <div className="relative w-full xl:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search contracts by vendor or ID..." className="w-full bg-app-bg border border-border-dim rounded-xl pl-9 pr-4 py-3 text-xs outline-none focus:ring-2 focus:ring-brand/20 transition-all font-medium" />
            </div>
        </div>
        
        {/* Table View - Hidden on Mobile */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-app-bg text-[10px] uppercase font-black text-slate-400 tracking-widest border-b border-border-dim">
                <th className="px-6 py-4 font-black">Contract ID</th>
                <th className="px-6 py-4 font-black">Vendor</th>
                <th className="px-6 py-4 font-black">Assets Covered</th>
                <th className="px-6 py-4 font-black">Status</th>
                <th className="px-6 py-4 font-black">Annual Value</th>
                <th className="px-6 py-4 text-right font-black">Expiry Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dim">
              {contracts.map(contract => (
                <tr 
                  key={contract.id} 
                  className="hover:bg-slate-50 dark:hover:bg-brand/5 transition-all group cursor-pointer"
                  onClick={() => setSelectedContract(contract)}
                >
                  <td className="px-6 py-5 font-bold text-brand font-mono text-[11px]">{contract.id}</td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand transition-colors">{contract.vendor}</span>
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-slate-500">{contract.assetCount} Assets</td>
                  <td className="px-6 py-5">
                    <StatusBadge status={contract.status} />
                  </td>
                  <td className="px-6 py-5 text-sm font-black">{contract.value}</td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-bold text-slate-500">{contract.expiryDate}</span>
                      <button className="p-1 text-slate-300 group-hover:text-brand transition-colors">
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View - Card Layout */}
        <div className="sm:hidden divide-y divide-border-dim">
          {contracts.map(contract => (
            <div 
              key={contract.id} 
              className="p-4 space-y-4 hover:bg-slate-50 dark:hover:bg-brand/5 transition-all active:bg-slate-100"
              onClick={() => setSelectedContract(contract)}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-brand font-mono">{contract.id}</span>
                <StatusBadge status={contract.status} />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">{contract.vendor}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{contract.assetCount} Assets Covered</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border-dim/50">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Annual Value</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">{contract.value}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Expires On</span>
                  <span className="text-xs font-black text-slate-600 dark:text-slate-300">{contract.expiryDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <CreateContractModal 
            onClose={() => setIsModalOpen(false)} 
            onSave={(c: any) => {
              setContracts(prev => [{...c, id: `AMC-2024-${Math.floor(Math.random() * 90) + 10}`, status: "Active"}, ...prev]);
              setIsModalOpen(false);
            }} 
          />
        )}
        {selectedContract && (
          <ContractPreviewModal 
            contract={selectedContract}
            onClose={() => setSelectedContract(null)}
            onRenew={handleRenewContract}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ContractPreviewModal({ contract, onClose, onRenew }: { contract: Contract, onClose: () => void, onRenew: (id: string) => void }) {
  const [isRenewing, setIsRenewing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleRenew = () => {
    setIsRenewing(true);
    setTimeout(() => {
      onRenew(contract.id);
      setIsRenewing(false);
      setShowSuccess(true);
    }, 1500);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-app-bg border border-border-dim w-full max-w-xl rounded-none sm:rounded-3xl overflow-hidden shadow-2xl relative h-full sm:h-auto overflow-y-auto">
        <AnimatePresence mode="wait">
          {!showSuccess ? (
            <motion.div key="details" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="p-4 sm:p-6 border-b border-border-dim flex items-center justify-between bg-slate-50/50 dark:bg-white/5 sticky top-0 bg-app-bg z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand/10 text-brand rounded-lg">
                      <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                      <h3 className="font-black text-base sm:text-lg uppercase tracking-tight leading-none">AMC Details</h3>
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ref: {contract.id}</span>
                  </div>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-white p-2">×</button>
              </div>
              <div className="p-6 sm:p-8 space-y-6 sm:space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <label className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Service Provider</label>
                      <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase">{contract.vendor}</div>
                    </div>
                    <div className="text-left sm:text-right">
                      <label className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Status</label>
                      <StatusBadge status={contract.status} />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-y border-border-dim/50">
                    <div className="space-y-4">
                      <div>
                          <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Asset Coverage</label>
                          <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{contract.assetCount} Specific Units Covered</div>
                      </div>
                      <div>
                          <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Annual Value</label>
                          <div className="text-sm sm:text-base font-black text-emerald-500">{contract.value}</div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                          <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Expiry Date</label>
                          <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{contract.expiryDate}</div>
                      </div>
                      <div>
                          <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Manager</label>
                          <div className="text-xs sm:text-sm font-bold">{contract.contactPerson}</div>
                          <div className="text-[10px] text-slate-500">{contract.phone}</div>
                      </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Scope & SLA</label>
                    <div className="bg-slate-50 dark:bg-white/5 border border-border-dim p-4 rounded-xl text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-bold italic uppercase">
                      "{contract.coverage}"
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pb-4">
                    <button 
                      onClick={handleRenew}
                      disabled={isRenewing}
                      className="w-full sm:flex-1 py-4 bg-brand text-white font-black rounded-2xl uppercase tracking-widest shadow-xl shadow-brand/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-[10px] sm:text-xs"
                    >
                      <ClipboardCheck className="w-5 h-5" /> {isRenewing ? "RENEWING..." : "RENEW CONTRACT"}
                    </button>
                    <button onClick={onClose} className="w-full sm:flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl uppercase tracking-widest shadow-xl active:scale-95 transition-all text-[10px] sm:text-xs">
                      CLOSE PREVIEW
                    </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-8 sm:p-12 text-center space-y-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-500/20">
                <ClipboardCheck className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black tracking-tight uppercase">Contract Renewed</h3>
                <p className="text-slate-500 text-xs sm:text-sm font-medium">Agreement with <span className="text-brand font-black">{contract.vendor}</span> extended.</p>
              </div>
              <button onClick={onClose} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl uppercase tracking-widest shadow-xl text-xs">
                 CONFIRM & FINISH
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}


function MetricCard({ label, value, icon: Icon, color }: any) {
  const colorStyles: any = {
    brand: "bg-brand/10 text-brand",
    green: "bg-emerald-500/10 text-emerald-500",
    orange: "bg-orange-500/10 text-orange-500",
    blue: "bg-blue-500/10 text-blue-500"
  };
  return (
    <div className="bg-card-bg border border-border-dim p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm">
      <div className={cn("w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4", colorStyles[color])}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
      <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</div>
      <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1 uppercase">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Active": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    "Expiring Soon": "bg-orange-500/10 text-orange-500 border-orange-500/20",
    "Expired": "bg-rose-500/10 text-rose-500 border-rose-500/20",
  };
  return <span className={cn("px-2.5 py-0.5 rounded text-[10px] font-black uppercase border", styles[status])}>{status}</span>;
}

function CreateContractModal({ onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    vendor: "",
    assetCount: 0,
    value: "$ 0/yr",
    expiryDate: ""
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-app-bg border border-border-dim w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-border-dim flex items-center justify-between">
          <h3 className="font-bold text-lg">Renew / Create AMC Contract</h3>
          <button onClick={onClose} className="p-2 text-slate-400">×</button>
        </div>
        <div className="p-8 space-y-4">
           <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Service Vendor</label>
              <input value={formData.vendor} onChange={e => setFormData({...formData, vendor: e.target.value})} className="w-full bg-card-bg border border-border-dim p-3 rounded-xl text-sm" placeholder="e.g. Oracle Support" />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Asset Count</label>
                <input type="number" value={formData.assetCount} onChange={e => setFormData({...formData, assetCount: parseInt(e.target.value)})} className="w-full bg-card-bg border border-border-dim p-3 rounded-xl text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Contract Value</label>
                <input value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} className="w-full bg-card-bg border border-border-dim p-3 rounded-xl text-sm" placeholder="$ 0/yr" />
              </div>
           </div>
           <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Expiry Date</label>
              <input type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} className="w-full bg-card-bg border border-border-dim p-3 rounded-xl text-sm" />
           </div>
           <button onClick={() => onSave(formData)} className="w-full py-4 bg-brand text-white font-black rounded-2xl mt-6 uppercase tracking-widest shadow-lg shadow-brand/20">SAVE AMC CONTRACT</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
