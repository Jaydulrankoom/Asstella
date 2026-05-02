import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ThemeProvider, useTheme } from "@/src/context/ThemeContext";
import { 
  LayoutDashboard, 
  Package, 
  Wrench, 
  ClipboardCheck, 
  Coins, 
  Settings, 
  Bell,
  Search,
  User,
  CheckCircle,
  MapPin,
  ShieldCheck,
  ShoppingCart,
  Users,
  BarChart3,
  Share2,
  BellDot,
  UserCog,
  Zap,
  ChevronRight,
  ChevronDown,
  Plus,
  FileText,
  Calculator,
  Map,
  Maximize,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  ScanLine,
  X,
  Clock,
  AlertTriangle,
  Info
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";

import { useUser } from "@/src/context/UserContext";

interface NavItem {
  label: string;
  href: string;
  icon: any;
  roles?: string[]; // Allowed roles for this item
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/app", icon: LayoutDashboard },
  { label: "Assets", href: "/app/assets", icon: Package },
  { label: "Maintenance", href: "/app/maintenance", icon: Wrench },
  { label: "Warranty", href: "/app/warranty", icon: CheckCircle },
  { label: "AMC Contracts", href: "/app/amc", icon: ClipboardCheck },
  { label: "Finance & Depreciation", href: "/app/finance", icon: Coins, roles: ["Super Admin", "Company Admin", "Finance Viewer"] },
  { label: "Vehicles (GPS)", href: "/app/gps", icon: MapPin },
  { label: "Audit & Compliance", href: "/app/audit", icon: ShieldCheck, roles: ["Super Admin", "Company Admin", "Asset Manager"] },
  { label: "Procurement", href: "/app/procurement", icon: ShoppingCart },
  { label: "Vendors", href: "/app/vendors", icon: Users, roles: ["Super Admin", "Company Admin", "Procurement Officer"] },
  { label: "Reports & Analytics", href: "/app/reports", icon: BarChart3, roles: ["Super Admin", "Company Admin", "Finance Viewer"] },
  { label: "Scanner & Peripherals", href: "/app/scanner", icon: ScanLine },
  { label: "Integrations (API Hub)", href: "/app/integrations", icon: Share2, roles: ["Super Admin", "Company Admin"] },
  { label: "Alerts & Notifications", href: "/app/notifications", icon: BellDot },
  { label: "Settings", href: "/app/settings", icon: Settings, roles: ["Super Admin", "Company Admin"] },
  { label: "User Management", href: "/app/users", icon: UserCog, roles: ["Super Admin", "Company Admin"] },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { currentUser } = useUser();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [isScannerOpen, setIsScannerOpen] = React.useState(false);

  const filteredNavItems = navItems.filter(item => {
    if (!currentUser) return false;
    if (!item.roles) return true;
    return item.roles.includes(currentUser.role);
  });

  const notifications = [
    { id: 1, title: "Urgent Maintenance", description: "Generator A-12 requires immediate oil change.", type: "urgent", time: "2m ago" },
    { id: 2, title: "AMC Expiring", description: "Dell Support contract expires in 14 days.", type: "warning", time: "1h ago" },
    { id: 3, title: "Asset Audited", description: "Workstation 405 was successfully verified.", type: "info", time: "3h ago" },
    { id: 4, title: "New Asset Shared", description: "HR shared 10 new Laptops with your department.", type: "info", time: "5h ago" },
  ];

  const SidebarContent = ({ collapsed = false, onNavItemClick = () => {} }) => (
    <>
      <div className={cn("px-6 mb-8 flex items-center justify-between", collapsed && "px-0 justify-center")}>
        {!collapsed && (
          <h1 className="text-app-text text-xl font-bold tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center shadow-lg shadow-brand/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            Asstella
          </h1>
        )}
        {collapsed && (
          <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shadow-lg shadow-brand/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onNavItemClick}
              className={cn(
                "flex items-center px-4 py-2.5 rounded-lg font-medium text-sm transition-all group relative",
                isActive 
                  ? "bg-brand text-white shadow-lg shadow-brand/20" 
                  : "text-slate-400 hover:text-app-text hover:bg-slate-100 dark:hover:bg-white/5",
                collapsed && "justify-center px-2"
              )}
              id={`sidebar_link_${item.label.toLowerCase().replace(/\s+/g, '_')}`}
              title={collapsed ? item.label : ""}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-brand")} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </div>
              {!isActive && !collapsed && (
                <ChevronRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
              )}
            </Link>
          );
        })}

        <div className={cn("pt-6 pb-2 border-t border-border-dim mt-4", collapsed ? "px-0" : "px-4")}>
          {!collapsed && (
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              Quick Actions
            </div>
          )}
          <div className="space-y-1">
            <QuickAction id="qa_add_asset" label="Add New Asset" icon={Plus} href="/app/assets?action=add" isCollapsed={collapsed} roles={["Super Admin", "Company Admin", "Asset Manager"]} />
            <QuickAction id="qa_maintenance" label="Create Maintenance Ticket" icon={Wrench} href="/app/maintenance?action=create" isCollapsed={collapsed} />
            <QuickAction id="qa_audit" label="Start New Audit" icon={ClipboardCheck} href="/app/audit?action=start" isCollapsed={collapsed} roles={["Super Admin", "Company Admin", "Asset Manager"]} />
            <QuickAction id="qa_amc" label="Create AMC Contract" icon={FileText} href="/app/amc?action=create" isCollapsed={collapsed} roles={["Super Admin", "Company Admin"]} />
            <QuickAction id="qa_depreciation" label="Run Depreciation" icon={Calculator} href="/app/finance?action=depreciate" isCollapsed={collapsed} roles={["Super Admin", "Company Admin"]} />
            <QuickAction id="qa_gps_map" label="View GPS Live Map" icon={Map} href="/app/gps?action=map" isCollapsed={collapsed} />
            <QuickAction id="qa_procure" label="Create Requisition" icon={ShoppingCart} href="/app/procurement" isCollapsed={collapsed} />
            <QuickAction id="qa_vendor" label="Onboard Vendor" icon={Users} href="/app/vendors" isCollapsed={collapsed} roles={["Super Admin", "Company Admin", "Procurement Officer"]} />
          </div>
        </div>
      </nav>

      <Link to="/app/profile" onClick={onNavItemClick} className="p-4 mt-auto border-t border-border-dim bg-slate-50 dark:bg-black/20 transition-colors duration-300 hover:bg-slate-100 dark:hover:bg-white/5 group">
        <div className={cn("flex items-center gap-3", !collapsed && "px-2", collapsed && "justify-center")}>
          <div className="relative shrink-0">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
              alt="Admin" 
              className="w-10 h-10 rounded-full border border-border-dim"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-app-bg rounded-full"></div>
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold truncate group-hover:text-brand transition-colors">{currentUser?.name || "User"}</span>
              <span className="text-[10px] text-slate-400 uppercase font-black">{currentUser?.role || "Employee"}</span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-4 pt-0">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full p-2 flex items-center justify-center gap-2 rounded-lg bg-white dark:bg-white/5 border border-border-dim text-slate-400 hover:text-brand transition-all active:scale-95 text-xs font-bold uppercase tracking-widest hidden md:flex"
        >
          {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <><PanelLeftClose className="w-4 h-4" /> Collapse</>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-app-bg text-app-text overflow-hidden transition-colors duration-300" id="app_root">
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "bg-sidebar-bg border-r border-border-dim hidden md:flex flex-col pt-6 overflow-hidden transition-all duration-300 ease-in-out relative z-30",
          isCollapsed ? "w-20" : "w-72"
        )} 
        id="sidebar"
      >
        <SidebarContent collapsed={isCollapsed} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] md:hidden"
            />
            <motion.aside 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-sidebar-bg border-r border-border-dim z-[101] flex flex-col pt-6 md:hidden"
            >
              <SidebarContent onNavItemClick={() => setIsMobileMenuOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-app-bg transition-colors duration-300">
        {/* Header */}
        <header className="h-16 bg-app-bg border-b border-border-dim flex items-center justify-between px-4 md:px-8 z-10 transition-colors duration-300" id="header">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 md:hidden"
            >
              <PanelLeftOpen className="w-6 h-6 text-slate-500" />
            </button>
            <div className="flex flex-col">
              <h2 className="text-sm md:text-lg font-bold truncate max-w-[120px] md:max-w-none" id="page_title">
                {navItems.find(i => i.href === location.pathname)?.label || "Module"}
              </h2>
              <span className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden sm:inline">Enterprise Edition v2.4</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:gap-6">
            <div className="flex items-center gap-1 md:gap-3 text-slate-400 relative">
              <button 
                onClick={() => navigate("/app/scanner")}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all active:scale-95 border border-border-dim shadow-sm text-brand"
                aria-label="Scan QR Code"
                title="Scan Asset QR"
              >
                <ScanLine className="w-4 h-4 md:w-5 h-5" />
              </button>

              <button 
                onClick={toggleTheme} 
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all active:scale-95 border border-border-dim shadow-sm hidden sm:flex"
                aria-label="Toggle theme"
              >
                {theme === "light" ? <Moon className="w-5 h-5 text-slate-600" /> : <Sun className="w-5 h-5 text-brand" />}
              </button>

              <div className="relative">
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={cn(
                    "p-2 rounded-xl transition-all active:scale-95 border border-border-dim shadow-sm relative group font-bold px-2.5 md:px-2",
                    isNotificationsOpen ? "bg-brand text-white" : "hover:bg-slate-100 dark:hover:bg-white/5"
                  )}
                  id="notif_trigger"
                >
                  <Bell className="w-4 h-4 md:w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 md:w-4 md:h-4 bg-rose-500 text-[8px] md:text-[10px] text-white flex items-center justify-center rounded-full border-2 border-app-bg font-black">4</span>
                </button>

                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-[calc(100vw-2rem)] sm:w-80 bg-app-bg border border-border-dim rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-border-dim flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Notifications</h4>
                      </div>
                      <div className="max-h-96 overflow-y-auto custom-scrollbar divide-y divide-border-dim">
                        {notifications.map((notif) => (
                          <div key={notif.id} className="p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group whitespace-normal">
                            <div className="flex gap-3">
                              <div className={cn(
                                "p-2 rounded-lg h-fit",
                                notif.type === "urgent" ? "bg-rose-500/10 text-rose-500" :
                                notif.type === "warning" ? "bg-amber-500/10 text-amber-500" :
                                "bg-brand/10 text-brand"
                              )}>
                                {notif.type === "urgent" ? <AlertTriangle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-brand transition-colors">{notif.title}</p>
                                <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 mb-2 leading-relaxed">{notif.description}</p>
                                <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                  <Clock className="w-3 h-3" /> {notif.time}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-black/20 border-t border-border-dim text-center">
                        <Link 
                          to="/app/notifications" 
                          onClick={() => setIsNotificationsOpen(false)}
                          className="text-[10px] font-black text-brand uppercase tracking-widest hover:underline"
                        >
                          View All Alerts
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            <div className="h-8 w-px bg-border-dim hidden sm:block"></div>

            <Link to="/app/profile" className="flex items-center gap-3 cursor-pointer group">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sabbir" alt="User" className="w-8 h-8 rounded-full border border-border-dim" />
              <div className="hidden xl:flex flex-col">
                <span className="text-sm font-bold group-hover:text-brand transition-colors">{currentUser?.name || "User"}</span>
                <span className="text-[9px] text-slate-400 uppercase tracking-tighter">{currentUser?.role || "Employee"}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-brand transition-colors hidden sm:block" />
            </Link>
          </div>
        </header>

        {/* Viewport */}
        <main className="flex-1 overflow-y-auto p-2 md:p-3 custom-scrollbar bg-app-bg transition-colors duration-300" id="main_viewport">
          {children}
        </main>
      </div>

      <AnimatePresence>
        {isScannerOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 text-white"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-3xl sm:rounded-[3rem] overflow-hidden shadow-2xl text-center relative"
            >
              <button 
                onClick={() => setIsScannerOpen(false)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <div className="p-6 sm:p-12 space-y-6 sm:space-y-8">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-brand/20 text-brand rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-6 border border-brand/30 shadow-2xl shadow-brand/20">
                    <ScanLine className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight uppercase">Quick Scanner</h3>
                  <p className="text-slate-400 text-xs sm:text-sm font-medium mt-2">Position the asset QR code within the frame to scan</p>
                </div>

                <div className="relative aspect-square max-w-[200px] sm:max-w-[280px] mx-auto group">
                   <div className="absolute inset-0 border-2 border-brand/30 rounded-2xl group-hover:border-brand/50 transition-all duration-700"></div>
                   <div className="absolute top-0 left-0 w-8 h-8 sm:w-12 sm:h-12 border-t-4 border-l-4 border-brand rounded-tl-2xl sm:rounded-tl-3xl"></div>
                   <div className="absolute top-0 right-0 w-8 h-8 sm:w-12 sm:h-12 border-t-4 border-r-4 border-brand rounded-tr-2xl sm:rounded-tr-3xl"></div>
                   <div className="absolute bottom-0 left-0 w-8 h-8 sm:w-12 sm:h-12 border-b-4 border-l-4 border-brand rounded-bl-2xl sm:rounded-bl-3xl"></div>
                   <div className="absolute bottom-0 right-0 w-8 h-8 sm:w-12 sm:h-12 border-b-4 border-r-4 border-brand rounded-br-2xl sm:rounded-br-3xl"></div>

                   <div className="absolute inset-3 sm:inset-4 overflow-hidden rounded-xl sm:rounded-2xl bg-black flex items-center justify-center text-center">
                      <div className="w-full h-1 bg-brand absolute top-0 animate-scan"></div>
                      <div className="text-white/20 select-none flex flex-col items-center gap-2">
                         <MapPin className="w-8 h-8 sm:w-12 sm:h-12 animate-pulse" />
                         <span className="text-[8px] sm:text-[10px] font-black tracking-[0.2em] uppercase">Initialising...</span>
                      </div>
                   </div>
                </div>

                <div className="flex flex-col gap-3 sm:gap-4">
                   <div className="p-3 sm:p-4 bg-white/5 border border-white/5 rounded-xl sm:rounded-2xl">
                      <p className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Last Scan Result</p>
                      <p className="text-[10px] sm:text-xs text-white/40 italic">Waiting for input...</p>
                   </div>
                   <button 
                    onClick={() => setIsScannerOpen(false)}
                    className="w-full py-3 sm:py-4 bg-white text-slate-900 font-black rounded-xl sm:rounded-2xl uppercase tracking-widest shadow-xl active:scale-95 transition-all text-xs sm:text-sm"
                   >
                      Cancel Scan
                   </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function QuickAction({ id, label, icon: Icon, href, isCollapsed, roles }: any) {
  const { currentUser } = useUser();
  
  if (roles && currentUser && !roles.includes(currentUser.role)) {
    return null;
  }

  return (
    <Link 
      id={id}
      to={href || "#"}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all text-xs font-medium border border-transparent hover:border-white/10",
        isCollapsed && "justify-center px-0"
      )}
      title={isCollapsed ? label : ""}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {!isCollapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

