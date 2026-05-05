import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  User,
  Filter,
  Search,
  ChevronRight,
  Send,
  Flag,
  Calendar,
  MoreVertical,
  ArrowLeft,
  X,
  History,
  AlertTriangle,
  Zap
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import api from "../../lib/api";
import { format } from "date-fns";

type TicketStatus = "all" | "open" | "in_progress" | "waiting" | "resolved" | "closed";
type TicketPriority = "all" | "low" | "medium" | "high" | "urgent";

export default function PlatformSupport() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [filters, setFilters] = useState({ status: "all" as TicketStatus, priority: "all" as TicketPriority });
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const fetchTickets = async () => {
    try {
      const [ticketsRes, summaryRes] = await Promise.all([
        api.get("/platform/support/tickets", { params: filters }),
        api.get("/platform/support/summary")
      ]);
      setTickets(ticketsRes.data.data || []);
      setSummary(summaryRes.data.data);
    } catch (error) {
      console.error("Support fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  const handleTicketSelect = async (ticket: any) => {
    try {
      const res = await api.get(`/platform/support/tickets/${ticket.id}`);
      setSelectedTicket(res.data.data);
    } catch (error) {
      console.error("Failed to fetch ticket details:", error);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    setSendingReply(true);
    try {
      await api.post(`/platform/support/tickets/${selectedTicket.id}/reply`, {
        text: replyText,
        status: "in_progress"
      });
      setReplyText("");
      handleTicketSelect(selectedTicket);
      fetchTickets();
    } catch (error) {
      console.error("Reply failed:", error);
    } finally {
      setSendingReply(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedTicket) return;
    try {
      await api.post(`/platform/support/tickets/${selectedTicket.id}/reply`, {
        text: `Status changed to ${status}`,
        status: status
      });
      handleTicketSelect(selectedTicket);
      fetchTickets();
    } catch (error) {
      console.error("Status update failed:", error);
    }
  };

  if (loading && !tickets.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <MessageSquare className="w-12 h-12 text-brand animate-pulse" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Neutralizing Support Cluster...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 pb-20 animate-in fade-in duration-700 h-[calc(100vh-120px)] flex flex-col gap-6">
      {summary?._action_required && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center gap-4 text-rose-500 shrink-0">
          <AlertTriangle className="w-6 h-6" />
          <div className="flex-1">
             <p className="text-[11px] font-black uppercase tracking-widest">Firestore Management Plane Restricted</p>
             <p className="text-[10px] font-bold opacity-80 uppercase tracking-tighter mt-1">The Cloud Firestore API must be enabled for project asstella-cd3ac to activate the helpdesk repository.</p>
          </div>
          <a href="https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=asstella-cd3ac" target="_blank" className="px-4 py-2 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all">Enable API</a>
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-brand" /> Resolution Center
          </h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">
            SLA-Governance, Multi-tenant Support & Lifecycle Management
          </p>
        </div>
        
        {/* SLA Summary Bar */}
        <div className="flex items-center gap-2">
           <SLACard label="Breach" value={summary?.breached_response + summary?.breached_resolution || 0} icon={AlertTriangle} color="text-rose-500 bg-rose-50" />
           <SLACard label="Risk" value={summary?.approaching_breach || 0} icon={Zap} color="text-amber-500 bg-amber-50" />
           <SLACard label="Active" value={summary?.total_active || 0} icon={Clock} color="text-brand bg-brand/5" />
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Sidebar: Ticket List */}
        <div className={cn(
          "w-full md:w-[400px] flex flex-col gap-4 transition-all duration-300",
          selectedTicket ? "hidden lg:flex" : "flex"
        )}>
           <div className="bg-card-bg border border-border-dim rounded-[2rem] p-4 flex flex-col h-full shadow-sm">
             {/* Search/Filters */}
             <div className="p-2 space-y-3 shrink-0">
                <div className="relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   <input 
                     placeholder="Search Ticket ID or Tenant..."
                     className="w-full bg-slate-50 dark:bg-white/5 border border-border-dim pl-12 pr-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest outline-none focus:border-brand transition-colors"
                   />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                   {(['all', 'open', 'in_progress', 'resolved'] as TicketStatus[]).map(s => (
                      <button 
                         key={s}
                         onClick={() => setFilters(f => ({ ...f, status: s }))}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-tighter shrink-0 transition-all",
                          filters.status === s ? "bg-brand text-white shadow-lg" : "bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200"
                        )}
                      >
                        {s.replace('_', ' ')}
                      </button>
                   ))}
                </div>
             </div>

             {/* Tickets Scroll Area */}
             <div className="flex-1 overflow-y-auto pr-2 space-y-2 mt-4 custom-scrollbar">
                {tickets.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-40">
                      <History className="w-10 h-10 mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Queue Empty</p>
                   </div>
                ) : (
                  tickets.map((t) => (
                    <button 
                      key={t.id}
                      onClick={() => handleTicketSelect(t)}
                      className={cn(
                        "w-full text-left p-5 rounded-[1.5rem] border transition-all relative group",
                        selectedTicket?.id === t.id 
                          ? "bg-white dark:bg-slate-800 border-brand shadow-lg ring-1 ring-brand/20" 
                          : "bg-slate-50/50 dark:bg-white/5 border-transparent hover:border-slate-200 dark:hover:border-white/10"
                      )}
                    >
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.tenant_name || "Enterprise"} • #{t.id.slice(-6)}</span>
                          <PriorityBadge priority={t.priority} />
                       </div>
                       <h4 className="text-xs font-black text-slate-800 dark:text-white truncate mb-1 uppercase tracking-tight group-hover:text-brand transition-colors">{t.subject}</h4>
                       <p className="text-[10px] font-bold text-slate-500 line-clamp-2 leading-relaxed mb-3">{t.description}</p>
                       
                       <div className="flex items-center justify-between">
                          <div className={cn(
                            "flex items-center gap-1.5",
                            t.sla_response_due?.toMillis() < Date.now() && t.status === 'open' ? 'text-rose-500' : 'text-slate-400'
                          )}>
                             <Clock className="w-3.5 h-3.5" />
                             <span className="text-[9px] font-black uppercase tracking-widest">
                                {t.status === 'resolved' ? 'Resolved' : 'Due in 4h'}
                             </span>
                          </div>
                          <div className="flex -space-x-2">
                             <div className="w-6 h-6 rounded-lg bg-slate-200 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[8px] font-black">JS</div>
                          </div>
                       </div>

                       {t.status === 'open' && (
                         <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand rounded-full" />
                       )}
                    </button>
                  ))
                )}
             </div>
           </div>
        </div>

        {/* Detail View */}
        <div className={cn(
          "flex-1 flex flex-col h-full transition-all duration-300",
          !selectedTicket ? "hidden lg:flex" : "flex"
        )}>
           {!selectedTicket ? (
             <div className="flex-1 bg-slate-50 dark:bg-white/5 border border-dashed border-border-dim rounded-[3rem] flex flex-col items-center justify-center text-center p-12 opacity-50">
                <MessageSquare className="w-16 h-16 text-slate-300 mb-6" />
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Select a support interaction</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-2 max-w-xs leading-loose">Access deep metadata, conversation history, and SLA override controls.</p>
             </div>
           ) : (
             <div className="flex-1 flex flex-col bg-card-bg border border-border-dim rounded-[3rem] shadow-sm overflow-hidden">
                {/* Detail Header */}
                <div className="p-6 md:p-8 border-b border-border-dim flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
                   <div className="flex items-center gap-5">
                      <button 
                        onClick={() => setSelectedTicket(null)}
                        className="lg:hidden p-3 bg-slate-50 dark:bg-white/5 rounded-2xl hover:bg-slate-100 transition-all"
                      >
                         <ArrowLeft className="w-5 h-5" />
                      </button>
                      <div className="w-14 h-14 bg-brand/10 rounded-2xl flex items-center justify-center">
                         <User className="w-7 h-7 text-brand" />
                      </div>
                      <div>
                         <div className="flex items-center gap-3">
                           <h3 className="text-lg font-black uppercase tracking-tight">{selectedTicket.subject}</h3>
                           <StatusBadge status={selectedTicket.status} />
                         </div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Tenant ID: {selectedTicket.tenant_id} • Assigned: Support-A1</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 w-full md:w-auto">
                      <select 
                        onChange={(e) => handleUpdateStatus(e.target.value)}
                        value={selectedTicket.status}
                        className="p-3 bg-slate-50 dark:bg-white/5 border border-border-dim rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none"
                      >
                         <option value="open">Open</option>
                         <option value="in_progress">In Progress</option>
                         <option value="waiting">Waiting</option>
                         <option value="resolved">Resolved</option>
                         <option value="closed">Closed</option>
                      </select>
                      <button className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl hover:bg-slate-200 transition-all">
                        <MoreVertical className="w-5 h-5 text-slate-500" />
                      </button>
                   </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                   {/* Description Area */}
                   <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-border-dim">
                      <div className="flex items-center gap-3 mb-4">
                         <AlertCircle className="w-5 h-5 text-brand" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Initial Request Summary</span>
                      </div>
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-relaxed">
                        {selectedTicket.description}
                      </p>
                   </div>

                   <AnimatePresence>
                     {selectedTicket.messages?.map((msg: any, idx: number) => (
                       <motion.div 
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         key={idx}
                         className={cn(
                           "flex gap-4 max-w-[85%]",
                           msg.type === 'agent' ? "ml-auto flex-row-reverse" : ""
                         )}
                       >
                          <div className={cn(
                            "w-10 h-10 rounded-xl shrink-0 flex items-center justify-center font-black text-[10px]",
                            msg.type === 'agent' ? "bg-brand text-white" : "bg-slate-100 text-slate-500"
                          )}>
                             {msg.type === 'agent' ? 'SP' : 'TN'}
                          </div>
                          <div className={cn(
                            "flex flex-col gap-1.5",
                            msg.type === 'agent' ? "items-end" : ""
                          )}>
                             <div className={cn(
                               "p-5 rounded-3xl text-xs font-medium shadow-sm border",
                               msg.type === 'agent' 
                                ? "bg-brand text-white border-transparent rounded-tr-none" 
                                : "bg-white dark:bg-slate-800 border-border-dim rounded-tl-none"
                             )}>
                                {msg.text}
                             </div>
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">
                                {msg.timestamp ? format(new Date(msg.timestamp.seconds * 1000), 'HH:mm • MMM d') : 'Just now'}
                             </span>
                          </div>
                       </motion.div>
                     ))}
                   </AnimatePresence>
                </div>

                {/* Reply Input */}
                <div className="p-6 border-t border-border-dim bg-slate-50/50 dark:bg-white/5 shrink-0">
                   <div className="flex flex-col gap-3">
                      <div className="flex gap-4 items-end bg-app-bg border border-border-dim rounded-[2rem] p-3 shadow-inner">
                         <textarea 
                           value={replyText}
                           onChange={(e) => setReplyText(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendReply())}
                           placeholder="Type an SLA-compliant response..."
                           className="flex-1 bg-transparent border-none outline-none resize-none py-3 px-4 text-xs font-bold min-h-[44px] max-h-[200px]"
                         />
                         <button 
                           onClick={handleSendReply}
                           disabled={sendingReply || !replyText.trim()}
                           className="bg-brand text-white p-4 rounded-2xl shadow-xl shadow-brand/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                         >
                            {sendingReply ? <Clock className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                         </button>
                      </div>
                      <div className="flex justify-between items-center px-4">
                         <div className="flex gap-4">
                            <button className="text-[10px] font-black uppercase text-slate-400 hover:text-brand flex items-center gap-1.5"><Flag className="w-3.5 h-3.5" /> Attachments</button>
                            <button className="text-[10px] font-black uppercase text-slate-400 hover:text-brand flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Quick Reply</button>
                         </div>
                         <p className="text-[9px] font-bold text-slate-400 uppercase italic">Press Enter to dispatch</p>
                      </div>
                   </div>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: any = {
    urgent: "bg-rose-100 text-rose-600 border-rose-200",
    high: "bg-amber-100 text-amber-600 border-amber-200",
    medium: "bg-blue-100 text-blue-600 border-blue-200",
    low: "bg-slate-100 text-slate-500 border-slate-200"
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-md text-[8px] font-black uppercase border tracking-tighter", styles[priority] || styles.low)}>
      {priority}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    open: "bg-emerald-100 text-emerald-600",
    in_progress: "bg-brand/10 text-brand",
    waiting: "bg-amber-100 text-amber-600",
    resolved: "bg-slate-100 text-slate-500",
    closed: "bg-slate-200 text-slate-600"
  };
  return (
    <span className={cn("px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest", styles[status] || styles.open)}>
      {status.replace('_', ' ')}
    </span>
  );
}

function SLACard({ label, value, icon: Icon, color }: any) {
  return (
    <div className={cn("px-5 py-3 rounded-2xl flex items-center gap-4 border border-border-dim shadow-sm", color)}>
       <Icon className="w-4 h-4" />
       <div className="flex flex-col">
          <span className="text-[9px] font-black uppercase tracking-widest opacity-60 leading-none mb-1">{label}</span>
          <span className="text-sm font-black leading-none">{value}</span>
       </div>
    </div>
  );
}
