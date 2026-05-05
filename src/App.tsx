/**
 * Copyright 2024 Google LLC
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import MarketingLayout from "./components/layout/MarketingLayout";
import Dashboard from "./pages/Dashboard";
import Assets from "./pages/Assets";
import Maintenance from "./pages/Maintenance";
import Warranty from "./pages/Warranty";
import AMC from "./pages/AMC";
import Finance from "./pages/Finance";
import GPS from "./pages/GPS";
import Audit from "./pages/Audit";
import Profile from "./pages/Profile";
import Procurement from "./pages/Procurement";
import Vendors from "./pages/Vendors";
import VendorDetail from "./pages/VendorDetail";
import Reports from "./pages/Reports";
import Integrations from "./pages/Integrations";
import Scanner from "./pages/Scanner";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import UsersPage from "./pages/Users";

// Marketing Pages
import MarketingHome from "./pages/marketing/Home";
import MarketingPricing from "./pages/marketing/Pricing";
import MarketingFeatures from "./pages/marketing/Features";
import MarketingAbout from "./pages/marketing/About";
import MarketingContact from "./pages/marketing/Contact";
import MarketingBlog from "./pages/marketing/Blog";
import MarketingFeatureDetail from "./pages/marketing/FeatureDetail";

// Platform Pages
import PlatformDashboard from "./pages/platform/PlatformDashboard";
import PlatformTenants from "./pages/platform/PlatformTenants";
import PlatformIntegrations from "./pages/platform/PlatformIntegrations";
import PlatformSecurity from "./pages/platform/PlatformSecurity";
import PlatformAnalytics from "./pages/platform/PlatformAnalytics";
import PlatformSettings from "./pages/platform/PlatformSettings";
import PlatformSupport from "./pages/platform/PlatformSupport";
import PlatformPlaceholder from "./pages/platform/PlatformPlaceholder";
import { Users, Coins, Package, UserCog, Share2, BarChart3, AlertTriangle, ShieldCheck, Settings as SettingsIcon } from "lucide-react";

import { ThemeProvider } from "./context/ThemeContext";
import { UserProvider } from "./context/UserContext";

export default function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Marketing Website */}
            <Route
              path="/"
              element={<MarketingLayout children={<MarketingHome />} />}
            />

            {/* Product Routes */}
            <Route
              path="/product/asset-register"
              element={
                <MarketingLayout
                  children={<MarketingFeatureDetail feature="asset-register" />}
                />
              }
            />
            <Route
              path="/product/depreciation"
              element={
                <MarketingLayout
                  children={<MarketingFeatureDetail feature="depreciation" />}
                />
              }
            />
            <Route
              path="/product/audit"
              element={
                <MarketingLayout
                  children={<MarketingFeatureDetail feature="audit" />}
                />
              }
            />
            <Route
              path="/product/maintenance"
              element={
                <MarketingLayout
                  children={<MarketingFeatureDetail feature="maintenance" />}
                />
              }
            />
            <Route
              path="/product/amc"
              element={
                <MarketingLayout
                  children={<MarketingFeatureDetail feature="amc" />}
                />
              }
            />
            <Route
              path="/product/gps"
              element={
                <MarketingLayout
                  children={<MarketingFeatureDetail feature="gps" />}
                />
              }
            />

            {/* Solution Routes */}
            <Route
              path="/solution/healthcare"
              element={
                <MarketingLayout
                  children={<MarketingFeatureDetail feature="healthcare" />}
                />
              }
            />
            <Route
              path="/solution/manufacturing"
              element={
                <MarketingLayout
                  children={<MarketingFeatureDetail feature="manufacturing" />}
                />
              }
            />
            <Route
              path="/solution/education"
              element={
                <MarketingLayout
                  children={<MarketingFeatureDetail feature="education" />}
                />
              }
            />

            {/* Resource Routes */}
            <Route
              path="/resource/blog"
              element={<MarketingLayout children={<MarketingBlog />} />}
            />
            <Route
              path="/resource/docs"
              element={
                <MarketingLayout
                  children={<MarketingFeatureDetail feature="docs" />}
                />
              }
            />
            <Route
              path="/resource/webinars"
              element={
                <MarketingLayout
                  children={<MarketingFeatureDetail feature="webinars" />}
                />
              }
            />

            {/* Company Routes */}
            <Route
              path="/company/about"
              element={<MarketingLayout children={<MarketingAbout />} />}
            />
            <Route
              path="/company/careers"
              element={
                <MarketingLayout
                  children={<MarketingFeatureDetail feature="careers" />}
                />
              }
            />
            <Route
              path="/company/contact"
              element={<MarketingLayout children={<MarketingContact />} />}
            />

            {/* Legacy Routes */}
            <Route
              path="/pricing"
              element={<MarketingLayout children={<MarketingPricing />} />}
            />
            <Route
              path="/features"
              element={<MarketingLayout children={<MarketingFeatures />} />}
            />
            <Route
              path="/about"
              element={<MarketingLayout children={<MarketingAbout />} />}
            />
            <Route
              path="/contact"
              element={<MarketingLayout children={<MarketingContact />} />}
            />
            <Route
              path="/blog"
              element={<MarketingLayout children={<MarketingBlog />} />}
            />

            <Route
              path="/legal/privacy"
              element={<MarketingLayout children={<MarketingHome />} />}
            />
            <Route
              path="/legal/terms"
              element={<MarketingLayout children={<MarketingHome />} />}
            />
            <Route path="/login" element={<Navigate to="/app" replace />} />

            {/* Dashboard App - Accessible via /app prefix */}
            <Route
              path="/app/*"
              element={
                <AppShell>
                  <Routes>
                    {/* Platform Routes */}
                    <Route path="platform" element={<PlatformDashboard />} />
                    <Route path="platform/tenants" element={<PlatformTenants />} />
                    <Route path="platform/billing" element={<PlatformPlaceholder title="Subscription & Billing" description="Plans, subscriptions, payments, renewals, invoices, overdue control" icon={Coins} />} />
                    <Route path="platform/plans" element={<PlatformPlaceholder title="Plans & Modules" description="Package setup, feature flags, module mapping" icon={Package} />} />
                    <Route path="platform/users" element={<PlatformPlaceholder title="Platform Users" description="Platform admins, support users, tenant admins" icon={UserCog} />} />
                    <Route path="platform/integrations" element={<PlatformIntegrations />} />
                    <Route path="platform/analytics" element={<PlatformAnalytics />} />
                    <Route path="platform/support" element={<PlatformSupport />} />
                    <Route path="platform/security" element={<PlatformSecurity />} />
                    <Route path="platform/settings" element={<PlatformSettings />} />

                    {/* Tenant Routes */}
                    <Route index element={<Dashboard />} />
                    <Route path="assets" element={<Assets />} />
                    <Route path="maintenance" element={<Maintenance />} />
                    <Route path="warranty" element={<Warranty />} />
                    <Route path="amc" element={<AMC />} />
                    <Route path="finance" element={<Finance />} />
                    <Route path="gps" element={<GPS />} />
                    <Route path="audit" element={<Audit />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="procurement" element={<Procurement />} />
                    <Route path="vendors" element={<Vendors />} />
                    <Route path="vendors/:id" element={<VendorDetail />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="integrations" element={<Integrations />} />
                    <Route path="scanner" element={<Scanner />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="users" element={<UsersPage />} />
                  </Routes>
                </AppShell>
              }
            />

            {/* Support legacy paths by redirecting to /app/* */}
            <Route
              path="/assets"
              element={<Navigate to="/app/assets" replace />}
            />
            <Route
              path="/maintenance"
              element={<Navigate to="/app/maintenance" replace />}
            />
            <Route
              path="/warranty"
              element={<Navigate to="/app/warranty" replace />}
            />
            <Route path="/amc" element={<Navigate to="/app/amc" replace />} />
            <Route
              path="/finance"
              element={<Navigate to="/app/finance" replace />}
            />
            <Route path="/gps" element={<Navigate to="/app/gps" replace />} />
            <Route
              path="/audit"
              element={<Navigate to="/app/audit" replace />}
            />
            <Route
              path="/profile"
              element={<Navigate to="/app/profile" replace />}
            />
            <Route
              path="/procurement"
              element={<Navigate to="/app/procurement" replace />}
            />
            <Route
              path="/vendors"
              element={<Navigate to="/app/vendors" replace />}
            />
            <Route
              path="/reports"
              element={<Navigate to="/app/reports" replace />}
            />
            <Route
              path="/integrations"
              element={<Navigate to="/app/integrations" replace />}
            />
            <Route
              path="/scanner"
              element={<Navigate to="/app/scanner" replace />}
            />
            <Route
              path="/notifications"
              element={<Navigate to="/app/notifications" replace />}
            />
            <Route
              path="/settings"
              element={<Navigate to="/app/settings" replace />}
            />
            <Route
              path="/users"
              element={<Navigate to="/app/users" replace />}
            />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </ThemeProvider>
  );
}
