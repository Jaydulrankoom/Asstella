import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'tenants_provider.dart';

class TenantDetailScreen extends ConsumerWidget {
  final String tenantId;
  const TenantDetailScreen({super.key, required this.tenantId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final detailAsync = ref.watch(tenantDetailProvider(tenantId));

    return Scaffold(
      appBar: AppBar(title: const Text('Tenant Profile')),
      body: detailAsync.when(
        data: (tenant) => _TenantDetailBody(tenant: tenant),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
      ),
    );
  }
}

class _TenantDetailBody extends ConsumerWidget {
  final Map<String, dynamic> tenant;
  const _TenantDetailBody({required this.tenant});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final status = tenant['status'] ?? 'trial';

    return DefaultTabController(
      length: 6,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            color: const Color(0xFF1E1E1E),
            child: Row(
              children: [
                const CircleAvatar(radius: 40, child: Icon(Icons.business, size: 40)),
                const SizedBox(width: 24),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(tenant['name'], style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                      Text('Slug: ${tenant['slug']} | Plan: ${tenant['plan_id']?.toUpperCase()}'),
                    ],
                  ),
                ),
                if (status == 'trial')
                  ElevatedButton.icon(
                    onPressed: () => _showOnboardConfirm(context, ref),
                    icon: const Icon(Icons.rocket_launch),
                    label: const Text('Complete Onboarding'),
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.amber),
                  )
                else if (status == 'active')
                  ElevatedButton(
                    onPressed: () => ref.read(tenantOpsProvider.notifier).updateStatus(tenant['id'], 'suspended'),
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.red.withOpacity(0.2), foregroundColor: Colors.red),
                    child: const Text('Suspend Tenant'),
                  )
                else if (status == 'suspended')
                  ElevatedButton(
                    onPressed: () => ref.read(tenantOpsProvider.notifier).updateStatus(tenant['id'], 'active'),
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.green.withOpacity(0.2), foregroundColor: Colors.green),
                    child: const Text('Activate Tenant'),
                  ),
                const SizedBox(width: 8),
                PopupMenuButton<String>(
                  onSelected: (val) {
                    if (val == 'resend') {
                      ref.read(tenantOpsProvider.notifier).resendCredentials(tenant['id']);
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Verification email sent.')));
                    } else if (val == 'change_plan') {
                       _showChangePlanDialog(context, ref, tenant['id']);
                    }
                  },
                  itemBuilder: (context) => [
                    const PopupMenuItem(value: 'resend', child: Text('Resend Credentials')),
                    const PopupMenuItem(value: 'change_plan', child: Text('Change Plan')),
                    const PopupMenuItem(value: 'notes', child: Text('Add Internal Note')),
                  ],
                ),
              ],
            ),
          ),
          const TabBar(
            isScrollable: true,
            tabs: [
              Tab(text: 'Overview'),
              Tab(text: 'Usage'),
              Tab(text: 'White-Label'),
              Tab(text: 'Users'),
              Tab(text: 'Activity'),
              Tab(text: 'Billing'),
            ],
          ),
          Expanded(
            child: TabBarView(
              children: [
                _OverviewTab(tenant: tenant),
                _UsageTab(tenant: tenant),
                _WhiteLabelTab(tenant: tenant),
                _UsersTab(tenant: tenant),
                _ActivityTab(tenant: tenant),
                _BillingTab(tenant: tenant),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showChangePlanDialog(BuildContext context, WidgetRef ref, String id) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Select New Plan'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: ['starter', 'professional', 'enterprise']
              .map((p) => ListTile(
                    title: Text(p.toUpperCase()),
                    onTap: () {
                      ref.read(tenantOpsProvider.notifier).changePlan(id, p);
                      Navigator.pop(context);
                    },
                  ))
              .toList(),
        ),
      ),
    );
  }

  void _showOnboardConfirm(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirm Activation'),
        content: const Text('This will activate the tenant and end the onboarding phase. Continue?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              ref.read(tenantOpsProvider.notifier).onboardTenant(tenant['id']);
              Navigator.pop(context);
            },
            child: const Text('Activate'),
          ),
        ],
      ),
    );
  }
}

