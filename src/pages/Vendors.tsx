import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  Search,
  Star,
  Phone,
  Mail,
  MapPin,
  MoreVertical,
  Filter,
  Package,
  Award,
  ShieldCheck,
  X,
  Globe,
  ExternalLink,
  ArrowUpRight,
  MessageSquare,
  Truck,
  DollarSign,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";

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
    metrics: { quality: 95, speed: 90, price: 85 },
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
    metrics: { quality: 88, speed: 85, price: 92 },
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
    metrics: { quality: 98, speed: 95, price: 75 },
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
    metrics: { quality: 40, speed: 30, price: 95 },
  },
];

export default function VendorsPage() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const filteredVendors = vendors.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === "all") return matchesSearch;
    return matchesSearch && v.status.toLowerCase() === filter.toLowerCase();
  });

  const handleSave = (vendorData: any) => {
    if (editingVendor) {
      setVendors((prev) =>
        prev.map((v) =>
          v.id === editingVendor.id ? { ...v, ...vendorData } : v,
        ),
      );
    } else {
      const newVendor: Vendor = {
        ...vendorData,
        id: `VEN-00${vendors.length + 1}`,
        rating: 5.0,
        totalSpend: "$ 0",
        status: "Active",
        metrics: { quality: 100, speed: 100, price: 100 },
      };
      setVendors((prev) => [newVendor, ...prev]);
    }
    setIsModalOpen(false);
    setEditingVendor(null);
  };

  const handleDelete = (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to remove this vendor? All history will be archived.",
      )
    ) {
      setVendors((prev) => prev.filter((v) => v.id !== id));
      setSelectedVendor(null);
    }
  };

  return (
    <div
      className="space-y-6 animate-in slide-in-from-bottom-4 duration-500"
      id="vendors_page"
    >
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase flex items-center gap-3">
            <Users className="w-8 h-8 text-brand" /> Vendor Ecosystem
          </h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">
            Strategic sourcing and vendor relationship management
          </p>
        </div>
        <button
          className="w-full xl:w-auto px-8 py-3.5 bg-brand text-white font-black rounded-2xl shadow-xl shadow-brand/20 active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
          onClick={() => {
            setEditingVendor(null);
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4" /> ONBOARD VENDOR
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <VendorMetricCard
          title="Preferred Vendors"
          value={vendors
            .filter((v) => v.status === "Preferred")
            .length.toString()}
          icon={Award}
          color="text-amber-500"
        />
        <VendorMetricCard
          title="Contracts Ending"
          value="5"
          sub="Next 30 days"
          icon={ShieldCheck}
          color="text-brand"
        />
        <VendorMetricCard
          title="Under Review"
          value={vendors
            .filter((v) => v.status === "Under Review")
            .length.toString()}
          sub="Performance audits"
          icon={AlertCircle}
          color="text-rose-500"
        />
      </div>

      <div className="bg-card-bg border border-border-dim rounded-2xl p-2 sm:p-3 flex flex-col xl:flex-row xl:items-center gap-3 shadow-sm transition-colors duration-300">
        <div className="w-full xl:flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-app-bg border border-border-dim rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:ring-1 focus:ring-brand/40 outline-none"
          />
        </div>
        <div className="flex items-center gap-2 w-full xl:w-auto">
          <div className="flex-1 xl:flex-none flex items-center gap-2 px-3 py-2 border border-border-dim rounded-xl xl:border-none xl:rounded-none pr-2 xl:border-r">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex-1 xl:flex-none bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-slate-500 focus:ring-0 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="preferred">Preferred</option>
              <option value="active">Active</option>
              <option value="under review">Under Review</option>
              <option value="blacklisted">Blacklisted</option>
            </select>
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 text-slate-500 hover:text-brand transition-all border border-border-dim rounded-xl xl:border-none xl:rounded-none">
            <Globe className="w-3.5 h-3.5" />{" "}
            <span className="text-[10px] font-black uppercase tracking-widest">
              Marketplace
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredVendors.length === 0 ? (
          <div className="col-span-full py-12 sm:py-20 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Users className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">
              No vendors matching criteria
            </p>
          </div>
        ) : (
          filteredVendors.map((vendor) => (
            <motion.div
              key={vendor.id}
              layoutId={vendor.id}
              onClick={() => setSelectedVendor(vendor)}
              className="bg-card-bg border border-border-dim rounded-[2rem] p-6 sm:p-8 hover:border-brand/40 transition-all cursor-pointer group relative overflow-hidden shadow-sm hover:shadow-xl"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 rounded-full -mr-12 -mt-12 group-hover:bg-brand/10 transition-all"></div>

              <div className="flex items-start justify-between relative z-10">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-app-bg rounded-xl sm:rounded-2xl flex items-center justify-center border border-border-dim shadow-inner text-xl sm:text-2xl font-black text-brand uppercase">
                  {vendor.name.substring(0, 2)}
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 text-amber-500 mb-1">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="text-xs font-black">{vendor.rating}</span>
                  </div>
                  <StatusBadge status={vendor.status} />
                </div>
              </div>

              <div className="mt-6">
                <span className="text-[9px] font-black text-brand uppercase tracking-tighter font-mono">
                  {vendor.id}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-brand transition-colors truncate">
                  {vendor.name}
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-brand/30 pl-2 mt-1 truncate">
                  {vendor.category}
                </p>
              </div>

              <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-4">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis">
                    <Phone className="w-3 h-3 text-brand" /> {vendor.phone}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis">
                    <Mail className="w-3 h-3 text-brand" /> {vendor.email}
                  </div>
                </div>
                <div className="text-right flex flex-col justify-end">
                  <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-1">
                    Total spend
                  </span>
                  <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tighter">
                    {vendor.totalSpend}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <VendorModal
            vendor={editingVendor}
            onClose={() => {
              setIsModalOpen(false);
              setEditingVendor(null);
            }}
            onSave={handleSave}
          />
        )}
        {selectedVendor && (
          <VendorDetailModal
            vendor={selectedVendor}
            onClose={() => setSelectedVendor(null)}
            onEdit={() => {
              setEditingVendor(selectedVendor);
              setSelectedVendor(null);
              setIsModalOpen(true);
            }}
            onDelete={() => handleDelete(selectedVendor.id)}
            onUpdate={(updated) => {
              setVendors((prev) =>
                prev.map((v) => (v.id === updated.id ? updated : v)),
              );
              setSelectedVendor(updated);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

import { AlertCircle, Trash2, Edit3, Settings } from "lucide-react";

function VendorMetricCard({ title, value, sub, icon: Icon, color }: any) {
  return (
    <div className="bg-card-bg border border-border-dim p-5 sm:p-7 rounded-[1.5rem] sm:rounded-[2.5rem] flex items-center gap-4 sm:gap-6 shadow-sm group hover:scale-[1.02] transition-all">
      <div
        className={cn(
          "w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center bg-app-bg border border-border-dim shadow-inner",
          color,
        )}
      >
        <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
      </div>
      <div>
        <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {title}
        </h4>
        <div className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
          {value}
        </div>
        {sub && (
          <p className="text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase mt-0.5 tracking-tighter">
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Preferred:
      "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.05)] text-white bg-amber-500 border-none",
    Active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    "Under Review": "bg-brand/10 text-brand border-brand/20",
    Blacklisted: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  };
  return (
    <span
      className={cn(
        "px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
        styles[status],
      )}
    >
      {status}
    </span>
  );
}

function VendorModal({ vendor, onClose, onSave }: any) {
  const [formData, setFormData] = useState(
    vendor || {
      name: "",
      category: "Hardware",
      contactPerson: "",
      email: "",
      phone: "",
      location: "",
    },
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-app-bg border border-border-dim w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] relative"
      >
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
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-black text-xl uppercase tracking-tight text-slate-900 dark:text-white">
              {vendor ? "Update Profile" : "Onboard New Vendor"}
            </h3>
          </div>
        </div>
        <div className="p-10 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
              Vendor Name
            </label>
            <input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full bg-card-bg p-4 rounded-2xl text-sm font-bold border border-border-dim focus:ring-1 focus:ring-brand outline-none"
              placeholder="e.g. Acme Corporation"
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full bg-card-bg p-4 rounded-2xl text-sm font-bold border border-border-dim outline-none cursor-pointer"
              >
                <option>Hardware</option>
                <option>Software</option>
                <option>Network</option>
                <option>Furniture</option>
                <option>Logistics</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                Contact Person
              </label>
              <input
                value={formData.contactPerson}
                onChange={(e) =>
                  setFormData({ ...formData, contactPerson: e.target.value })
                }
                className="w-full bg-card-bg p-4 rounded-2xl text-sm font-bold border border-border-dim outline-none"
              />
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                Email
              </label>
              <input
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full bg-card-bg p-4 rounded-2xl text-sm font-bold border border-border-dim outline-none"
                placeholder="contact@vendor.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                Phone
              </label>
              <input
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full bg-card-bg p-4 rounded-2xl text-sm font-bold border border-border-dim outline-none"
                placeholder="+880..."
              />
            </div>
          </div>
          <button
            onClick={() => onSave(formData)}
            className="w-full py-5 bg-brand text-white font-black rounded-2xl shadow-2xl shadow-brand/30 active:scale-95 transition-all uppercase tracking-[0.2em] text-xs mt-6"
          >
            {vendor ? "COMMIT CHANGES" : "REGISTER VENDOR PARTNER"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function VendorDetailModal({
  vendor,
  onClose,
  onEdit,
  onDelete,
  onUpdate,
}: any) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-0 sm:p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        className="bg-app-bg border border-border-dim w-full max-w-5xl rounded-none sm:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-full max-h-full sm:max-h-[90vh] relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-8 sm:right-8 z-50 p-2 sm:p-3 bg-slate-100 dark:bg-white/10 hover:bg-brand hover:text-white rounded-xl sm:rounded-2xl border border-border-dim transition-all group shadow-xl"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-300" />
        </button>

        {/* Left Side: Profile Summary */}
        <div className="w-full md:w-96 border-b md:border-b-0 md:border-r border-border-dim bg-slate-50/30 dark:bg-black/20 p-6 sm:p-12 flex flex-col items-center text-center">
          <div className="w-20 h-20 sm:w-32 sm:h-32 bg-brand text-white rounded-2xl sm:rounded-[2.5rem] flex items-center justify-center text-3xl sm:text-5xl font-black shadow-2xl border-4 border-app-bg mb-4 sm:mb-6 relative">
            {vendor.name.substring(0, 2)}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">
            {vendor.name}
          </h3>
          <p className="text-[8px] sm:text-[10px] font-black text-brand uppercase tracking-widest mt-2">
            {vendor.category} PROVIDER
          </p>

          <div className="w-full mt-6 sm:mt-10 space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between p-3 sm:p-5 bg-app-bg border border-border-dim rounded-xl sm:rounded-2xl">
              <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase">
                Vendor ID
              </span>
              <span className="text-[8px] sm:text-[10px] font-black text-slate-900 dark:text-white font-mono">
                {vendor.id}
              </span>
            </div>
            <div className="flex flex-col gap-2 p-3 sm:p-5 bg-app-bg border border-border-dim rounded-xl sm:rounded-2xl text-left">
              <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase mb-1">
                Status Policy
              </span>
              <select
                value={vendor.status}
                onChange={(e) =>
                  onUpdate({ ...vendor, status: e.target.value })
                }
                className="bg-slate-50 dark:bg-white/5 border border-border-dim rounded-xl p-2 text-[9px] sm:text-xs font-black uppercase tracking-widest outline-none cursor-pointer w-full"
              >
                <option>Preferred</option>
                <option>Active</option>
                <option>Under Review</option>
                <option>Blacklisted</option>
              </select>
            </div>
          </div>

          <div className="mt-6 md:mt-auto flex flex-col gap-2 sm:gap-3 w-full">
            <button
              onClick={() => navigate(`/vendors/${vendor.id}`)}
              className="w-full py-3 sm:py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-xl sm:rounded-2xl uppercase tracking-widest text-[10px] shadow-xl flex items-center justify-center gap-2 group/full"
            >
              Go to Profile <ArrowUpRight className="w-4 h-4" />
            </button>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={onEdit}
                className="flex-1 py-3 sm:py-4 bg-brand text-white font-black rounded-xl sm:rounded-2xl shadow-lg border border-brand uppercase tracking-widest text-[9px] sm:text-[10px] flex items-center justify-center gap-1"
              >
                <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" /> Edit
              </button>
              <button
                onClick={onDelete}
                className="flex-1 py-3 sm:py-4 bg-rose-500/10 text-rose-500 border border-rose-500/20 font-black rounded-xl sm:rounded-2xl hover:bg-rose-500 hover:text-white transition-all uppercase tracking-widest text-[9px] sm:text-[10px] flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" /> Archive
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Detailed Info */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-16 space-y-8 sm:space-y-12 custom-scrollbar">
          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <PerformanceMetric
              label="Quality"
              value={vendor.metrics.quality}
              icon={ShieldCheck}
              color="text-emerald-500"
            />
            <PerformanceMetric
              label="Speed"
              value={vendor.metrics.speed}
              icon={Truck}
              color="text-brand"
            />
            <PerformanceMetric
              label="Price"
              value={vendor.metrics.price}
              icon={DollarSign}
              color="text-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            <div className="space-y-4 sm:space-y-6">
              <h4 className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-border-dim pb-3 sm:pb-4 flex items-center gap-2">
                <Users className="w-4 h-4" /> Key Contacts
              </h4>
              <div className="space-y-4 sm:space-y-6 bg-slate-50/50 dark:bg-white/5 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-border-dim">
                <div>
                  <label className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Primary Liaison
                  </label>
                  <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1 uppercase tracking-tight">
                    {vendor.contactPerson}
                  </p>
                </div>
                <div>
                  <label className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Office HQ
                  </label>
                  <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 mt-1 uppercase leading-snug">
                    {vendor.location}
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-brand/10 rounded-lg flex items-center justify-center">
                      <Phone className="w-3.5 h-3.5 text-brand" />
                    </div>
                    <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      {vendor.phone}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-brand/10 rounded-lg flex items-center justify-center">
                      <Mail className="w-3.5 h-3.5 text-brand" />
                    </div>
                    <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                      {vendor.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <h4 className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-border-dim pb-3 sm:pb-4 flex items-center gap-2">
                <Award className="w-4 h-4" /> Compliance
              </h4>
              <div className="p-6 sm:p-8 bg-brand/5 border border-brand/20 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-inner">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[8px] sm:text-[10px] font-black text-brand uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-500 text-white text-[7px] sm:text-[8px] font-black rounded-full uppercase tracking-widest">
                    Active
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-bold uppercase font-mono">
                  ISO 9001:2015 COMPLIANT. Audit: 12 MAR 2026.
                </p>
                <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-brand/20">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] sm:text-[9px] font-black text-brand/60 uppercase">
                      Spend
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      {vendor.totalSpend}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border-dim pb-4">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Supply Chain Interaction Log
              </h4>
              <button className="text-[10px] font-black text-brand uppercase tracking-widest flex items-center gap-1 hover:underline">
                View Ledger <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[
                {
                  id: "PO-9912",
                  title: "Enterprise Firewall License",
                  date: "15 Apr 2026",
                  amount: "$ 4,200",
                  status: "Delivered",
                },
                {
                  id: "PO-9540",
                  title: "Core Network Cabinets x2",
                  date: "02 Mar 2026",
                  amount: "$ 1,800",
                  status: "Delivered",
                },
                {
                  id: "PO-8821",
                  title: "Biometric Access Control",
                  date: "10 Jan 2026",
                  amount: "$ 12,500",
                  status: "Delivered",
                },
              ].map((tx, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-6 bg-app-bg border border-border-dim rounded-[1.5rem] hover:bg-slate-50 dark:hover:bg-white/5 transition-all group/item cursor-default"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-white/10 rounded-2xl flex items-center justify-center group-hover/item:bg-brand group-hover/item:text-white transition-colors">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase font-mono tracking-tighter">
                        {tx.id}
                      </span>
                      <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        {tx.title}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black text-slate-900 dark:text-white tracking-tighter">
                      {tx.amount}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      {tx.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function PerformanceMetric({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-card-bg border border-border-dim p-6 rounded-[2rem] flex flex-col items-center gap-4 text-center shadow-sm">
      <div
        className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center bg-app-bg border border-border-dim shadow-inner",
          color,
        )}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
          {label}
        </h5>
        <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
          {value}%
        </div>
      </div>
      <div className="w-full h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className={cn("h-full", color.replace("text-", "bg-"))}
        />
      </div>
    </div>
  );
}
