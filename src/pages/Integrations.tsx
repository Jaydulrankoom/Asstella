import { useState } from "react";
import {
  Link as LinkIcon,
  Plus,
  Search,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Zap,
  RefreshCw,
  Key,
  Webhook,
  Database,
  Cloud,
  Puzzle,
  CheckCircle2,
  X,
  Eye,
  EyeOff,
  Copy,
  Clock,
  MoreVertical,
  Activity,
  ScanLine,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: "ERP" | "Cloud" | "Communication" | "Finance";
  icon: any;
  status: "Connected" | "Configure" | "Available";
  lastSync?: string;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  status: "Active" | "Revoked";
  hidden: boolean;
}

interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  status: "Active" | "Failing" | "Disabled";
  created: string;
}

interface ActivityLog {
  id: string;
  type: "API" | "Webhook" | "Sync";
  event: string;
  status: "Success" | "Error" | "Warning";
  timestamp: string;
  details: string;
}

const initialIntegrations: Integration[] = [
  {
    id: "INT-01",
    name: "SAP Enterprise S/4HANA",
    description: "Bi-directional master data sync and lifecycle tracking.",
    category: "ERP",
    icon: Database,
    status: "Connected",
    lastSync: "2h ago",
  },
  {
    id: "INT-02",
    name: "AWS Cloud Control",
    description: "Auto-discovery of ec2 and s3 cloud assets.",
    category: "Cloud",
    icon: Cloud,
    status: "Connected",
    lastSync: "5m ago",
  },
  {
    id: "INT-03",
    name: "Oracle NetSuite",
    description: "Financial depreciation and procurement mapping.",
    category: "ERP",
    icon: Database,
    status: "Configure",
  },
  {
    id: "INT-04",
    name: "Slack Notifications",
    description: "Real-time alerts for procurement approvals & maintenance.",
    category: "Communication",
    icon: Zap,
    status: "Connected",
    lastSync: "Now",
  },
  {
    id: "INT-05",
    name: "Microsoft Teams",
    description: "Incident reporting and collaboration hub.",
    category: "Communication",
    icon: Puzzle,
    status: "Available",
  },
  {
    id: "INT-06",
    name: "Stripe Billing",
    description: "Automated payment processing for vendor invoices.",
    category: "Finance",
    icon: Database,
    status: "Available",
  },
  {
    id: "INT-07",
    name: "Zebra Hardware SDK",
    description:
      "Native driver support for high-bandwidth industrial scanners.",
    category: "Cloud",
    icon: ScanLine,
    status: "Connected",
    lastSync: "1d ago",
  },
];

const initialApiKeys: ApiKey[] = [
  {
    id: "KEY-001",
    name: "Production Gateway",
    key: "ak_live_51P9v8R2K...",
    created: "12 Jan 2024",
    lastUsed: "10m ago",
    status: "Active",
    hidden: true,
  },
  {
    id: "KEY-002",
    name: "Staging Test Env",
    key: "ak_test_44Xn2M9L...",
    created: "05 Mar 2024",
    lastUsed: "2d ago",
    status: "Active",
    hidden: true,
  },
];

const initialWebhooks: WebhookEndpoint[] = [
  {
    id: "WH-001",
    url: "https://api.internal.com/hooks/assets",
    events: ["asset.created", "asset.updated"],
    status: "Active",
    created: "10 Feb 2024",
  },
  {
    id: "WH-002",
    url: "https://hooks.slack.com/services/...",
    events: ["maintenance.urgent"],
    status: "Failing",
    created: "20 Mar 2024",
  },
];