class _WhiteLabelTab extends ConsumerWidget {
  final Map<String, dynamic> tenant;
  const _WhiteLabelTab({required this.tenant});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final wl = tenant['white_label'] ?? {};
    final branding = wl['branding'] ?? {};
    final theme = wl['theme'] ?? {};

    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        const Text('Visual Branding', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        _brandField('App Name Overwrite', branding['app_name'] ?? tenant['name']),
        _brandField('Logo URL', branding['logo_url'] ?? 'Default'),
        const SizedBox(height: 24),
        const Text('Theme Configuration', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        _colorField('Primary Color', theme['primary_color'] ?? '#000000'),
        _colorField('Secondary Color', theme['secondary_color'] ?? '#FFFFFF'),
        const SizedBox(height: 32),
        ElevatedButton(
          onPressed: () => _showEditWhiteLabel(context, ref),
          child: const Text('Edit Branding Settings'),
        ),
      ],
    );
  }

  Widget _brandField(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _colorField(String label, String color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey)),
          Row(
            children: [
              Text(color),
              const SizedBox(width: 8),
              Container(width: 24, height: 24, color: Colors.blue), // Simplified
            ],
          ),
        ],
      ),
    );
  }

  void _showEditWhiteLabel(BuildContext context, WidgetRef ref) {
    // Controller for app name
    final nameController = TextEditingController(text: (tenant['white_label']?['branding']?['app_name'] ?? tenant['name']));
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Update Branding'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: nameController, decoration: const InputDecoration(labelText: 'Display Name')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              ref.read(tenantOpsProvider.notifier).updateWhiteLabel(tenant['id'], {
                'branding': {'app_name': nameController.text}
              });
              Navigator.pop(context);
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }
}

class _UsersTab extends StatelessWidget {
  final Map<String, dynamic> tenant;
  const _UsersTab({required this.tenant});

  @override
  Widget build(BuildContext context) {
    return const Center(child: Text('User Management List (Placeholder)'));
  }
}

class _ActivityTab extends StatelessWidget {
  final Map<String, dynamic> tenant;
  const _ActivityTab({required this.tenant});

  @override
  Widget build(BuildContext context) {
    return const Center(child: Text('Tenant Activity Stream (Placeholder)'));
  }
}

class _BillingTab extends StatelessWidget {
  final Map<String, dynamic> tenant;
  const _BillingTab({required this.tenant});

  @override
  Widget build(BuildContext context) {
    return const Center(child: Text('Invoice History & Stripe Info (Placeholder)'));
  }
}

class _OverviewTab extends StatelessWidget {
  final Map<String, dynamic> tenant;
  const _OverviewTab({required this.tenant});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        _infoRow('Business Type', tenant['business_type']),
        _infoRow('Contact Person', tenant['contact_name']),
        _infoRow('Email', tenant['contact_email']),
        _infoRow('Phone', tenant['contact_phone'] ?? 'Not provided'),
        const Divider(height: 32),
        const Text('Onboarding Status', style: TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        LinearProgressIndicator(value: tenant['onboarding_complete'] == true ? 1.0 : 0.4),
      ],
    );
  }

  Widget _infoRow(String label, String? value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey)),
          Text(value ?? 'N/A', style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}

class _UsageTab extends StatelessWidget {
  final Map<String, dynamic> tenant;
  const _UsageTab({required this.tenant});

  @override
  Widget build(BuildContext context) {
    final usage = tenant['current_usage'] ?? {};
    final limits = tenant['limits'] ?? {};

    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        children: [
          _usageBar('Asset Register', usage['asset_count'], limits['max_assets'], 'Assets'),
          _usageBar('User Accounts', usage['user_count'], limits['max_users'], 'Users'),
          _usageBar('Branches', usage['branch_count'], limits['max_branches'], 'Branches'),
          _usageBar('Cloud Storage', usage['storage_used_mb'], (limits['storage_gb'] ?? 0) * 1024, 'MB'),
        ],
      ),
    );
  }

  Widget _usageBar(String label, dynamic current, dynamic limit, String unit) {
    final c = (current ?? 0).toDouble();
    final l = (limit ?? 1).toDouble();
    final percent = (c / l).clamp(0.0, 1.0);

    return Padding(
      padding: const EdgeInsets.only(bottom: 24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: const TextStyle(fontWeight: FontWeight.bold)),
              Text('$current / $limit $unit'),
            ],
          ),
          const SizedBox(height: 8),
          LinearProgressIndicator(
            value: percent,
            backgroundColor: Colors.white10,
            valueColor: AlwaysStoppedAnimation(percent > 0.9 ? Colors.red : Colors.blue),
          ),
        ],
      ),
    );
  }
}
