import { useState, useEffect } from "react";
import { MapPin, Map as MapIcon, Search, Truck, Navigation, Activity, MoreVertical, Layers, X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

interface Vehicle {
  id: string;
  name: string;
  status: "Moving" | "Idle" | "Stopped";
  speed: string;
  location: string;
  battery: string;
  driver: string;
  lastSeen: string;
  fuel: string;
  lat: number;
  lng: number;
}

const initialVehicles: Vehicle[] = [
  { id: "V-201", name: "Delivery Van #1", status: "Moving", speed: "42 km/h", location: "Dhanmondi, Dhaka", battery: "92%", driver: "Kamal Hossain", lastSeen: "Now", fuel: "75%", lat: 25, lng: 35 },
  { id: "V-205", name: "Company SUV #5", status: "Idle", speed: "0 km/h", location: "Gulshan-2, Dhaka", battery: "85%", driver: "Sohail Ahmed", lastSeen: "2m ago", fuel: "45%", lat: 35, lng: 55 },
  { id: "V-239", name: "Transport Truck #9", status: "Stopped", speed: "0 km/h", location: "Gazipur Industrial Zone", battery: "12%", driver: "Robin Mia", lastSeen: "15m ago", fuel: "10%", lat: 45, lng: 45 },
  { id: "V-312", name: "Executive Sedan", status: "Moving", speed: "65 km/h", location: "Banani, Dhaka", battery: "78%", driver: "Abdur Rahim", lastSeen: "Now", fuel: "88%", lat: 30, lng: 40 },
  { id: "V-404", name: "Logistics Heavy", status: "Idle", speed: "0 km/h", location: "Chittagong Port", battery: "60%", driver: "Milon Bepari", lastSeen: "5m ago", fuel: "60%", lat: 60, lng: 70 },
  { id: "V-550", name: "Field Ops Jeep", status: "Moving", speed: "22 km/h", location: "Sylhet Highway", battery: "45%", driver: "Sujan Roy", lastSeen: "1m ago", fuel: "35%", lat: 15, lng: 25 },
];

export default function GPSPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showMap, setShowMap] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredVehicles = initialVehicles.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.driver.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (searchParams.get("action") === "map") {
      setShowMap(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="h-full flex flex-col space-y-6 animate-in slide-in-from-bottom-4 duration-500 overflow-hidden" id="gps_page">
      <div className="flex flex-col md:flex-row md:items-center justify-between shrink-0 gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Vehicles (GPS)</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Real-time asset tracking & fleet telematics</p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <button 
             className={cn(
               "flex-1 md:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
               !showMap ? "bg-brand text-white border-brand shadow-lg shadow-brand/20" : "bg-app-bg border-border-dim text-slate-500 hover:text-slate-900 dark:hover:text-white"
             )}
             onClick={() => setShowMap(false)}
          >
            <Activity className="w-4 h-4" /> FLEET LIST
          </button>
          <button 
             className={cn(
               "flex-1 md:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
               showMap ? "bg-brand text-white border-brand shadow-lg shadow-brand/20" : "bg-app-bg border-border-dim text-slate-500 hover:text-slate-900 dark:hover:text-white"
             )}
             onClick={() => setShowMap(true)}
          >
            <MapIcon className="w-4 h-4" /> LIVE MAP
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden min-h-0">
        {/* Sidebar: Vehicles List */}
        <div className={cn(
          "w-full md:w-80 bg-card-bg border border-border-dim rounded-[1.5rem] sm:rounded-[2rem] flex flex-col shadow-xl transition-all duration-500 shrink-0 overflow-hidden",
          showMap && "hidden md:flex"
        )}>
          <div className="p-4 sm:p-5 border-b border-border-dim shrink-0 bg-slate-50/50 dark:bg-white/5">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search vehicle or driver..." 
                  className="w-full bg-app-bg border border-border-dim rounded-xl pl-9 pr-4 py-3 text-xs outline-none focus:ring-1 focus:ring-brand/40 transition-all font-medium" 
                />
             </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-border-dim">
            {filteredVehicles.map(v => (
              <div 
                key={v.id} 
                className={cn(
                  "p-4 hover:bg-slate-50 dark:hover:bg-brand/5 transition-all cursor-pointer group",
                  selectedVehicle?.id === v.id && "bg-brand/5 border-l-4 border-l-brand"
                )}
                onClick={() => {
                  setSelectedVehicle(v);
                  if (!showMap) setShowMap(true);
                }}
              >
                <div className="flex items-start justify-between">
                   <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center border-4 border-app-bg shadow-xl flex-shrink-0",
                        v.status === "Moving" ? "bg-emerald-500 text-white" :
                        v.status === "Idle" ? "bg-orange-500 text-white" :
                        "bg-slate-500 text-white"
                      )}>
                        <Truck className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-black text-brand uppercase tracking-tighter font-mono truncate">{v.id}</div>
                        <div className="text-sm font-black text-slate-900 dark:text-white group-hover:text-brand transition-colors truncate">{v.name}</div>
                      </div>
                   </div>
                   <div className={cn(
                     "w-2 h-2 rounded-full flex-shrink-0",
                     v.status === "Moving" ? "bg-emerald-500 animate-pulse" :
                     v.status === "Idle" ? "bg-orange-500" : "bg-slate-400"
                   )}></div>
                </div>
                <div className="mt-4 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                   <div className="flex items-center gap-1.5"><Navigation className="w-3.5 h-3.5 text-brand" /> {v.speed}</div>
                   <div className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> {v.lastSeen}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Content: Map or Fleet Analytics */}
        <div className={cn(
          "flex-1 min-w-0 bg-card-bg border border-border-dim rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden relative shadow-xl min-h-[400px]",
          !showMap && "hidden md:block"
        )}>
           <AnimatePresence mode="wait">
             {showMap ? (
               <motion.div 
                 key="map_view"
                 initial={{ opacity: 0, scale: 0.98 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 1.02 }}
                 className="absolute inset-0"
               >
                  {/* Mock Map Background */}
                  <div className="absolute inset-0 grayscale opacity-40">
                    <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1200" alt="Map View" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute inset-0 bg-brand/5 dark:bg-brand/10"></div>
                  
                  {/* Map Controls */}
                  <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex flex-col gap-2 z-10">
                     <button className="bg-white dark:bg-slate-900 p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-xl border border-border-dim text-slate-600 dark:text-white hover:text-brand transition-colors"><Layers className="w-5 h-5" /></button>
                     <button className="bg-white dark:bg-slate-900 p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-xl border border-border-dim font-black text-slate-600 dark:text-white hover:text-brand transition-colors text-xs sm:text-base">+</button>
                     <button className="bg-white dark:bg-slate-900 p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-xl border border-border-dim font-black text-slate-600 dark:text-white hover:text-brand transition-colors text-xs sm:text-base">-</button>
                  </div>

                  {/* Markers */}
                  {filteredVehicles.map((v, i) => (
                    <motion.div 
                      key={v.id}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="absolute z-10"
                      style={{ top: `${v.lat}%`, left: `${v.lng}%` }}
                    >
                      <div 
                        className="relative group cursor-pointer"
                        onClick={() => setSelectedVehicle(v)}
                      >
                        <MapPin className={cn(
                          "w-8 h-8 sm:w-10 sm:h-10 drop-shadow-2xl transition-transform hover:scale-110",
                          v.status === "Moving" ? "text-emerald-500 fill-emerald-500/20" : 
                          v.status === "Idle" ? "text-orange-500 fill-orange-500/20" :
                          "text-slate-500 fill-slate-500/20",
                          selectedVehicle?.id === v.id && "scale-125 z-20"
                        )} />
                        {selectedVehicle?.id === v.id && (
                          <div className="absolute top-0 left-0 w-8 h-8 sm:w-10 sm:h-10 bg-brand/20 rounded-full animate-ping"></div>
                        )}
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-slate-900 dark:bg-brand text-white text-[8px] sm:text-[10px] font-black px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-2xl border border-white/10 uppercase tracking-widest">
                          {v.name} • {v.speed}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Telematics Hud */}
                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-10 sm:left-10 sm:right-10 flex gap-4 pointer-events-none">
                     <AnimatePresence>
                        {selectedVehicle && (
                          <motion.div 
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="flex-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[1.5rem] sm:rounded-[2.5rem] border border-border-dim shadow-2xl p-4 sm:p-8 pointer-events-auto flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                          >
                             <div className="flex items-center gap-4 sm:gap-6">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-brand text-white rounded-[1rem] sm:rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-brand/20 border-4 border-app-bg shrink-0">
                                   <Truck className="w-6 h-6 sm:w-8 sm:h-8" />
                                </div>
                                <div className="space-y-1 min-w-0">
                                   <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                      <h3 className="text-lg sm:text-2xl font-black tracking-tight truncate">{selectedVehicle.name}</h3>
                                      <span className={cn(
                                        "px-2 py-0.5 rounded text-[8px] sm:text-[10px] font-black uppercase tracking-widest",
                                        selectedVehicle.status === "Moving" ? "bg-emerald-500 text-white" : "bg-slate-500 text-white"
                                      )}>{selectedVehicle.status}</span>
                                   </div>
                                   <p className="text-[9px] sm:text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em] truncate">
                                     V.ID: <span className="font-mono text-brand">{selectedVehicle.id}</span> • Driver: {selectedVehicle.driver}
                                   </p>
                                </div>
                             </div>

                             <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-12">
                                <div className="w-full sm:w-auto space-y-2">
                                   <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest block sm:text-center">Fuel Level</label>
                                   <div className="flex items-center gap-3">
                                      <div className="flex-1 sm:w-32 h-2.5 sm:h-3 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden border border-border-dim">
                                         <motion.div 
                                           initial={{ width: 0 }}
                                           animate={{ width: selectedVehicle.fuel }}
                                           className={cn(
                                             "h-full rounded-full transition-all duration-1000",
                                             parseInt(selectedVehicle.fuel) < 20 ? "bg-rose-500" : "bg-brand"
                                           )}
                                         />
                                      </div>
                                      <span className="text-[10px] sm:text-xs font-black">{selectedVehicle.fuel}</span>
                                   </div>
                                </div>

                                <div className="flex gap-6 sm:gap-8 justify-between w-full sm:w-auto">
                                   <div>
                                      <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Speed</label>
                                      <div className="text-base sm:text-xl font-black text-slate-900 dark:text-white font-mono">{selectedVehicle.status === "Stopped" ? "00" : selectedVehicle.speed}</div>
                                   </div>
                                   <div>
                                      <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Location</label>
                                      <div className="text-[9px] sm:text-xs font-bold text-slate-500 max-w-[120px] sm:max-w-[150px] truncate">{selectedVehicle.location}</div>
                                   </div>
                                </div>

                                <button 
                                  onClick={() => setSelectedVehicle(null)}
                                  className="absolute top-2 right-2 sm:static p-2 sm:p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl sm:rounded-2xl shadow-xl active:scale-95 transition-all"
                                >
                                   <X className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                             </div>
                          </motion.div>
                        )}
                     </AnimatePresence>
                  </div>
               </motion.div>
             ) : (
               <motion.div 
                 key="list_view"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8 h-full"
               >
                 <div className="w-24 h-24 sm:w-32 sm:h-32 bg-brand/10 text-brand rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-brand/20">
                    <Truck className="w-12 h-12 sm:w-16 sm:h-16" />
                  </div>
                  <div className="space-y-3">
                     <h3 className="text-xl sm:text-3xl font-black tracking-tight uppercase">Fleet Telematics Analytics</h3>
                     <p className="text-slate-500 max-w-sm mx-auto text-xs sm:text-sm font-medium leading-relaxed px-4">Select a vehicle from the sidebar or click beneath to view high-precision positioning data.</p>
                  </div>
                  <button className="px-8 sm:px-10 py-3 sm:py-4 bg-brand text-white font-black rounded-xl sm:rounded-2xl shadow-2xl shadow-brand/30 uppercase tracking-widest active:scale-95 transition-all text-[10px] sm:text-xs" onClick={() => setShowMap(true)}>Switch to Live Map</button>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