const initialLogs: ActivityLog[] = [
  {
    id: "LOG-01",
    type: "API",
    event: "GET /v1/assets",
    status: "Success",
    timestamp: "2m ago",
    details: "Retrieved 156 assets for Branch-4",
  },
  {
    id: "LOG-02",
    type: "Sync",
    event: "SAP S/4HANA Sync",
    status: "Warning",
    timestamp: "15m ago",
    details: "Manual override detected in 3 records",
  },
  {
    id: "LOG-03",
    type: "Webhook",
    event: "POST https://api.internal.com/hooks...",
    status: "Error",
    timestamp: "1h ago",
    details: "Timeout after 5000ms",
  },
  {
    id: "LOG-04",
    type: "API",
    event: "POST /v1/maintenance",
    status: "Success",
    timestamp: "2h ago",
    details: "Ticket #MNT-9981 Created",
  },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] =
    useState<Integration[]>(initialIntegrations);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialApiKeys);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>(initialWebhooks);
  const [logs] = useState<ActivityLog[]>(initialLogs);
  const [activeTab, setActiveTab] = useState<
    "services" | "api-keys" | "webhooks" | "logs"
  >("services");
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);

  const toggleKeyVisibility = (id: string) => {
    setApiKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, hidden: !k.hidden } : k)),
    );
  };

  const revokeKey = (id: string) => {
    if (
      window.confirm(
        "Are you sure? This will immediately break any application using this key.",
      )
    ) {
      setApiKeys((prev) =>
        prev.map((k) => (k.id === id ? { ...k, status: "Revoked" } : k)),
      );
    }
  };

  const createKey = (name: string) => {
    const newKey: ApiKey = {
      id: `KEY-00${apiKeys.length + 1}`,
      name,
      key: `ak_live_${Math.random().toString(36).substring(2, 10).toUpperCase()}...`,
      created: "Today",
      lastUsed: "Never",
      status: "Active",
      hidden: true,
    };
    setApiKeys((prev) => [newKey, ...prev]);
    setIsKeyModalOpen(false);
  };

  const createWebhook = (url: string) => {
    const newWh: WebhookEndpoint = {
      id: `WH-00${webhooks.length + 1}`,
      url,
      events: ["asset.all"],
      status: "Active",
      created: "Today",
    };
    setWebhooks((prev) => [newWh, ...prev]);
    setIsWebhookModalOpen(false);
  };

  return (
    <div
      className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-10"
      id="integrations_page"
    >
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase flex items-center gap-3">
            <LinkIcon className="w-8 h-8 text-brand" /> Ecosystem & API
          </h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">
            Connectivity hub and secure external service orchestration
          </p>
        </div>
        <div className="bg-card-bg border border-border-dim rounded-2xl p-1 flex items-center shadow-sm overflow-x-auto no-scrollbar whitespace-nowrap w-full xl:w-auto">
          {[
            { id: "services", label: "Connected Services", icon: Puzzle },
            { id: "api-keys", label: "API Credentials", icon: Key },
            { id: "webhooks", label: "Webhooks", icon: Webhook },
            { id: "logs", label: "Activity Logs", icon: Clock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 xl:flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                activeTab === tab.id
                  ? "bg-brand text-white shadow-lg shadow-brand/20"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200",
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />{" "}
              <span className="">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "services" && (
          <motion.div
            key="services"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card-bg border border-border-dim p-8 rounded-[2rem] shadow-xl relative overflow-hidden group">
                <Activity className="absolute bottom-[-20px] right-[-20px] w-32 h-32 text-brand/5 group-hover:text-brand/10 transition-all rotate-12" />
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Live Sync Operations
                </h4>
                <div className="text-4xl font-black text-slate-900 dark:text-white">
                  1,240{" "}
                  <span className="text-emerald-500 text-xs ml-2">↑ 8%</span>
                </div>
                <p className="text-[9px] font-bold text-slate-500 uppercase mt-2">
                  Active data relay across 4 systems
                </p>
              </div>
              <div className="bg-card-bg border border-border-dim p-8 rounded-[2rem] shadow-xl relative overflow-hidden group">
                <ShieldCheck className="absolute bottom-[-20px] right-[-20px] w-32 h-32 text-brand/5 group-hover:text-brand/10 transition-all" />
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Integrity Health
                </h4>
                <div className="text-4xl font-black text-emerald-500 uppercase tracking-tighter">
                  Verified
                </div>
                <p className="text-[9px] font-bold text-slate-500 uppercase mt-2">
                  Last global audit check: 24m ago
                </p>
              </div>
              <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden group border border-slate-800">
                <div className="absolute inset-0 bg-brand/5 group-hover:bg-brand/10 transition-all"></div>
                <h4 className="text-[10px] font-black text-brand uppercase tracking-widest mb-1 relative z-10">
                  Available Connectors
                </h4>
                <div className="text-4xl font-black text-white relative z-10">
                  250+
                </div>
                <p className="text-[9px] font-bold text-slate-400 uppercase mt-2 relative z-10 flex items-center gap-1 group-hover:text-white transition-colors cursor-pointer">
                  Explore Marketplace <ExternalLink className="w-2.5 h-2.5" />
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integrations.map((int) => (
                <IntegrationCard key={int.id} int={int} />
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "api-keys" && (
          <motion.div
            key="api-keys"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex flex-col xl:flex-row xl:items-center justify-between bg-card-bg border border-border-dim rounded-[1.5rem] p-6 shadow-xl gap-6">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-brand text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand/20 shrink-0">
                  <Key className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase leading-none">
                    Authentication Keys
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">
                    Manage production and testing environment tokens
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsKeyModalOpen(true)}
                className="w-full xl:w-auto px-8 py-3.5 bg-brand text-white font-black rounded-2xl shadow-xl shadow-brand/20 active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> GENERATE NEW TOKEN
              </button>
            </div>

            <div className="bg-card-bg border border-border-dim rounded-[2rem] shadow-xl overflow-hidden overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-slate-50 dark:bg-white/5 border-b border-border-dim">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Key Name
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Token / Secret
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Date Created
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-dim">
                  {apiKeys.map((key) => (
                    <tr
                      key={key.id}
                      className="hover:bg-slate-50 dark:hover:bg-white/5 transition-all group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900 dark:text-white uppercase tracking-tight">
                            {key.name}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={cn(
                                "w-2 h-2 rounded-full",
                                key.status === "Active"
                                  ? "bg-emerald-500"
                                  : "bg-rose-500",
                              )}
                            ></span>
                            <span className="text-[10px] font-black uppercase text-slate-400">
                              {key.status} • Last used {key.lastUsed}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <code className="bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 font-mono tracking-tighter">
                            {key.hidden ? "••••••••••••••••••••" : key.key}
                          </code>
                          <button
                            onClick={() => toggleKeyVisibility(key.id)}
                            className="p-2 text-slate-400 hover:text-brand transition-colors"
                          >
                            {key.hidden ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(key.key)
                            }
                            className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase">
                          {key.created}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        {key.status === "Active" ? (
                          <button
                            onClick={() => revokeKey(key.id)}
                            className="px-4 py-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
                          >
                            Revoke Token
                          </button>
                        ) : (
                          <span className="text-[10px] font-black text-slate-400 uppercase">
                            Revoked Archive
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === "webhooks" && (
          <motion.div
            key="webhooks"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex flex-col xl:flex-row xl:items-center justify-between bg-card-bg border border-border-dim rounded-[1.5rem] p-6 shadow-xl gap-6">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                  <Webhook className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase leading-none">
                    Webhook Endpoints
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">
                    Automate outgoing payload delivery on lifecycle events
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsWebhookModalOpen(true)}
                className="w-full xl:w-auto px-8 py-3.5 bg-slate-900 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> ADD ENDPOINT
              </button>
            </div>

            <div className="bg-card-bg border border-border-dim rounded-[2rem] shadow-xl overflow-hidden overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-slate-50 dark:bg-white/5 border-b border-border-dim">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      URL / Destination
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Subscribed Events
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-dim">
                  {webhooks.map((wh) => (
                    <tr
                      key={wh.id}
                      className="hover:bg-slate-50 dark:hover:bg-white/5 transition-all group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors group-hover:text-brand">
                            {wh.url}
                          </span>
                          <span className="text-[9px] font-bold uppercase text-slate-400 mt-1">
                            Created on {wh.created}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-wrap gap-1.5">
                          {wh.events.map((ev) => (
                            <span
                              key={ev}
                              className="px-2 py-0.5 bg-slate-100 dark:bg-white/5 border border-border-dim rounded text-[8px] font-black text-slate-500 uppercase tracking-tighter"
                            >
                              {ev}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "w-2 h-2 rounded-full",
                              wh.status === "Active"
                                ? "bg-emerald-500"
                                : wh.status === "Failing"
                                  ? "bg-amber-500"
                                  : "bg-slate-400",
                            )}
                          ></span>
                          <span
                            className={cn(
                              "text-[9px] font-black uppercase",
                              wh.status === "Active"
                                ? "text-emerald-500"
                                : wh.status === "Failing"
                                  ? "text-amber-500"
                                  : "text-slate-400",
                            )}
                          >
                            {wh.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === "logs" && (
          <motion.div
            key="logs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-card-bg border border-border-dim rounded-[2rem] shadow-xl overflow-hidden overflow-x-auto">
              <div className="p-6 border-b border-border-dim flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  Security & Activity Log
                </h3>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 bg-slate-50 dark:bg-white/5 text-[10px] font-black uppercase border border-border-dim rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-all">
                    Download .CSV
                  </button>
                </div>
              </div>
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-slate-50 dark:bg-white/5 border-b border-border-dim">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Type
                    </th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Event
                    </th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Details
                    </th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-dim">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-xs"
                    >
                      <td className="px-8 py-4">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded font-black uppercase text-[8px]",
                            log.type === "API"
                              ? "bg-blue-500/10 text-blue-500"
                              : log.type === "Webhook"
                                ? "bg-purple-500/10 text-purple-500"
                                : "bg-slate-500/10 text-slate-500",
                          )}
                        >
                          {log.type}
                        </span>
                      </td>
                      <td className="px-8 py-4 font-black uppercase text-slate-900 dark:text-white tracking-tighter">
                        {log.event}
                      </td>
                      <td className="px-8 py-4 text-slate-500 font-medium truncate max-w-xs">
                        {log.details}
                      </td>
                      <td className="px-8 py-4">
                        <span
                          className={cn(
                            "font-black tracking-widest uppercase text-[9px]",
                            log.status === "Success"
                              ? "text-emerald-500"
                              : log.status === "Warning"
                                ? "text-amber-500"
                                : "text-rose-500",
                          )}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right text-slate-400 font-bold uppercase text-[9px]">
                        {log.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isKeyModalOpen && (
          <CreateKeyModal
            onClose={() => setIsKeyModalOpen(false)}
            onSave={createKey}
          />
        )}
        {isWebhookModalOpen && (
          <CreateWebhookModal
            onClose={() => setIsWebhookModalOpen(false)}
            onSave={createWebhook}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function IntegrationCard({ int }: any) {
  const Icon = int.icon;
  return (
    <div className="bg-card-bg border border-border-dim rounded-[2.5rem] p-8 hover:border-brand/40 transition-all group shadow-sm flex flex-col">
      <div className="flex items-start justify-between mb-6">
        <div className="w-14 h-14 bg-app-bg border border-border-dim rounded-2xl flex items-center justify-center text-brand shadow-inner group-hover:bg-brand group-hover:text-white transition-all">
          <Icon className="w-7 h-7" />
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all",
              int.status === "Connected"
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                : int.status === "Configure"
                  ? "bg-brand/10 text-brand border-brand/20"
                  : "bg-slate-100 dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/10",
            )}
          >
            {int.status}
          </span>
          <button className="p-2 text-slate-300 hover:text-slate-600 dark:hover:text-slate-200">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none group-hover:text-brand transition-colors">
        {int.name}
      </h3>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 block h-[1px] bg-brand/30 w-1/4 group-hover:w-1/2 transition-all"></p>
      <p className="text-xs font-bold text-slate-500 mt-4 leading-relaxed line-clamp-2 uppercase tracking-tighter opacity-80">
        {int.description}
      </p>

      <div className="mt-8 pt-6 border-t border-border-dim flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            {int.category}
          </span>
          {int.lastSync && (
            <>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span className="text-[9px] font-bold text-emerald-500 uppercase flex items-center gap-1">
                <RefreshCw className="w-2.5 h-2.5" /> {int.lastSync}
              </span>
            </>
          )}
        </div>
        <button
          onClick={() => alert(`Redirecting to ${int.name} setup workflow...`)}
          className="text-[9px] font-black text-brand uppercase tracking-widest hover:underline flex items-center gap-1"
        >
          {int.status === "Available"
            ? "Enable"
            : int.status === "Configure"
              ? "Setup"
              : "Manage"}
          <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

function CreateKeyModal({ onClose, onSave }: any) {
  const [name, setName] = useState("");
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
        className="bg-app-bg border border-border-dim w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl"
      >
        <div className="p-8 border-b border-border-dim flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand text-white rounded-2xl shadow-xl shadow-brand/20">
              <Key className="w-6 h-6" />
            </div>
            <h3 className="font-black text-xl uppercase tracking-tight text-slate-900 dark:text-white">
              New API Key
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <div className="p-10 space-y-6">
          <div className="p-6 bg-brand/5 border border-brand/10 rounded-2xl">
            <p className="text-[10px] font-bold text-brand uppercase tracking-widest leading-relaxed">
              API keys provide full access to your production asset data. Never
              share keys in client-side code or public repositories.
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
              Key Description / Purpose
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-card-bg p-4 rounded-2xl text-sm font-bold border border-border-dim focus:ring-1 focus:ring-brand outline-none"
              placeholder="e.g. Dashboard External Feed"
            />
          </div>
          <button
            onClick={() => onSave(name)}
            disabled={!name}
            className="w-full py-5 bg-brand text-white font-black rounded-2xl shadow-xl shadow-brand/20 active:scale-95 transition-all text-xs uppercase tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            GENERATE SECURE KEY
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CreateWebhookModal({ onClose, onSave }: any) {
  const [url, setUrl] = useState("");
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
        className="bg-app-bg border border-border-dim w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl"
      >
        <div className="p-8 border-b border-border-dim flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-xl shadow-emerald-500/20">
              <Webhook className="w-6 h-6" />
            </div>
            <h3 className="font-black text-xl uppercase tracking-tight text-slate-900 dark:text-white">
              Add Webhook
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <div className="p-10 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
              Endpoint URL
            </label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-card-bg p-4 rounded-2xl text-sm font-bold border border-border-dim focus:ring-1 focus:ring-emerald-500 outline-none"
              placeholder="https://your-api.com/webhooks"
            />
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
              Subscribe to Events
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["asset.all", "maint.high", "audit.failed", "finance.depr"].map(
                (ev) => (
                  <div
                    key={ev}
                    className="flex items-center gap-3 p-3 bg-white/5 border border-border-dim rounded-xl hover:bg-emerald-500/5 hover:border-emerald-500/20 transition-all cursor-pointer"
                  >
                    <div className="w-4 h-4 rounded border border-border-dim flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 opacity-0 group-hover:opacity-100" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                      {ev}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
          <button
            onClick={() => onSave(url)}
            disabled={!url}
            className="w-full py-5 bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all text-xs uppercase tracking-[0.2em] disabled:opacity-50"
          >
            REGISTER ENDPOINT
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
