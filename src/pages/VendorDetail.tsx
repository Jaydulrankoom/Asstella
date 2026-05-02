import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  Users, 
  ArrowLeft, 
  Star, 
  Phone, 
  Mail, 
  MapPin, 
  Award, 
  ShieldCheck, 
  ExternalLink, 
  Truck, 
  DollarSign,
  Package,
  Calendar,
  MoreVertical,
  Activity,
  Globe,
  Edit3,
  Trash2,
  FileText
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion } from "motion/react";

interface Vendor {
  id: string;
  name: string;
  category: string;
  rating: number;
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
  status: "Preferred" | "Active" | "Under Review" | "Blacklisted";
  totalSpend: string;
  metrics: {
    quality: number;
    speed: number;
    price: number;
  };
}

const initialVendors: Vendor[] = [
  { 
    id: "VEN-001", 
    name: "Global Tech Solutions", 
    category: "Hardware", 
    rating: 4.8, 
    contactPerson: "John Doe", 
    email: "sales@globaltech.com", 
    phone: "+880 1711-223344", 
    location: "Dhaka, BD", 
    status: "Preferred", 
    totalSpend: "$ 145,000",
    metrics: { quality: 95, speed: 90, price: 85 }
  },
  { 
    id: "VEN-002", 
    name: "Modern Spaces Ltd", 
    category: "Furniture", 
    rating: 4.5, 
    contactPerson: "Sarah Smith", 
    email: "sarah@modernspaces.com", 
    phone: "+880 1822-998877", 
    location: "Chittagong, BD", 
    status: "Active", 
    totalSpend: "$ 24,500",
    metrics: { quality: 88, speed: 85, price: 92 }
  },
  { 
    id: "VEN-003", 
    name: "NetWorks Pro", 
    category: "Network", 
    rating: 4.9, 
    contactPerson: "Mike Ross", 
    email: "m.ross@networkspro.net", 
    phone: "+880 1911-332211", 
    location: "Singapore", 
    status: "Preferred", 
    totalSpend: "$ 82,000",
    metrics: { quality: 98, speed: 95, price: 75 }
  },
  { 
    id: "VEN-004", 
    name: "Cheap Gadgets Co.", 
    category: "Hardware", 
    rating: 2.1, 
    contactPerson: "Tom Late", 
    email: "tom@cheapgadgets.com", 
    phone: "+880 1511-000011", 
    location: "China", 
    status: "Under Review", 
    totalSpend: "$ 1,200",
    metrics: { quality: 40, speed: 30, price: 95 }
  },
];

