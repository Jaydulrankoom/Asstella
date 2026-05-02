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
import Users from "./pages/Users";

// Marketing Pages
import MarketingHome from "./pages/marketing/Home";
import MarketingPricing from "./pages/marketing/Pricing";
import MarketingFeatures from "./pages/marketing/Features";
import MarketingAbout from "./pages/marketing/About";
import MarketingContact from "./pages/marketing/Contact";
import MarketingBlog from "./pages/marketing/Blog";
import MarketingFeatureDetail from "./pages/marketing/FeatureDetail";

import { ThemeProvider } from "./context/ThemeContext";
import { UserProvider } from "./context/UserContext";

export default function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Marketing Website */}
            <Route path="/" element={<MarketingLayout children={<MarketingHome />} />} />
            <Route path="/pricing" element={<MarketingLayout children={<MarketingPricing />} />} />
            <Route path="/features" element={<MarketingLayout children={<MarketingFeatures />} />} />
            <Route path="/features/:id" element={<MarketingLayout children={<MarketingFeatureDetail />} />} />
            <Route path="/about" element={<MarketingLayout children={<MarketingAbout />} />} />
            <Route path="/contact" element={<MarketingLayout children={<MarketingContact />} />} />
            <Route path="/blog" element={<MarketingLayout children={<MarketingBlog />} />} />
            <Route path="/blog/:id" element={<MarketingLayout children={<MarketingBlog />} />} />
            <Route path="/privacy" element={<MarketingLayout children={<MarketingHome />} />} />
            <Route path="/terms" element={<MarketingLayout children={<MarketingHome />} />} />
            <Route path="/login" element={<Navigate to="/app" replace />} />
            
            {/* Dashboard App - Accessible via /app prefix */}
            <Route path="/app/*" element={
              <AppShell>
                <Routes>
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
                  <Route path="users" element={<Users />} />
                </Routes>
              </AppShell>
            } />

            {/* Support legacy paths by redirecting to /app/* */}
            <Route path="/assets" element={<Navigate to="/app/assets" replace />} />
            <Route path="/maintenance" element={<Navigate to="/app/maintenance" replace />} />
            <Route path="/warranty" element={<Navigate to="/app/warranty" replace />} />
            <Route path="/amc" element={<Navigate to="/app/amc" replace />} />
            <Route path="/finance" element={<Navigate to="/app/finance" replace />} />
            <Route path="/gps" element={<Navigate to="/app/gps" replace />} />
            <Route path="/audit" element={<Navigate to="/app/audit" replace />} />
            <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
            <Route path="/procurement" element={<Navigate to="/app/procurement" replace />} />
            <Route path="/vendors" element={<Navigate to="/app/vendors" replace />} />
            <Route path="/reports" element={<Navigate to="/app/reports" replace />} />
            <Route path="/integrations" element={<Navigate to="/app/integrations" replace />} />
            <Route path="/scanner" element={<Navigate to="/app/scanner" replace />} />
            <Route path="/notifications" element={<Navigate to="/app/notifications" replace />} />
            <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
            <Route path="/users" element={<Navigate to="/app/users" replace />} />

          </Routes>
        </BrowserRouter>
      </UserProvider>
    </ThemeProvider>
  );
}
