import { useState, useEffect } from "react";
import { Coins, Plus, Search, Calculator, TrendingDown, DollarSign, Calendar, FileText, ArrowRight, Play, CheckCircle } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const data = [
  { month: 'Jan', val: 120 }, { month: 'Feb', val: 115 }, { month: 'Mar', val: 108 }, 
  { month: 'Apr', val: 102 }, { month: 'May', val: 95 }, { month: 'Jun', val: 88 }
];

export default function FinancePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState<any>(null);

  useEffect(() => {
    if (searchParams.get("action") === "depreciate") {
      handleRunDepreciation();
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleRunDepreciation = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 2500);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500" id="finance_page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Finance & Depreciation</h2>
          <p className="text-slate-500 text-sm">Asset valuation, depreciation journals, and fiscal health</p>
        </div>
        <button 
          className={cn(
            "btn-primary flex items-center justify-center gap-2",
            isProcessing && "opacity-50 pointer-events-none"
          )}
          onClick={handleRunDepreciation}
        >
          <Calculator className="w-4 h-4" /> {isProcessing ? "PROCESSING..." : "RUN DEPRECIATION"}
        </button>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-emerald-500 text-white p-4 rounded-xl flex items-center gap-3 shadow-lg font-bold text-sm"
          >
            <CheckCircle className="w-5 h-5" /> Depreciation run completed successfully for May 2024! Journal entries posted.
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card-bg border border-border-dim rounded-2xl p-6 shadow-xl h-[300px] sm:h-[400px] flex flex-col">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Asset Valuation Trend (Millions)</h3>
          <div className="flex-1 w-full min-h-0">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={data}>
                  <defs>
                    <linearGradient id="financeArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1a3ff0" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#1a3ff0" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-5" />
                  <XAxis dataKey="month" hide />
                  <YAxis hide />
                  <Tooltip />
                  <Area type="monotone" dataKey="val" stroke="#1a3ff0" strokeWidth={4} fillOpacity={1} fill="url(#financeArea)" />
               </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-brand/10 border border-brand/20 p-6 rounded-2xl flex flex-col justify-between">
           <div>
              <div className="text-[10px] font-black text-brand uppercase tracking-widest mb-4">Summary FY24</div>
              <div className="space-y-6">
                <div>
                  <div className="text-slate-500 font-bold text-[10px] uppercase">Original Cost</div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">$ 245.6M</div>
                </div>
                <div>
                  <div className="text-slate-500 font-bold text-[10px] uppercase">Acc. Depreciation</div>
                  <div className="text-3xl font-black text-rose-500">$ 77.2M</div>
                </div>
                <div>
                  <div className="text-slate-500 font-bold text-[10px] uppercase">Net Book Value</div>
                  <div className="text-3xl font-black text-emerald-500">$ 168.4M</div>
                </div>
              </div>
           </div>
           <button 
             onClick={() => setShowReport(true)}
             className="w-full py-3 bg-white dark:bg-black/20 text-slate-900 dark:text-white font-bold rounded-xl mt-6 border border-brand/20 shadow-sm flex items-center justify-center gap-2 hover:bg-brand hover:text-white transition-colors"
           >
             <FileText className="w-4 h-4" /> VIEW AUDITORS REPORT
           </button>
        </div>
      </div>

      <div className="bg-card-bg border border-border-dim rounded-2xl overflow-hidden shadow-xl">
         <div className="p-6 border-b border-border-dim">
           <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 text-center lg:text-left">Recent Journal Postings</h3>
         </div>
         <div className="divide-y divide-border-dim overflow-x-auto">
            {[
              { id: "J-9920", desc: "Monthly Depreciation - IT Equipment", amount: "$ 14,250", date: "31 May 2024", status: "Posted", breakdown: "Server Farm: $8k, workstations: $6.25k" },
              { id: "J-9919", desc: "Asset Acquisition - V-239 Vehicle", amount: "$ 32,000", date: "28 May 2024", status: "Posted", breakdown: "Delivery Van purchase for Logistics department" },
              { id: "J-9918", desc: "Monthly Depreciation - Office Devices", amount: "$ 2,100", date: "31 May 2024", status: "Posted", breakdown: "Printers and copiers across regional branches" },
              { id: "J-9917", desc: "Disposal Loss - Machinery A-102", amount: "$ 4,500", date: "25 May 2024", status: "Posted", breakdown: "Write-off for non-operational unit at Warehouse 1" }
            ].map(j => (
              <div 
                key={j.id} 
                className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-brand/5 transition-all cursor-pointer group min-w-[600px] sm:min-w-0"
                onClick={() => setSelectedJournal(j)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-brand transition-colors shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-brand uppercase">{j.id}</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-none">{j.desc}</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{j.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:gap-8 shrink-0">
                  <span className="text-sm font-black text-slate-900 dark:text-white">{j.amount}</span>
                  <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-2 py-0.5 rounded border border-emerald-500/20">{j.status}</span>
                  <button className="p-2 text-slate-300 group-hover:text-brand transition-colors"><ArrowRight className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
         </div>
      </div>

      <AnimatePresence>
        {showReport && <AuditorReportModal onClose={() => setShowReport(false)} />}
        {selectedJournal && <JournalDetailModal journal={selectedJournal} onClose={() => setSelectedJournal(null)} />}
      </AnimatePresence>
    </div>
  );
}

function AuditorReportModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-app-bg border border-border-dim w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-border-dim flex items-center justify-between bg-slate-50/50 dark:bg-white/5 text-slate-900 dark:text-white">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-brand/10 text-brand rounded-lg">
                <FileText className="w-5 h-5" />
             </div>
             <h3 className="font-black text-lg uppercase tracking-tight">Auditor's Report FY24</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2">×</button>
        </div>
        <div className="p-8 space-y-8">
           <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Executive Opinion</h4>
                <span className="text-[9px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded">UNQUALIFIED</span>
              </div>
              <div className="p-5 bg-card-bg border border-border-dim rounded-2xl text-sm font-medium italic text-slate-600 dark:text-slate-400 leading-relaxed shadow-inner">
                "We have physically verified 99.8% of high-value assets. The depreciation methods applied are consistent with international accounting standards. No material discrepancies were found in the current fiscal period."
              </div>
           </div>

           <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-border-dim">
                 <div className="text-[9px] font-black text-slate-400 uppercase mb-1">Asset Accuracy</div>
                 <div className="text-2xl font-black text-emerald-500">99.85%</div>
              </div>
              <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-border-dim">
                 <div className="text-[9px] font-black text-slate-400 uppercase mb-1">Compliance Rate</div>
                 <div className="text-2xl font-black text-brand">100%</div>
              </div>
           </div>

           <div className="flex gap-4">
              <button className="flex-1 py-4 bg-brand text-white font-black rounded-2xl uppercase tracking-widest shadow-xl shadow-brand/20 active:scale-95 transition-all">
                 Download PDF
              </button>
              <button onClick={onClose} className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                 Close Report
              </button>
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function JournalDetailModal({ journal, onClose }: { journal: any, onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-app-bg border border-border-dim w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-8 space-y-6">
           <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-brand/10 text-brand rounded-2xl flex items-center justify-center">
                 <FileText className="w-7 h-7" />
              </div>
              <div>
                 <div className="text-[10px] font-black text-brand uppercase tracking-widest">{journal.id}</div>
                 <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{journal.desc}</h3>
              </div>
           </div>
           
           <div className="space-y-4 py-6 border-y border-border-dim">
              <div className="flex justify-between items-center">
                 <span className="text-[10px] font-black text-slate-400 uppercase">Posting Date</span>
                 <span className="text-sm font-bold">{journal.date}</span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-[10px] font-black text-slate-400 uppercase">Amount</span>
                 <span className="text-xl font-black text-slate-900 dark:text-white">{journal.amount}</span>
              </div>
              <div className="space-y-2 mt-4">
                 <span className="text-[10px] font-black text-slate-400 uppercase block">Ledger Breakdown</span>
                 <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl text-xs font-bold italic text-slate-600 dark:text-slate-400">
                    "{journal.breakdown}"
                 </div>
              </div>
           </div>

           <button onClick={onClose} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl uppercase tracking-widest shadow-xl active:scale-95 transition-all">
              GO BACK
           </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
