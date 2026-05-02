import { useState, useMemo, useEffect } from "react";
import { Plus, QrCode, Search as SearchIcon, Download, SlidersHorizontal, MoreVertical, X, Check, Tag, DollarSign, MapPin, User as UserIcon, ShieldCheck } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useSearchParams } from "react-router-dom";

interface Asset {
  code: string;
  name: string;
  category: string;
  location: string;
  user: string;
  status: string;
  value: string;
  date: string;
  serial?: string;
  description?: string;
  complianceStatus: "Verified" | "Caution" | "Pending";
}

const initialAssets: Asset[] = [
  { code: "A001", name: "Laptop Dell Latitude 5420", category: "IT Equipment", location: "Lab 1", user: "Rahim Ahmed", status: "Active", value: "$ 1,200", date: "12 May 2023", serial: "DELL-5420-991", description: "Standard issue developer laptop", complianceStatus: "Verified" },
  { code: "A002", name: "Laser Jet Pro M404n", category: "Office Device", location: "Admin Block", user: "Karim Uddin", status: "Repair", value: "$ 450", date: "05 Jan 2024", serial: "HP-LJ-M404N", description: "Main office printer", complianceStatus: "Verified" },
  { code: "A003", name: "Desktop HP EliteDesk", category: "IT Equipment", location: "Accounts", user: "Nabila Tabassum", status: "Active", value: "$ 980", date: "22 Nov 2023", serial: "HP-ED-112", description: "Accounts department workstation", complianceStatus: "Verified" },
  { code: "A004", name: "APC Smart-UPS 1500VA", category: "Power Systems", location: "Server Room", user: "System", status: "Maintenance", value: "$ 600", date: "15 Mar 2024", serial: "APC-SK-1500", description: "Critical server power backup", complianceStatus: "Verified" },
  { code: "A005", name: "Projector Epson EB-X06", category: "Teaching Aid", location: "Room 302", user: "Faridul Haque", status: "Lost", value: "$ 550", date: "10 Feb 2024", serial: "EPS-X06-55", description: "Classroom projector", complianceStatus: "Caution" },
  { code: "A006", name: "Honda Civic 2022", category: "Vehicles", location: "Garage", user: "Official Pool", status: "Active", value: "$ 32,000", date: "30 Jun 2022", serial: "VIN-CIV-2022", description: "Official company vehicle", complianceStatus: "Verified" },
  { code: "A007", name: "Conference Tablet S8", category: "IT Equipment", location: "Meeting Rm", user: "Pool", status: "Active", value: "$ 700", date: "18 Aug 2023", serial: "SAM-S8-99", description: "Shared tablet for conferencing", complianceStatus: "Verified" },
  { code: "A008", name: "Cisco Catalyst 9200", category: "Network Devices", location: "Server Room", user: "Network Team", status: "Active", value: "$ 4,500", date: "12 Jan 2024", serial: "CS-9200-XX", description: "Core network switch", complianceStatus: "Verified" },
  { code: "A009", name: "Industrial Lathe Machine", category: "Manufacturing", location: "Workshop A", user: "Suresh Mani", status: "Damaged", value: "$ 15,000", date: "05 Mar 2023", serial: "LATHE-2023-01", description: "High-precision manufacturing lathe", complianceStatus: "Caution" },
  { code: "A010", name: "Ergonomic Office Chair", category: "Furniture", location: "HR Office", user: "Rina Begum", status: "Active", value: "$ 250", date: "20 Dec 2023", serial: "CHR-ERG-99", description: "Mesh back ergonomic chair", complianceStatus: "Verified" },
  { code: "A011", name: "iPhone 15 Pro", category: "Mobile Devices", location: "Marketing", user: "Anika Roy", status: "Under Repair", value: "$ 1,100", date: "15 Oct 2023", serial: "IPH-15P-XYZ", description: "Marketing department testing device", complianceStatus: "Verified" },
  { code: "A012", name: "Security Camera 4K", category: "Security Systems", location: "Main Gate", user: "Security", status: "Maintenance", value: "$ 400", date: "01 Feb 2024", serial: "CAM-4K-002", description: "Entry point surveillance", complianceStatus: "Pending" },
];

