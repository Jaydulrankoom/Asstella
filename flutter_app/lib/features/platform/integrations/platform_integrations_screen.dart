import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'integrations_provider.dart';

class PlatformIntegrationsScreen extends ConsumerWidget {
  const PlatformIntegrationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: const TabBar(
          isScrollable: true,
          tabs: [
            Tab(text: 'GPS Providers'),
            Tab(text: 'API Gateway'),
            Tab(text: 'Webhooks'),
          ],
        ),
        body: const Padding(
          padding: EdgeInsets.all(24),
          child: TabBarView(
            children: [
              _GpsTab(),
              _ApiKeysTab(),
              _WebhooksTab(),
            ],
          ),
        ),
      ),
    );
  }
}

class _GpsTab extends ConsumerWidget {
  const _GpsTab();
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final gpsAsync = ref.watch(gpsProvidersProvider);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('GPS Providers', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            ElevatedButton.icon(
              onPressed: () => _showAddProviderDialog(context, ref),
              icon: const Icon(Icons.add),
              label: const Text('Add Provider'),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Expanded(
          child: gpsAsync.when(
            data: (providers) => GridView.builder(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                childAspectRatio: 2.5,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
              ),
              itemCount: providers.length,
              itemBuilder: (context, i) => _ProviderCard(provider: providers[i]),
            ),
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, s) => Center(child: Text('Error: $e')),
          ),
        ),
      ],
    );
  }

  void _showAddProviderDialog(BuildContext context, WidgetRef ref) {
    final nameController = TextEditingController();
    final urlController = TextEditingController();
    final apiKeyController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1A1A1A),
        title: const Text('Add GPS Provider'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: nameController, decoration: const InputDecoration(labelText: 'Provider Name')),
            TextField(controller: urlController, decoration: const InputDecoration(labelText: 'API Base URL')),
            TextField(controller: apiKeyController, decoration: const InputDecoration(labelText: 'API Key'), obscureText: true),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              await ref.read(integrationOpsProvider.notifier).addGpsProvider({
                'name': nameController.text,
                'api_base_url': urlController.text,
                'auth_type': 'api_key',
                'credentials': {'api_key': apiKeyController.text},
              });
              Navigator.pop(context);
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }
}

class _ProviderCard extends ConsumerWidget {
  final dynamic provider;
  const _ProviderCard({required this.provider});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: const Color(0xFF1E1E1E), borderRadius: BorderRadius.circular(16)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.location_on, color: Colors.blue),
              const SizedBox(width: 12),
              Text(provider['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const Spacer(),
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: provider['status'] == 'active' ? Colors.green : Colors.grey,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(provider['api_base_url'], style: const TextStyle(color: Colors.grey, fontSize: 12), maxLines: 1, overflow: TextOverflow.ellipsis),
          const Spacer(),
          Row(
            children: [
              TextButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Testing connection...')));
                },
                child: const Text('Test Connection', style: TextStyle(fontSize: 12)),
              ),
              const Spacer(),
              IconButton(icon: const Icon(Icons.settings, size: 20), onPressed: () {}),
            ],
          )
        ],
      ),
    );
  }
}

class _ApiKeysTab extends ConsumerWidget {
  const _ApiKeysTab();
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final keysAsync = ref.watch(apiKeysProvider);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Tenant API Keys', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            ElevatedButton.icon(
              onPressed: () => _showGenerateKeyDialog(context, ref),
              icon: const Icon(Icons.vpn_key),
              label: const Text('Generate New Key'),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Expanded(
          child: keysAsync.when(
            data: (keys) => Container(
              width: double.infinity,
              decoration: BoxDecoration(color: const Color(0xFF1E1E1E), borderRadius: BorderRadius.circular(16)),
              child: SingleChildScrollView(
                child: DataTable(
                  columns: const [
                    DataColumn(label: Text('Prefix')),
                    DataColumn(label: Text('Name')),
                    DataColumn(label: Text('Tenant ID')),
                    DataColumn(label: Text('Status')),
                    DataColumn(label: Text('Actions')),
                  ],
                  rows: keys.map((k) => DataRow(cells: [
                    DataCell(Text(k['key_prefix'], style: const TextStyle(fontFamily: 'monospace', color: Colors.blue))),
                    DataCell(Text(k['name'] ?? 'Unnamed')),
                    DataCell(Text(k['tenant_id'])),
                    DataCell(Text(k['is_active'] ? 'ACTIVE' : 'INACTIVE', 
                      style: TextStyle(color: k['is_active'] ? Colors.green : Colors.red, fontSize: 10, fontWeight: FontWeight.bold))),
                    DataCell(IconButton(
                      icon: const Icon(Icons.delete_outline, color: Colors.red),
                      onPressed: () {},
                    )),
                  ])).toList(),
                ),
              ),
            ),
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, s) => Center(child: Text('Error: $e')),
          ),
        ),
      ],
    );
  }

  void _showGenerateKeyDialog(BuildContext context, WidgetRef ref) {
    final tenantIdController = TextEditingController();
    final nameController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1A1A1A),
        title: const Text('Generate API Key'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: tenantIdController, decoration: const InputDecoration(labelText: 'Tenant ID')),
            TextField(controller: nameController, decoration: const InputDecoration(labelText: 'Key Label (e.g. ERP Integration)')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              final result = await ref.read(integrationOpsProvider.notifier).generateApiKey(
                tenantIdController.text,
                nameController.text,
              );
              Navigator.pop(context);
              if (result != null) {
                _showNewKeyModal(context, result['full_key']);
              }
            },
            child: const Text('Generate'),
          ),
        ],
      ),
    );
  }

  void _showNewKeyModal(BuildContext context, String fullKey) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1A1A1A),
        title: const Row(
          children: [
            Icon(Icons.warning, color: Colors.orange),
            SizedBox(width: 8),
            Text('Copy your API Key'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('This key will only be shown ONCE. Store it securely.', style: TextStyle(color: Colors.grey)),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: Colors.black, borderRadius: BorderRadius.circular(8)),
              child: SelectableText(fullKey, style: const TextStyle(fontFamily: 'monospace', color: Colors.blue, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
        actions: [
          ElevatedButton(onPressed: () => Navigator.pop(context), child: const Text('I have stored it')),
        ],
      ),
    );
  }
}

class _WebhooksTab extends ConsumerWidget {
  const _WebhooksTab();
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final webhooksAsync = ref.watch(webhooksProvider);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Outbound Webhooks', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            ElevatedButton.icon(onPressed: () {}, icon: const Icon(Icons.webhook), label: const Text('Add Webhook')),
          ],
        ),
        const SizedBox(height: 16),
        Expanded(
          child: webhooksAsync.when(
            data: (webhooks) => ListView.builder(
              itemCount: webhooks.length,
              itemBuilder: (context, i) => _WebhookCard(webhook: webhooks[i]),
            ),
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, s) => Center(child: Text('Error: $e')),
          ),
        ),
      ],
    );
  }
}

class _WebhookCard extends ConsumerWidget {
  final dynamic webhook;
  const _WebhookCard({required this.webhook});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: const Color(0xFF1E1E1E), borderRadius: BorderRadius.circular(16)),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(webhook['name'], style: const TextStyle(fontWeight: FontWeight.bold)),
                Text(webhook['target_url'], style: const TextStyle(color: Colors.grey, fontSize: 12)),
              ],
            ),
          ),
          ElevatedButton(onPressed: () {}, child: const Text('Test Delivery')),
          const SizedBox(width: 16),
          Switch(value: webhook['is_active'] ?? true, onChanged: (v) {}),
        ],
      ),
    );
  }
}
