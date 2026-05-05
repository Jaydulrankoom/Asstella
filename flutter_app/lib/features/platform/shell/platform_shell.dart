import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../dashboard/platform_dashboard_screen.dart';
import '../tenants/platform_tenants_screen.dart';
import '../billing/platform_billing_screen.dart';
import '../plans/platform_plans_screen.dart';
import '../users/platform_users_screen.dart';
import '../integrations/platform_integrations_screen.dart';
import '../analytics/platform_analytics_screen.dart';
import '../support/platform_support_screen.dart';
import '../security/platform_security_screen.dart';
import '../settings/platform_settings_screen.dart';

class PlatformShell extends StatefulWidget {
  const PlatformShell({super.key});

  @override
  State<PlatformShell> createState() => _PlatformShellState();
}

class _PlatformShellState extends State<PlatformShell> {
  int _selectedIndex = 0;

  final List<(_ModuleItem, Widget)> _modules = [
    (_ModuleItem('Dashboard', Icons.dashboard), const PlatformDashboardScreen()),
    (_ModuleItem('Tenants', Icons.business), const PlatformTenantsScreen()),
    (_ModuleItem('Billing', Icons.credit_card), const PlatformBillingScreen()),
    (_ModuleItem('Plans', Icons.inventory), const PlatformPlansScreen()),
    (_ModuleItem('Users', Icons.manage_accounts), const PlatformUsersScreen()),
    (_ModuleItem('Integrations', Icons.integration_instructions), const PlatformIntegrationsScreen()),
    (_ModuleItem('Analytics', Icons.analytics), const PlatformAnalyticsScreen()),
    (_ModuleItem('Support', Icons.support_agent), const PlatformSupportScreen()),
    (_ModuleItem('Security', Icons.security), const PlatformSecurityScreen()),
    (_ModuleItem('Settings', Icons.settings), const PlatformSettingsScreen()),
  ];

  @override
  Widget build(BuildContext context) {
    final isDesktop = MediaQuery.of(context).size.width > 900;
    final user = FirebaseAuth.instance.currentUser;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Asstella Platform'),
        actions: [
          if (user != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Center(child: Text(user.email ?? '')),
            ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => FirebaseAuth.instance.signOut(),
          ),
        ],
      ),
      drawer: isDesktop
          ? null
          : Drawer(
              child: ListView(
                children: [
                  const DrawerHeader(
                    decoration: BoxDecoration(color: Colors.blue),
                    child: Text('Modules', style: TextStyle(color: Colors.white, fontSize: 24)),
                  ),
                  ..._modules.asMap().entries.map((e) => ListTile(
                        leading: Icon(e.value.$1.icon),
                        title: Text(e.value.$1.title),
                        selected: _selectedIndex == e.key,
                        onTap: () {
                          setState(() => _selectedIndex = e.key);
                          Navigator.pop(context);
                        },
                      )),
                ],
              ),
            ),
      body: Row(
        children: [
          if (isDesktop)
            NavigationRail(
              selectedIndex: _selectedIndex,
              onDestinationSelected: (i) => setState(() => _selectedIndex = i),
              labelType: NavigationRailLabelType.all,
              destinations: _modules
                  .map((m) => NavigationRailDestination(
                        icon: Icon(m.$1.icon),
                        label: Text(m.$1.title),
                      ))
                  .toList(),
            ),
          Expanded(child: _modules[_selectedIndex].$2),
        ],
      ),
    );
  }
}

class _ModuleItem {
  final String title;
  final IconData icon;
  _ModuleItem(this.title, this.icon);
}
