import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';

class TenantShell extends StatefulWidget {
  const TenantShell({super.key});

  @override
  State<TenantShell> createState() => _TenantShellState();
}

class _TenantShellState extends State<TenantShell> {
  int _selectedIndex = 0;
  String _planName = 'Loading...';
  List<String> _enabledModules = [];

  @override
  void initState() {
    super.initState();
    _loadTenantProfile();
  }

  Future<void> _loadTenantProfile() async {
    // In a real app, this would call /api/tenant/profile
    await Future.delayed(const Duration(seconds: 1));
    if (mounted) {
      setState(() {
        _planName = 'Professional';
        _enabledModules = [
          'Dashboard',
          'Organization',
          'Users',
          'Assets',
          'QR',
          'Transfers',
          'Maintenance',
          'Warranty'
        ];
      });
    }
  }

  final List<(_ModuleItem, String)> _allModules = [
    (_ModuleItem('Dashboard', Icons.dashboard), 'free'),
    (_ModuleItem('Organization', Icons.account_balance), 'free'),
    (_ModuleItem('Users', Icons.people), 'free'),
    (_ModuleItem('Assets', Icons.inventory), 'free'),
    (_ModuleItem('QR', Icons.qr_code), 'free'),
    (_ModuleItem('Transfers', Icons.swap_horiz), 'free'),
    (_ModuleItem('Maintenance', Icons.build), 'professional'),
    (_ModuleItem('Warranty', Icons.verified), 'professional'),
    (_ModuleItem('AMC', Icons.history_edu), 'professional'),
    (_ModuleItem('Audit', Icons.assignment_turned_in), 'professional'),
    (_ModuleItem('Finance', Icons.account_balance_wallet), 'professional'),
    (_ModuleItem('GPS', Icons.map), 'enterprise'),
    (_ModuleItem('API Hub', Icons.api), 'enterprise'),
  ];

  bool _isModuleLocked(String title) {
    if (_enabledModules.isEmpty) return false; // Don't lock during loading
    return !_enabledModules.contains(title);
  }

  void _onModuleTap(int index, String title) {
    if (_isModuleLocked(title)) {
      _showUpgradeDialog(title);
    } else {
      setState(() => _selectedIndex = index);
      if (MediaQuery.of(context).size.width <= 900) {
        Navigator.pop(context);
      }
    }
  }

  void _showUpgradeDialog(String module) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Upgrade Required'),
        content: Text('The "$module" module is not available in your current $_planName plan. Would you like to upgrade?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Later')),
          ElevatedButton(onPressed: () => Navigator.pop(context), child: const Text('View Plans')),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDesktop = MediaQuery.of(context).size.width > 900;
    final user = FirebaseAuth.instance.currentUser;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Asstella ERP'),
        actions: [
          if (_planName.isNotEmpty)
            Chip(
              label: Text(_planName),
              backgroundColor: Colors.blue.withOpacity(0.1),
            ),
          const SizedBox(width: 8),
          if (user != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Center(child: Text(user.displayName ?? user.email ?? '')),
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
              child: _buildSidebar(),
            ),
      body: Row(
        children: [
          if (isDesktop)
            SizedBox(
              width: 250,
              child: _buildSidebar(),
            ),
          Expanded(
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('Current Module: ${_allModules[_selectedIndex].$1.title}',
                      style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  const Text('Company: Asstella Corp'),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSidebar() {
    return ListView(
      children: [
        const DrawerHeader(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.business, size: 50, color: Colors.blue),
              SizedBox(height: 8),
              Text('Asstella', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            ],
          ),
        ),
        ..._allModules.asMap().entries.map((e) {
          final isLocked = _isModuleLocked(e.value.$1.title);
          return ListTile(
            leading: Icon(e.value.$1.icon),
            title: Text(e.value.$1.title),
            trailing: isLocked ? const Icon(Icons.lock, size: 16, color: Colors.grey) : null,
            selected: _selectedIndex == e.key && !isLocked,
            onTap: () => _onModuleTap(e.key, e.value.$1.title),
          );
        }),
      ],
    );
  }
}

class _ModuleItem {
  final String title;
  final IconData icon;
  _ModuleItem(this.title, this.icon);
}