export default function Assets() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "preview">("add");

  const categories = useMemo(() => {
    return ["All", ...new Set(assets.map(a => a.category))];
  }, [assets]);

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (asset.serial && asset.serial.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = categoryFilter === "All" || asset.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [assets, searchTerm, categoryFilter]);

  const handleAddAsset = (newAsset: Asset) => {
    setAssets(prev => [newAsset, ...prev]);
    setIsModalOpen(false);
  };

  const handleEditAsset = (updatedAsset: Asset) => {
    setAssets(prev => prev.map(a => a.code === updatedAsset.code ? updatedAsset : a));
    setIsModalOpen(false);
  };

  const handleDeleteAsset = (assetCode: string) => {
    if (confirm("Are you sure you want to delete this asset? This action cannot be undone.")) {
      setAssets(prev => prev.filter(a => a.code !== assetCode));
      setIsModalOpen(false);
    }
  };

  const openAddModal = () => {
    setModalMode("add");
    setSelectedAsset(null);
    setIsModalOpen(true);
  };

  const openEditModal = (asset: Asset) => {
    setModalMode("edit");
    setSelectedAsset(asset);
    setIsModalOpen(true);
  };

  const openPreviewModal = (asset: Asset) => {
    setModalMode("preview");
    setSelectedAsset(asset);
    setIsModalOpen(true);
  };

  const handleScan = () => {
    setIsQRScannerOpen(true);
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setSearchTerm("A001");
      setTimeout(() => setIsQRScannerOpen(false), 1200);
    }, 2500);
  };

  useEffect(() => {
    if (searchParams.get("action") === "add") {
      openAddModal();
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500" id="assets_page">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors duration-300" id="assets_title">Asset Registry</h2>
          <p className="text-slate-500 text-sm">Managing {assets.length} enterprise assets</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            className="flex-1 sm:flex-none bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 px-4 py-2 rounded-lg text-[10px] sm:text-xs font-black flex items-center justify-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-200 dark:border-white/5 uppercase tracking-widest" 
            id="btn_export"
            onClick={() => alert("Exporting data to Excel...")}
          >
            <Download className="w-4 h-4" /> EXPORT
          </button>
          <button 
            className="flex-1 sm:flex-none btn-primary flex items-center justify-center gap-2 shadow-lg shadow-brand/20 text-[10px] sm:text-xs font-black uppercase tracking-widest" 
            id="btn_add_asset"
            onClick={openAddModal}
          >
            <Plus className="w-4 h-4" /> ADD ASSET
          </button>
        </div>
      </div>

      <div className="bg-card-bg border border-border-dim p-4 sm:p-5 rounded-2xl flex flex-col xl:flex-row xl:items-center gap-4 shadow-xl transition-colors duration-300">
        <div className="flex-1 w-full relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by name, serial number, or code..." 
            className="w-full bg-app-bg border border-border-dim pl-11 pr-4 py-3 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/40 placeholder:text-slate-400 transition-colors duration-300 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full xl:w-auto">
          <div className="flex-1 xl:flex-none relative group">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full appearance-none bg-app-bg border border-border-dim rounded-xl px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/40 transition-all duration-300 pr-10 cursor-pointer shadow-sm"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat} ({cat === "All" ? assets.length : assets.filter(a => a.category === cat).length})</option>)}
            </select>
            <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
          <button 
            className="p-3 bg-brand/10 text-brand rounded-xl hover:bg-brand/20 transition-all border border-brand/20 shadow-sm" 
            onClick={handleScan}
            title="Scan QR Code"
          >
            <QrCode className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 md:hidden gap-4">
        {filteredAssets.map(asset => (
          <div 
             key={asset.code} 
             onClick={() => openPreviewModal(asset)}
             className="bg-card-bg border border-border-dim rounded-2xl p-5 space-y-4 shadow-sm hover:border-brand transition-all"
          >
             <div className="flex items-center justify-between">
                <span className="text-brand font-black text-[10px] bg-brand/10 px-2 py-1 rounded border border-brand/20 uppercase">{asset.code}</span>
                <ComplianceBadge status={asset.complianceStatus} />
             </div>
             <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{asset.name}</h4>
                <p className="text-[10px] text-slate-500 font-bold">{asset.category}</p>
             </div>
             
             <div className="grid grid-cols-2 gap-4 py-3 border-y border-border-dim/50">
                <div className="space-y-1">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                   <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-900 dark:text-white uppercase">
                      <MapPin className="w-3 h-3 text-slate-400" /> {asset.location}
                   </div>
                </div>
                <div className="space-y-1">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                   <StatusBadge status={asset.status} />
                </div>
             </div>

             <div className="flex items-center justify-between pt-2">
                <div className="flex flex-col">
                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Valuation</span>
                   <span className="text-sm font-black text-slate-900 dark:text-white">{asset.value}</span>
                </div>
                <button 
                   onClick={(e) => { e.stopPropagation(); openEditModal(asset); }}
                   className="p-3 bg-app-bg border border-border-dim rounded-xl hover:text-brand transition-all"
                >
                   <MoreVertical className="w-4 h-4" />
                </button>
             </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="bg-card-bg border border-border-dim rounded-2xl overflow-hidden shadow-xl transition-colors duration-300 hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-app-bg text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-border-dim transition-colors duration-300">
                <th className="px-6 py-4">Asset Code</th>
                <th className="px-6 py-4">Name & Description</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Compliance</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 Transition-colors duration-300">
              {filteredAssets.map((asset) => (
                <tr 
                  key={asset.code} 
                  className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                  onClick={() => openPreviewModal(asset)}
                >
                  <td className="px-6 py-5">
                    <span className="text-brand font-bold text-xs bg-brand/10 px-2 py-1 rounded border border-brand/20">{asset.code}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand transition-colors">{asset.name}</span>
                      <span className="text-[10px] text-slate-500">{asset.date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-400 font-medium">{asset.category}</td>
                  <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-400">{asset.location}</td>
                  <td className="px-6 py-5">
                    <StatusBadge status={asset.status} />
                  </td>
                  <td className="px-6 py-5">
                    <ComplianceBadge status={asset.complianceStatus} />
                  </td>
                  <td className="px-6 py-5 font-bold text-slate-900 dark:text-white text-sm">{asset.value}</td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(asset);
                      }}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <AssetModal 
            mode={modalMode} 
            asset={selectedAsset} 
            onClose={() => setIsModalOpen(false)} 
            onSave={modalMode === "add" ? handleAddAsset : handleEditAsset}
            onDelete={handleDeleteAsset}
          />
        )}
        {isQRScannerOpen && (
          <QRScannerModal isScanning={isScanning} onClose={() => setIsQRScannerOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterButton({ label, count, icon: Icon }: any) {
  return (
    <button className="bg-white dark:bg-[#0a0e1a]/80 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-3 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300">
      {label}
      <span className="bg-slate-100 dark:bg-white/10 text-[10px] px-1.5 py-0.5 rounded text-slate-600 dark:text-white">{count}</span>
      <Icon className="w-3 h-3 ml-1 opacity-40" />
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Active": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    "Repair": "bg-amber-500/10 text-amber-500 border-amber-500/20",
    "Under Repair": "bg-amber-500/10 text-amber-500 border-amber-500/20",
    "Maintenance": "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    "Lost": "bg-rose-500/10 text-rose-500 border-rose-500/20",
    "Damaged": "bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse",
  };
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-[11px] font-bold border", styles[status] || "bg-slate-500/10 text-slate-500 border-slate-500/20")}>
      {status}
    </span>
  );
}

function ComplianceBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Verified": "bg-emerald-500 text-white border-emerald-600",
    "Caution": "bg-rose-500 text-white border-rose-600",
    "Pending": "bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-white/20",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border flex items-center gap-1 w-fit", styles[status])}>
      {status === "Verified" && <ShieldCheck className="w-2.5 h-2.5" />}
      {status}
    </span>
  );
}

function AssetModal({ mode, asset, onClose, onSave, onDelete }: any) {
  const [formData, setFormData] = useState<Partial<Asset>>(asset || {
    code: `A${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`,
    name: "",
    category: "IT Equipment",
    location: "Main Office",
    user: "Pool Account",
    status: "Active",
    value: "$ 0",
    date: new Date().toLocaleDateString('en-GB'),
    serial: "",
    description: "",
    complianceStatus: "Pending"
  });

  const isPreview = mode === "preview";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-app-bg border border-border-dim w-full max-w-2xl rounded-none sm:rounded-3xl overflow-hidden shadow-2xl transition-colors duration-300 relative h-full sm:h-auto flex flex-col">
        {/* Absolute Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 p-2 sm:p-2.5 bg-slate-100 dark:bg-white/10 hover:bg-brand hover:text-white rounded-xl border border-border-dim transition-all shadow-lg group"
        >
          <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
        </button>

        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border-dim transition-colors duration-300 bg-slate-50/50 dark:bg-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand/10 text-brand rounded-lg">
              <Tag className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">{mode} Asset</h3>
          </div>
        </div>
        
        <div className="flex-1 p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase px-1">Asset ID</label>
              <input disabled value={formData.code} className="w-full bg-slate-100 dark:bg-white/5 p-3 rounded-xl text-sm text-slate-900 dark:text-white font-mono border border-border-dim/50" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase px-1">Asset Name</label>
              <input disabled={isPreview} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-card-bg p-3 rounded-xl text-sm text-slate-900 dark:text-white border border-border-dim focus:ring-2 focus:ring-brand/20 transition-all outline-none uppercase" placeholder="NAME OF THE ASSET" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase px-1">Category</label>
                <select disabled={isPreview} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-card-bg p-3 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white border border-border-dim outline-none uppercase font-bold">
                  <option>IT Equipment</option>
                  <option>Office Device</option>
                  <option>Vehicles</option>
                  <option>Power Systems</option>
                  <option>Manufacturing</option>
                  <option>Furniture</option>
                  <option>Network Devices</option>
                  <option>Security Systems</option>
                  <option>Mobile Devices</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase px-1">Valuation</label>
                <input disabled={isPreview} value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} className="w-full bg-card-bg p-3 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white border border-border-dim outline-none font-black" placeholder="$ 0.00" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase px-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</label>
              <input disabled={isPreview} value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-card-bg p-3 rounded-xl text-sm text-slate-900 dark:text-white border border-border-dim outline-none uppercase font-bold" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase px-1 flex items-center gap-1"><UserIcon className="w-3 h-3" /> Assigned To</label>
              <input disabled={isPreview} value={formData.user} onChange={e => setFormData({...formData, user: e.target.value})} className="w-full bg-card-bg p-3 rounded-xl text-sm text-slate-900 dark:text-white border border-border-dim outline-none uppercase font-bold" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase px-1">Serial Number</label>
              <input disabled={isPreview} value={formData.serial} onChange={e => setFormData({...formData, serial: e.target.value})} className="w-full bg-card-bg p-3 rounded-xl text-sm text-slate-900 dark:text-white border border-border-dim outline-none font-mono tracking-tighter" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase px-1">Internal Notes</label>
              <textarea disabled={isPreview} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-card-bg p-3 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white border border-border-dim min-h-[80px] sm:min-h-[90px] outline-none uppercase leading-relaxed font-medium" placeholder="ADD SPECIFIC DETAILS..." />
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 bg-slate-50/50 dark:bg-black/20 border-t border-border-dim flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
          {mode === "edit" && (
            <button 
              onClick={() => onDelete(formData.code)} 
              className="w-full sm:w-auto px-6 py-3.5 bg-rose-500/10 text-rose-500 font-bold rounded-xl border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/10 text-xs sm:text-sm uppercase tracking-widest"
            >
              DELETE ASSET
            </button>
          )}
          {!isPreview ? (
            <button 
              onClick={() => onSave(formData as Asset)} 
              className="flex-1 py-3.5 bg-brand text-white font-black rounded-xl shadow-lg shadow-brand/20 active:scale-95 transition-transform uppercase tracking-[0.2em] text-xs sm:text-sm"
            >
              COMMIT {mode.toUpperCase()}
            </button>
          ) : (
            <button 
              onClick={() => onClose()} 
              className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-xl uppercase tracking-widest text-[10px] sm:text-xs"
            >
              CLOSE PREVIEW
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function QRScannerModal({ isScanning, onClose }: any) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="text-center space-y-6">
        <div className="relative w-64 h-64 border-2 border-brand rounded-3xl overflow-hidden mx-auto">
          {isScanning && <div className="absolute inset-x-0 h-1 bg-brand shadow-[0_0_10px_#1a3ff0] animate-bounce" style={{animationDuration: '2s'}}></div>}
          <div className="absolute inset-0 bg-white/5"></div>
        </div>
        <h3 className="text-white font-bold text-xl">{isScanning ? "Scanning Asset QR..." : "Asset Match Found!"}</h3>
        <button onClick={onClose} className="px-8 py-2 bg-white/10 text-white rounded-full border border-white/20">Cancel</button>
      </div>
    </motion.div>
  );
}
