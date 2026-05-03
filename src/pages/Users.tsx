import React, { useState } from "react";
import { 
  Users as UsersIcon, 
  Search, 
  Plus, 
  MoreVertical, 
  Mail, 
  Shield, 
  Clock, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  X,
  Filter,
  UserPlus,
  Key,
  ShieldAlert,
  Smartphone,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  department: string;
  status: "Active" | "Inactive" | "Pending";
  lastActive: string;
  avatar: string;
}

const initialUsers: UserAccount[] = [
  { id: "1", name: "Sabbir Khan", email: "Admin@asstella.com", role: "Super Admin", company: "Asstella", department: "Executive Board", status: "Active", lastActive: "Now", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sabbir" },
  { id: "2", name: "Sarah Miller", email: "smiller@asstella.com", role: "Company Admin", company: "Asstella", department: "Operations", status: "Active", lastActive: "2h ago", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
  { id: "3", name: "John Chen", email: "jchen@asstella.com", role: "Employee", company: "Asstella", department: "Logistics", status: "Active", lastActive: "1d ago", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John" },
  { id: "4", name: "Elena Rodriguez", email: "elena.r@asstella.com", role: "Finance Viewer", company: "Asstella", department: "Accounts", status: "Inactive", lastActive: "1w ago", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena" },
  { id: "5", name: "David Wilson", email: "dwilson@asstella.com", role: "Field Technician", company: "Asstella", department: "Maintenance", status: "Pending", lastActive: "Never", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David" },
];

export default function UsersPage() {
  const [users, setUsers] = useState<UserAccount[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || u.status.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to revoke this user's access?")) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 p-2 sm:p-0" id="user_management_page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
             <UsersIcon className="w-8 h-8 text-brand" /> User Management
          </h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Orchestrate enterprise directory and access control</p>
        </div>
        <button 
           onClick={() => { setSelectedUser(null); setIsModalOpen(true); }}
           className="btn-primary py-3 sm:py-4 px-6 sm:px-8 flex items-center justify-center gap-2 shadow-2xl shadow-brand/20 active:scale-95 transition-all text-sm sm:text-base whitespace-nowrap"
        >
           <UserPlus className="w-5 h-5" /> Onboard User
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatsCard label="Total Users" value={users.length} icon={UsersIcon} trend="+2 new this month" />
         <StatsCard label="Active Now" value={users.filter(u => u.status === "Active").length} icon={CheckCircle2} trend="84% utilization" variant="success" />
         <StatsCard label="Pending Invites" value={users.filter(u => u.status === "Pending").length} icon={Clock} trend="Requires follow-up" variant="warning" />
         <StatsCard label="System Admins" value={users.filter(u => u.role === "Super Admin").length} icon={Shield} trend="High privilege nodes" variant="info" />
      </div>

      <div className="bg-card-bg border border-border-dim rounded-[1.5rem] sm:rounded-[3rem] shadow-2xl p-4 sm:p-8 space-y-8">
         <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div className="relative flex-1 group">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand transition-colors" />
               <input 
                 type="text" 
                 placeholder="Search by name, email or department..." 
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
                 className="w-full bg-app-bg border border-border-dim rounded-[1.5rem] py-4 pl-14 pr-8 text-sm outline-none focus:ring-4 focus:ring-brand/10 transition-all font-medium"
               />
            </div>
            <div className="flex items-center bg-app-bg p-1 rounded-2xl border border-border-dim whitespace-nowrap overflow-x-auto no-scrollbar w-full xl:w-auto">
               {["all", "active", "inactive", "pending"].map(f => (
                 <button 
                   key={f} 
                   onClick={() => setFilter(f)}
                   className={cn(
                     "flex-1 xl:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                     filter === f ? "bg-brand text-white shadow-lg" : "text-slate-500 hover:text-slate-900"
                   )}
                 >
                   {f}
                 </button>
               ))}
            </div>
         </div>

         {/* Mobile Card View (visible on small screens) */}
         <div className="grid grid-cols-1 md:hidden gap-4">
            {filteredUsers.map(user => (
              <div key={user.id} className="bg-app-bg border border-border-dim rounded-2xl p-5 space-y-4 hover:border-brand/40 transition-all">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-app-bg shadow-lg">
                         <img src={user.avatar} alt={user.name} />
                      </div>
                      <div>
                         <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{user.name}</h4>
                         <p className="text-[10px] text-slate-500 font-bold">{user.email}</p>
                      </div>
                   </div>
                   <div className={cn(
                     "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter border",
                     user.status === "Active" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                     user.status === "Pending" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                     "bg-slate-500/10 text-slate-500 border-slate-500/20"
                   )}>
                      {user.status}
                   </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 py-3 border-y border-border-dim/50">
                   <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Role</p>
                      <div className="flex items-center gap-1.5">
                         <Shield className="w-3 h-3 text-brand" />
                         <span className="text-[10px] font-black uppercase text-slate-900 dark:text-white">{user.role}</span>
                      </div>
                   </div>
                   <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Activity</p>
                      <div className="flex items-center gap-1.5">
                         <Clock className="w-3 h-3 text-slate-400" />
                         <span className="text-[10px] font-bold text-slate-500">{user.lastActive}</span>
                      </div>
                   </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                   <button
                      onClick={() => { setSelectedUser(user); setIsActivityModalOpen(true); }}
                      className="p-3 bg-white dark:bg-white/5 border border-border-dim rounded-xl text-slate-500 hover:text-brand"
                   >
                      <Clock className="w-4 h-4" />
                   </button>
                   <button 
                      onClick={() => { setSelectedUser(user); setIsModalOpen(true); }}
                      className="flex-1 py-3 bg-white dark:bg-white/5 border border-border-dim rounded-xl text-[10px] font-black uppercase tracking-widest text-brand hover:shadow-lg transition-all"
                   >
                      Manage
                   </button>
                   <button 
                      onClick={() => handleDelete(user.id)}
                      className="p-3 bg-white dark:bg-white/5 border border-border-dim rounded-xl text-rose-500 hover:shadow-lg transition-all"
                   >
                      <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              </div>
            ))}
         </div>

         {/* Desktop Table View (visible on medium+ screens) */}
         <div className="bg-app-bg border border-border-dim rounded-[1.5rem] md:rounded-[2.5rem] overflow-x-auto hidden md:block">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-border-dim">
                     <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">User Profile</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Role & Organization</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Activity Log</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right whitespace-nowrap">Access Operations</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-border-dim">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="group hover:bg-slate-50 dark:hover:bg-brand/5 transition-all">
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-app-bg shadow-lg">
                                <img src={user.avatar} alt={user.name} />
                             </div>
                             <div>
                                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-brand transition-colors">{user.name}</h4>
                                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                   <Mail className="w-3 h-3" /> {user.email}
                                </div>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-2 mb-1">
                             <Shield className="w-3.5 h-3.5 text-brand" />
                             <span className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-tight">{user.role}</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.department}</span>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex justify-center">
                             <span className={cn(
                               "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter border",
                               user.status === "Active" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                               user.status === "Pending" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                               "bg-slate-500/10 text-slate-500 border-slate-500/20"
                             )}>
                                {user.status}
                             </span>
                          </div>
                       </td>
                       <td className="px-8 py-6 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[11px] font-bold text-slate-500">{user.lastActive}</span>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex items-center justify-end gap-3 translate-x-2 group-hover:translate-x-0 transition-transform">
                             <button
                                onClick={() => { setSelectedUser(user); setIsActivityModalOpen(true); }}
                                className="p-3 bg-white dark:bg-white/5 border border-border-dim rounded-xl hover:text-brand hover:shadow-lg transition-all"
                                title="View Login History and Activity Log"
                             >
                                <Clock className="w-4 h-4" />
                             </button>
                             <button 
                                onClick={() => { setSelectedUser(user); setIsModalOpen(true); }}
                                className="p-3 bg-white dark:bg-white/5 border border-border-dim rounded-xl hover:text-brand hover:shadow-lg transition-all"
                             >
                                <Edit3 className="w-4 h-4" />
                             </button>
                             <button 
                                onClick={() => handleDelete(user.id)}
                                className="p-3 bg-white dark:bg-white/5 border border-border-dim rounded-xl hover:text-rose-500 hover:shadow-lg transition-all"
                             >
                                <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* Pagination */}
         <div className="flex items-center justify-between pt-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Node capacity: 512/Unlimited</p>
            <div className="flex items-center gap-2">
               <button className="p-2 border border-border-dim rounded-xl hover:bg-slate-100 transition-all"><ChevronLeft className="w-4 h-4" /></button>
               <div className="flex items-center gap-1">
                  <span className="w-8 h-8 flex items-center justify-center bg-brand text-white rounded-lg text-xs font-black">1</span>
                  <span className="w-8 h-8 flex items-center justify-center text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-100">2</span>
               </div>
               <button className="p-2 border border-border-dim rounded-xl hover:bg-slate-100 transition-all"><ChevronRight className="w-4 h-4" /></button>
            </div>
         </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <UserModal 
             user={selectedUser} 
             onClose={() => setIsModalOpen(false)} 
             onSave={(u: UserAccount) => {
               if (selectedUser) {
                 setUsers(users.map(user => user.id === u.id ? u : user));
               } else {
                 setUsers([{ ...u, id: Date.now().toString(), avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}` }, ...users]);
               }
               setIsModalOpen(false);
             }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isActivityModalOpen && selectedUser && (
          <ActivityModal user={selectedUser} onClose={() => setIsActivityModalOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function ActivityModal({ user, onClose }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 text-slate-900 dark:text-white"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="bg-card-bg border border-border-dim w-full max-w-lg rounded-3xl sm:rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] flex flex-col h-full sm:h-auto overflow-y-auto"
      >
        <div className="p-6 sm:p-10 border-b border-border-dim flex items-center justify-between bg-slate-50/50 dark:bg-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>
            <div className="flex items-center gap-4 relative z-10">
               <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-app-bg shadow-lg">
                  <img src={user.avatar} alt={user.name} />
               </div>
               <div>
                  <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Activity Log</h3>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Audit Trail & Login History</p>
               </div>
            </div>
            <button onClick={onClose} className="p-2 sm:p-3 bg-white dark:bg-white/5 border border-border-dim rounded-xl sm:rounded-2xl hover:text-brand transition-all active:scale-95 z-10 text-2xl font-bold">×</button>
        </div>

        <div className="p-6 sm:p-10 space-y-6">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Activity</h4>
          
          <div className="space-y-6">
             <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0 mt-1">
                   <Clock className="w-4 h-4" />
                </div>
                <div>
                   <p className="text-sm font-bold text-slate-900 dark:text-white">System Login Session</p>
                   <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5">Logged in from Dashboard via OAuth (192.168.1.53)</p>
                   <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-2">{user.lastActive}</p>
                </div>
             </div>

             <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center flex-shrink-0 mt-1">
                   <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                   <p className="text-sm font-bold text-slate-900 dark:text-white">Approved Asset Transfer Request</p>
                   <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5">Authorized dispatch of "Dell XPS 15 (TR-892)" to Logistics Dept, London Branch.</p>
                   <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-2">1 day ago</p>
                </div>
             </div>

             <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                   <Edit3 className="w-4 h-4" />
                </div>
                <div>
                   <p className="text-sm font-bold text-slate-900 dark:text-white">Maintenance Ticket Closed</p>
                   <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5">Resolved critical cooling issue for "HVAC Unit C-22" mapped to Operations floor.</p>
                   <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-2">3 days ago</p>
                </div>
             </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function UserModal({ user, onClose, onSave }: any) {
  const [formData, setFormData] = useState<UserAccount>(user || {
    name: "",
    email: "",
    role: "Asset Manager",
    company: "Asstella",
    department: "Operations",
    status: "Active",
    lastActive: "Now",
    avatar: ""
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="bg-card-bg border border-border-dim w-full max-w-xl rounded-none sm:rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] flex flex-col h-full sm:h-auto overflow-y-auto"
      >
         <div className="p-6 sm:p-10 border-b border-border-dim flex items-center justify-between bg-slate-50/50 dark:bg-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>
            <div className="flex items-center gap-4 relative z-10">
               <div className="p-3 sm:p-4 bg-brand text-white rounded-[1.2rem] sm:rounded-[1.5rem] shadow-xl shadow-brand/20">
                  <UserPlus className="w-5 h-5 sm:w-6 sm:h-6" />
               </div>
               <div>
                  <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">{user ? "Access Profile" : "New Onboarding"}</h3>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Configure credentials and domain</p>
               </div>
            </div>
            <button onClick={onClose} className="p-2 sm:p-3 bg-white dark:bg-white/5 border border-border-dim rounded-xl sm:rounded-2xl hover:text-brand transition-all active:scale-95 z-10 text-2xl font-bold">×</button>
         </div>

         <div className="p-6 sm:p-10 space-y-6 sm:space-y-8 flex-grow">
            <div className="space-y-6">
               <div className="space-y-1.5 flex-1">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Legal Name</label>
                 <div className="relative group">
                   <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors"><UsersIcon className="w-4 h-4" /></div>
                   <input 
                     type="text" 
                     value={formData.name} 
                     onChange={e => setFormData({...formData, name: e.target.value})}
                     className="w-full bg-app-bg border border-border-dim rounded-[1.2rem] p-4 pl-14 text-sm focus:ring-4 focus:ring-brand/10 outline-none transition-all font-bold uppercase"
                     placeholder="E.G. ALEXANDER HAMILTON"
                   />
                 </div>
               </div>

               <div className="space-y-1.5 flex-1">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Enterprise Email Domain</label>
                 <div className="relative group">
                   <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors"><Mail className="w-4 h-4" /></div>
                   <input 
                     type="email" 
                     value={formData.email} 
                     onChange={e => setFormData({...formData, email: e.target.value})}
                     className="w-full bg-app-bg border border-border-dim rounded-[1.2rem] p-4 pl-14 text-sm focus:ring-4 focus:ring-brand/10 outline-none transition-all font-bold lowercase"
                     placeholder="NAME@ASSTELLA.COM"
                   />
                 </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Assigned Role</label>
                    <select 
                       value={formData.role} 
                       onChange={e => setFormData({...formData, role: e.target.value})}
                       className="w-full bg-app-bg border border-border-dim rounded-[1.2rem] p-4 text-sm focus:ring-4 focus:ring-brand/10 outline-none transition-all font-black uppercase appearance-none"
                    >
                       <option>Super Admin</option>
                       <option>Company Admin</option>
                       <option>Employee</option>
                       <option>Asset Manager</option>
                       <option>Procurement Officer</option>
                       <option>Finance Viewer</option>
                       <option>Field Technician</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Branch Affiliation</label>
                    <select 
                       value={formData.company} 
                       onChange={e => setFormData({...formData, company: e.target.value})}
                       className="w-full bg-app-bg border border-border-dim rounded-[1.2rem] p-4 text-sm focus:ring-4 focus:ring-brand/10 outline-none transition-all font-black uppercase appearance-none"
                    >
                       <option>Global HQ (New York)</option>
                       <option>EMEA Branch (London)</option>
                       <option>APAC Hub (Singapore)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Department</label>
                    <select 
                       value={formData.department} 
                       onChange={e => setFormData({...formData, department: e.target.value})}
                       className="w-full bg-app-bg border border-border-dim rounded-[1.2rem] p-4 text-sm focus:ring-4 focus:ring-brand/10 outline-none transition-all font-black uppercase appearance-none"
                    >
                       <option>Executive Board</option>
                       <option>Operations</option>
                       <option>Logistics</option>
                       <option>Accounts</option>
                       <option>Maintenance</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Approval Manager (Hierarchy)</label>
                    <select 
                       className="w-full bg-app-bg border border-border-dim rounded-[1.2rem] p-4 text-sm focus:ring-4 focus:ring-brand/10 outline-none transition-all font-black uppercase appearance-none text-slate-500"
                    >
                       <option>Sarah Jenkins (Operations)</option>
                       <option>Marcus Chen (Logistics)</option>
                       <option>System Default (Auto-Approval)</option>
                    </select>
                  </div>
               </div>
            </div>

            {!user && (
               <div className="bg-brand/5 border border-brand/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-4">
                  <div className="flex items-center gap-3">
                     <ShieldAlert className="w-5 h-5 text-brand" />
                     <h4 className="text-xs font-black uppercase tracking-tight">Security Handshake</h4>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">Onboarding this user will trigger an automated secure invite via the PGP-encrypted mail gateway.</p>
               </div>
            )}
         </div>

         <div className="p-6 sm:p-10 bg-slate-50/50 dark:bg-white/5 border-t border-border-dim flex flex-col sm:flex-row justify-end gap-3">
            <button 
              onClick={onClose}
              className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-white/10 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl border border-border-dim hover:bg-slate-100 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button 
              onClick={() => onSave(formData)}
              className="w-full sm:w-auto px-10 py-4 bg-brand text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-brand/20 hover:scale-105 transition-all active:scale-95"
            >
              Authorize User
            </button>
         </div>
      </motion.div>
    </motion.div>
  );
}

function StatsCard({ label, value, icon: Icon, trend, variant = "brand" }: any) {
  const colors = {
     brand: "bg-brand text-white shadow-brand/20",
     success: "bg-emerald-500 text-white shadow-emerald-500/20",
     warning: "bg-amber-500 text-white shadow-amber-500/20",
     info: "bg-blue-600 text-white shadow-blue-500/20"
  }[variant as keyof typeof colors];

  return (
    <div className="bg-card-bg border border-border-dim rounded-[2rem] p-6 shadow-xl relative overflow-hidden group">
       <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform", colors)}>
          <Icon className="w-6 h-6" />
       </div>
       <div className="space-y-1">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</h3>
          <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</p>
       </div>
       <div className="mt-4 flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest italic opacity-60">
          {trend}
       </div>
    </div>
  );
}