export default function VendorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetch
    const timer = setTimeout(() => {
      const found = initialVendors.find(v => v.id === id);
      setVendor(found || null);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [id]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-10 h-10 text-brand animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Fetching Partner Profile...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6">
        <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center shadow-2xl">
          <Users className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Profile Not Found</h2>
          <p className="text-slate-500 max-w-md mx-auto mt-2 uppercase text-[10px] font-bold tracking-widest leading-loose">
            The vendor ID identifier ({id}) does not exist in the active procurement ecosystem or has been archived.
          </p>
        </div>
        <button 
          onClick={() => navigate("/vendors")}
          className="px-10 py-4 bg-brand text-white font-black rounded-2xl shadow-2xl shadow-brand/20 uppercase tracking-widest text-xs active:scale-95 transition-all"
        >
          Return to Registry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700" id="vendor_detail_page">
      {/* Breadcrumbs & Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate("/vendors")}
          className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Ecosystem
        </button>
        <div className="flex items-center gap-4">
           <button className="p-3 bg-card-bg border border-border-dim rounded-xl text-slate-400 hover:text-brand transition-all shadow-sm">
              <MoreVertical className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="bg-card-bg border border-border-dim rounded-3xl sm:rounded-[3rem] p-6 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-12 items-center md:items-start text-center md:text-left transition-colors duration-300">
         <div className="absolute top-0 right-0 w-96 h-96 bg-brand/5 rounded-full blur-3xl -mr-48 -mt-48 transition-all"></div>
         
         <div className="w-32 h-32 sm:w-40 sm:h-40 bg-brand text-white rounded-[2.5rem] flex items-center justify-center text-4xl sm:text-6xl font-black shadow-2xl border-4 border-app-bg relative flex-shrink-0">
            {vendor.name.substring(0, 2)}
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 border-4 border-app-bg rounded-2xl flex items-center justify-center shadow-lg">
               <ShieldCheck className="w-5 h-5 text-white" />
            </div>
         </div>

         <div className="flex-1 space-y-6 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">{vendor.name}</h1>
                  <div className="flex items-center justify-center md:justify-start gap-4 mt-3">
                     <span className={cn(
                       "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border",
                       vendor.status === "Preferred" ? "bg-amber-500 text-white border-none shadow-lg shadow-amber-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                     )}>
                        {vendor.status} PARTNER
                     </span>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{vendor.category} DIVISION</span>
                  </div>
               </div>
               <div className="flex flex-col items-center md:items-end">
                  <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                     {[...Array(5)].map((_, i) => (
                        <Star key={i} className={cn("w-4 h-4", i < Math.floor(vendor.rating) ? "fill-current" : "opacity-30")} />
                     ))}
                     <span className="ml-2 text-lg font-black text-slate-900 dark:text-white">{vendor.rating}</span>
                  </div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Partner Rating</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-border-dim/50">
               <ContactInfo icon={Phone} label="Contact Support" value={vendor.phone} />
               <ContactInfo icon={Mail} label="Billing Email" value={vendor.email} />
               <ContactInfo icon={MapPin} label="Headquarters" value={vendor.location} />
            </div>
         </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
         {/* Performance Section */}
         <div className="col-span-12 lg:col-span-8 space-y-8">
            <div className="bg-card-bg border border-border-dim rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-10 shadow-sm">
               <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-10 flex items-center gap-3">
                  <Activity className="w-6 h-6 text-brand" /> Performance Analytics
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <PerformanceMetric label="Product Quality" value={vendor.metrics.quality} icon={ShieldCheck} color="text-emerald-500" />
                  <PerformanceMetric label="Delivery Speed" value={vendor.metrics.speed} icon={Truck} color="text-brand" />
                  <PerformanceMetric label="Pricing Integrity" value={vendor.metrics.price} icon={DollarSign} color="text-amber-500" />
               </div>
            </div>

            <div className="bg-card-bg border border-border-dim rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-10 shadow-sm">
               <div className="flex items-center justify-between mb-8 border-b border-border-dim pb-6">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Supply Chain Log</h3>
                  <button className="text-[10px] font-black text-brand uppercase tracking-widest flex items-center gap-2 hover:underline">
                     Full Ledger <ExternalLink className="w-3 h-3" />
                  </button>
               </div>
               <div className="space-y-4">
                  {[
                    { id: "PO-9912", title: "Enterprise Firewall License", date: "15 Apr 2026", amount: "$ 4,200", status: "Delivered" },
                    { id: "PO-9540", title: "Core Network Cabinets x2", date: "02 Mar 2026", amount: "$ 1,800", status: "Delivered" },
                    { id: "PO-8821", title: "Biometric Access Control", date: "10 Jan 2026", amount: "$ 12,500", status: "Delivered" }
                  ].map((tx, i) => (
                    <div key={i} className="flex items-center justify-between p-6 bg-app-bg border border-border-dim rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all group/item cursor-default">
                       <div className="flex items-center gap-6">
                          <div className="w-12 h-12 bg-slate-100 dark:bg-white/10 rounded-xl flex items-center justify-center group-hover/item:bg-brand group-hover/item:text-white transition-colors">
                             <Package className="w-6 h-6" />
                          </div>
                          <div>
                             <span className="text-[9px] font-black text-slate-400 uppercase font-mono">{tx.id}</span>
                             <p className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">{tx.title}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">{tx.amount}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tx.date}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Info & Side Stats */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            <div className="bg-slate-900 text-white rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-brand/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-brand/30 transition-all"></div>
               <DollarSign className="w-12 h-12 text-brand mb-8" />
               <h4 className="text-[10px] font-black text-brand uppercase tracking-widest mb-2">Lifetime Expenditure</h4>
               <div className="text-3xl sm:text-5xl font-black tracking-tighter mb-4">{vendor.totalSpend}</div>
               <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed mb-10 opacity-70">
                  Total capital processed through this vendor across all fiscal years and departments.
               </p>
               <button className="w-full py-4 bg-brand text-white font-black rounded-2xl shadow-xl shadow-brand/20 uppercase tracking-widest text-[10px] active:scale-95 transition-all">
                  Request Spend Analysis
               </button>
            </div>

            <div className="bg-card-bg border border-border-dim rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-8 shadow-sm">
               <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-border-dim pb-4 mb-6 flex items-center gap-2">
                  <Award className="w-4 h-4" /> Compliance Badge
               </h3>
               <div className="space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase leading-none">Security Cleared</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">SOC2 Type II Compliant</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-brand/10 text-brand rounded-xl flex items-center justify-center">
                        <Award className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase leading-none">ISO 9001:2015</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Quality Management System</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center">
                        <Globe className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase leading-none">Global Partner</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Strategic Supply Chain Tier</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-card-bg border border-border-dim rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-8 shadow-sm">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Digital Presence</h3>
                  <Globe className="w-4 h-4 text-slate-300" />
               </div>
               <div className="space-y-3">
                  <ExternalLinkItem label="Company Website" value="www.globaltech.com" />
                  <ExternalLinkItem label="Support Portal" value="support.globaltech.com" />
                  <ExternalLinkItem label="Public Catalog" value="view-catalog.gt" />
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function ContactInfo({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-start gap-4 group cursor-default">
       <div className="w-10 h-10 bg-slate-50 dark:bg-white/5 rounded-xl border border-border-dim flex items-center justify-center group-hover:border-brand/40 transition-all">
          <Icon className="w-4 h-4 text-brand" />
       </div>
       <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-[150px]">{value}</p>
       </div>
    </div>
  );
}

function PerformanceMetric({ label, value, icon: Icon, color }: any) {
  return (
    <div className="flex flex-col items-center text-center gap-3">
       <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center bg-app-bg border border-border-dim shadow-inner", color)}>
          <Icon className="w-7 h-7" />
       </div>
       <div>
          <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{label}</h5>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{value}%</div>
       </div>
       <div className="w-full h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={cn("h-full", color.replace('text-', 'bg-'))}
          />
       </div>
    </div>
  );
}

function ExternalLinkItem({ label, value }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-app-bg border border-border-dim rounded-2xl hover:border-brand/40 transition-all cursor-pointer group">
       <div>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="text-[11px] font-black text-slate-900 dark:text-white">{value}</p>
       </div>
       <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand transition-all" />
    </div>
  );
}
