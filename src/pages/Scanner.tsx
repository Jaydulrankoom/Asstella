import { useState, useEffect, useRef } from "react";
import {
  QrCode,
  Smartphone,
  Bluetooth,
  Usb,
  Settings,
  Activity,
  ShieldCheck,
  RefreshCw,
  Search,
  X,
  Wifi,
  Battery,
  Info,
  Maximize2,
  Zap,
  CheckCircle2,
  AlertTriangle,
  History,
  Monitor,
  Plus,
} from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";

interface ScannerDevice {
  id: string;
  name: string;
  type: "Bluetooth" | "USB";
  brand: string;
  status: "Connected" | "Disconnected" | "Pairing";
  battery?: number;
  lastUsed?: string;
}

const initialHardwareDevices: ScannerDevice[] = [
  {
    id: "SCAN-001",
    name: "Zebra DS2278",
    type: "Bluetooth",
    brand: "Zebra Technologies",
    status: "Connected",
    battery: 85,
    lastUsed: "10m ago",
  },
  {
    id: "SCAN-002",
    name: "Honeywell Voyager",
    type: "USB",
    brand: "Honeywell",
    status: "Disconnected",
  },
  {
    id: "SCAN-003",
    name: "Datalogic Gryphon",
    type: "USB",
    brand: "Datalogic",
    status: "Connected",
    lastUsed: "1h ago",
  },
];

export default function ScannerPage() {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState<
    "mobile" | "hardware" | "generate"
  >("mobile");
  const [devices, setDevices] = useState<ScannerDevice[]>(
    initialHardwareDevices,
  );
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [pairingDevice, setPairingDevice] = useState<string | null>(null);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (activeMode === "mobile" && isScanning) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false,
      );

      scannerRef.current.render(
        (decodedText) => {
          setScannedResult(decodedText);
          setIsScanning(false);
          if (scannerRef.current) {
            scannerRef.current.clear();
          }
        },
        (error) => {
          // console.warn(error);
        },
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .clear()
          .catch((err) => console.error("Failed to clear scanner", err));
      }
    };
  }, [activeMode, isScanning]);

  const handlePairing = (id: string) => {
    setPairingDevice(id);
    setDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "Pairing" } : d)),
    );

    setTimeout(() => {
      setDevices((prev) =>
        prev.map((d) =>
          d.id === id
            ? { ...d, status: "Connected", battery: 100, lastUsed: "Just now" }
            : d,
        ),
      );
      setPairingDevice(null);
    }, 2000);
  };

  const disconnectDevice = (id: string) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "Disconnected" } : d)),
    );
  };

  return (
    <div
      className="space-y-8 animate-in slide-in-from-bottom-4 duration-500"
      id="scanner_integration_page"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase flex items-center gap-3">
            <QrCode className="w-7 h-7 sm:w-8 sm:h-8 text-brand" /> Scan &
            Identify
          </h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">
            Multi-modal asset tracking and device management
          </p>
        </div>
        <div className="bg-card-bg border border-border-dim rounded-2xl p-1 flex flex-wrap items-center shadow-sm w-full lg:w-auto">
          <button
            onClick={() => {
              setActiveMode("mobile");
              setIsScanning(false);
            }}
            className={cn(
              "flex-1 lg:flex-none px-4 sm:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
              activeMode === "mobile"
                ? "bg-brand text-white shadow-lg shadow-brand/20"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200",
            )}
          >
            <Smartphone className="w-3.5 h-3.5" /> Mobile Lens
          </button>
          <button
            onClick={() => {
              setActiveMode("hardware");
              setIsScanning(false);
            }}
            className={cn(
              "flex-1 lg:flex-none px-4 sm:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
              activeMode === "hardware"
                ? "bg-brand text-white shadow-lg shadow-brand/20"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200",
            )}
          >
            <Usb className="w-3.5 h-3.5" /> Hardware
          </button>
          <button
            onClick={() => {
              setActiveMode("generate");
              setIsScanning(false);
            }}
            className={cn(
              "flex-1 lg:flex-none px-4 sm:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
              activeMode === "generate"
                ? "bg-brand text-white shadow-lg shadow-brand/20"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200",
            )}
          >
            <QrCode className="w-3.5 h-3.5" /> Generate QR
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Interface Center */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {activeMode === "mobile" ? (
              <motion.div
                key="mobile_view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 flex flex-col items-center justify-center min-h-[400px] sm:min-h-[500px] border-4 sm:border-8 border-slate-800 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-brand/10 to-transparent"></div>

                {isScanning ? (
                  <div className="w-full max-w-md relative z-10">
                    <div
                      id="qr-reader"
                      className="w-full rounded-2xl overflow-hidden border-4 border-brand/50 shadow-[0_0_50px_rgba(26,63,240,0.2)]"
                    ></div>
                    <button
                      onClick={() => setIsScanning(false)}
                      className="mt-6 sm:mt-8 w-full py-3 sm:py-4 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest"
                    >
                      Stop Camera Session
                    </button>
                  </div>
                ) : scannedResult ? (
                  <div className="text-center space-y-6 sm:space-y-8 animate-in zoom-in-95 duration-300 relative z-10">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-500 text-white rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
                      <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
                    </div>
                    <div>
                      <h3 className="text-white text-2xl sm:text-3xl font-black uppercase tracking-tight">
                        Identity Verified
                      </h3>
                      <p className="text-slate-400 font-bold uppercase tracking-widest mt-2">
                        {scannedResult}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={() =>
                          navigate(`/assets?search=${scannedResult}`)
                        }
                        className="w-full sm:w-auto px-8 py-4 bg-brand text-white rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-xl shadow-brand/20 active:scale-95 transition-all"
                      >
                        Go to Asset Record
                      </button>
                      <button
                        onClick={() => {
                          setScannedResult(null);
                          setIsScanning(true);
                        }}
                        className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-white/10"
                      >
                        Scan Another
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-6 sm:space-y-8 relative z-10">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-brand/10 rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center mx-auto relative group">
                      <div className="absolute inset-0 bg-brand/20 blur-2xl rounded-full animate-pulse"></div>
                      <QrCode className="w-10 h-10 sm:w-14 sm:h-14 text-brand relative z-10" />
                    </div>
                    <div className="max-w-xs mx-auto">
                      <h3 className="text-white text-xl sm:text-2xl font-black uppercase">
                        Mobile Lens Active
                      </h3>
                      <p className="text-slate-400 text-[10px] font-bold leading-relaxed uppercase tracking-widest mt-4">
                        Use your device camera to scan asset QR codes for
                        instant verification.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsScanning(true)}
                      className="px-8 sm:px-10 py-4 sm:py-5 bg-brand text-white rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] shadow-2xl shadow-brand/40 hover:scale-105 active:scale-95 transition-all"
                    >
                      Initialize Camera
                    </button>
                  </div>
                )}
              </motion.div>
            ) : activeMode === "hardware" ? (
              <motion.div
                key="hardware_view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                <div className="bg-card-bg border border-border-dim rounded-[2.5rem] p-10 shadow-xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        Connected Peripherals
                      </h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        Found{" "}
                        {devices.filter((d) => d.status === "Connected").length}{" "}
                        active hardware controllers
                      </p>
                    </div>
                    <button className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] flex items-center gap-2 hover:opacity-90">
                      <RefreshCw className="w-4 h-4" /> Rescan Bus
                    </button>
                  </div>

                  <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {devices.map((device) => (
                      <div
                        key={device.id}
                        className="bg-app-bg border border-border-dim rounded-[2rem] p-8 hover:border-brand/40 transition-all group"
                      >
                        <div className="flex items-start justify-between mb-6">
                          <div
                            className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all",
                              device.status === "Connected"
                                ? "bg-brand text-white"
                                : "bg-slate-100 dark:bg-white/5 text-slate-400",
                            )}
                          >
                            {device.type === "Bluetooth" ? (
                              <Bluetooth className="w-6 h-6" />
                            ) : (
                              <Usb className="w-6 h-6" />
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-[0.1em]",
                                device.status === "Connected"
                                  ? "bg-emerald-500/10 text-emerald-500"
                                  : device.status === "Pairing"
                                    ? "bg-brand/10 text-brand animate-pulse"
                                    : "bg-slate-100 dark:bg-white/5 text-slate-400",
                              )}
                            >
                              {device.status}
                            </span>
                            {device.battery !== undefined && (
                              <div className="flex items-center gap-1.5">
                                <Battery
                                  className={cn(
                                    "w-3 h-3",
                                    device.battery < 20
                                      ? "text-rose-500"
                                      : "text-emerald-500",
                                  )}
                                />
                                <span className="text-[9px] font-black text-slate-500">
                                  {device.battery}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter truncate">
                          {device.name}
                        </h4>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 mb-6">
                          {device.brand}
                        </p>

                        <div className="flex items-center gap-2 mt-auto">
                          {device.status === "Connected" ? (
                            <button
                              onClick={() => disconnectDevice(device.id)}
                              className="flex-1 py-3 bg-white/5 border border-border-dim hover:bg-rose-500/10 hover:text-rose-500 transition-all rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500"
                            >
                              Release
                            </button>
                          ) : (
                            <button
                              onClick={() => handlePairing(device.id)}
                              disabled={pairingDevice !== null}
                              className="flex-1 py-3 bg-brand text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand/20 active:scale-95 transition-all disabled:opacity-50"
                            >
                              Authorize
                            </button>
                          )}
                          <button className="p-3 bg-app-bg border border-border-dim rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white">
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button className="border-2 border-dashed border-border-dim rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 hover:bg-brand/5 hover:border-brand/40 transition-all group">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-brand/20 group-hover:text-brand transition-all">
                        <Plus className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-brand transition-colors">
                        Add Third-Party Controller
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="generate_view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card-bg border border-border-dim rounded-[2.5rem] p-10 shadow-xl overflow-hidden relative flex flex-col min-h-[400px] sm:min-h-[500px]"
              >
                <div className="absolute top-0 left-0 w-48 h-48 bg-brand/5 rounded-full blur-3xl -ml-24 -mt-24"></div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight relative z-10 mb-2">
                  Generate QR Code
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10 mb-8">
                  Select an asset to generate its tracking label.
                </p>

                <div className="flex-1 flex flex-col md:flex-row gap-8 relative z-10">
                  <div className="w-full md:w-1/2 flex flex-col gap-4">
                    <input
                      type="text"
                      placeholder="SEARCH ASSET CODE..."
                      className="w-full bg-app-bg p-4 rounded-xl text-xs font-bold text-slate-900 dark:text-white border border-border-dim focus:ring-2 focus:ring-brand/20 transition-all outline-none uppercase"
                    />

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                      {["TR-9000", "LAP-A242", "DEV-0101"].map((code, idx) => (
                        <div
                          key={idx}
                          className="p-4 border border-border-dim rounded-[1.5rem] hover:bg-slate-50 dark:hover:bg-white/5 hover:border-brand/30 transition-colors cursor-pointer group flex items-center justify-between"
                        >
                          <div>
                            <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white group-hover:text-brand transition-colors">
                              {code}
                            </h4>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                              Dell Equipment / HQ
                            </p>
                          </div>
                          <button className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="w-full md:w-1/2 flex flex-col items-center justify-center border-2 border-dashed border-border-dim rounded-[2rem] bg-app-bg p-8 text-center space-y-6">
                    <div className="w-40 h-40 bg-white border-4 border-slate-200 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden">
                      <div className="absolute inset-0 bg-slate-100 animate-pulse"></div>
                      <QrCode className="w-20 h-20 text-slate-300 relative z-10" />
                    </div>
                    <h4 className="text-xl font-black uppercase text-slate-400 tracking-tight">
                      QR LABEL PREVIEW
                    </h4>
                    <button className="px-8 py-4 w-full bg-brand text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand/20 hover:scale-105 active:scale-95 transition-all opacity-50 cursor-not-allowed">
                      Print Label
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Diagnostic Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card-bg border border-border-dim rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center justify-between">
              Scanner Engine Status{" "}
              <Activity className="w-4 h-4 text-emerald-500" />
            </h3>
            <div className="space-y-6">
              <DiagnosticItem
                label="Decryption Core"
                status="Operational"
                value="v4.2.1"
                icon={ShieldCheck}
              />
              <DiagnosticItem
                label="Network Relay"
                status="Connected"
                value="12ms Latency"
                icon={Wifi}
              />
              <DiagnosticItem
                label="Battery (Phone)"
                status="Healthy"
                value="94%"
                icon={Battery}
              />
              <DiagnosticItem
                label="Lens Calibration"
                status="Precision"
                value="Auto-focus"
                icon={Maximize2}
              />
            </div>
            <button
              onClick={() => navigate("/integrations")}
              className="w-full mt-6 py-3 border border-border-dim rounded-xl text-[9px] font-black uppercase text-slate-400 hover:text-brand hover:border-brand/40 transition-all"
            >
              Configure Ecosystem Drivers
            </button>
          </div>

          <div className="bg-slate-900 rounded-[1.5rem] sm:rounded-[2.5rem] p-8 sm:p-10 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-brand/30 transition-all"></div>
            <Monitor className="w-8 h-8 sm:w-10 sm:h-10 text-brand mb-6" />
            <h4 className="text-lg sm:text-xl font-black uppercase tracking-tight mb-2 leading-none">
              External Feed
            </h4>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6">
              Real-time identification log
            </p>

            <div className="space-y-4 max-h-[220px] overflow-y-auto custom-scrollbar pr-2">
              <LogEntry
                time="2m ago"
                code="IT-SRV-992"
                user="System"
                status="VERIFIED"
              />
              <LogEntry
                time="14m ago"
                code="W-HK-102"
                user="Admin"
                status="AUDITED"
              />
              <LogEntry
                time="1h ago"
                code="VEH-2291"
                user="Joshua"
                status="LOCATED"
              />
              <LogEntry
                time="2h ago"
                code="LAB-PC-44"
                user="Sarah"
                status="VERIFIED"
              />
            </div>
          </div>

          <div className="bg-brand text-white rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-2xl shadow-brand/30">
            <div className="flex items-center gap-4 mb-4">
              <Zap className="w-5 sm:w-6 h-5 sm:h-6" />
              <h4 className="text-base sm:text-lg font-black uppercase">
                Rapid Audit
              </h4>
            </div>
            <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest leading-relaxed mb-6">
              Enable rapid audit mode to skip confirmation dialogs and bulk scan
              assets at 3x speed.
            </p>
            <button className="w-full py-4 bg-white text-brand font-black rounded-xl text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
              Enable High-Performance Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DiagnosticItem({ label, status, value, icon: Icon }: any) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-app-bg border border-border-dim rounded-xl flex items-center justify-center text-slate-400 group-hover:text-brand transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">
            {label}
          </div>
          <div className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">
            {status}
          </div>
        </div>
      </div>
      <span className="text-[9px] font-bold text-slate-500 uppercase">
        {value}
      </span>
    </div>
  );
}

function LogEntry({ time, code, user, status }: any) {
  return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group">
      <div>
        <div className="text-[11px] font-black text-slate-200 uppercase tracking-tight">
          {code}
        </div>
        <div className="text-[8px] font-bold text-slate-500 uppercase mt-0.5">
          {user} • {time}
        </div>
      </div>
      <span
        className={cn(
          "px-2 py-0.5 rounded-[4px] text-[8px] font-black tracking-widest",
          status === "VERIFIED"
            ? "bg-brand/20 text-brand"
            : "bg-emerald-500/20 text-emerald-500",
        )}
      >
        {status}
      </span>
    </div>
  );
}
