import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core_providers.dart';

class PlatformSettingsScreen extends ConsumerWidget {
  const PlatformSettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settingsAsync = ref.watch(platformSettingsProvider);

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: settingsAsync.when(
        data: (settings) => ListView(
          padding: const EdgeInsets.all(24),
          children: [
            const Text('Global Configuration', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, fontFamily: 'Syne')),
            const SizedBox(height: 32),
            _Section(
              title: 'System Control',
              children: [
                SwitchListTile(
                  title: const Text('Maintenance Mode'),
                  subtitle: const Text('Disable platform access for all tenants during updates'),
                  value: settings['system']?['maintenance_mode'] ?? false,
                  onChanged: (v) {},
                ),
                SwitchListTile(
                  title: const Text('Public Registration'),
                  subtitle: const Text('Allow new tenants to sign up for trials via landing page'),
                  value: settings['system']?['registration_open'] ?? true,
                  onChanged: (v) {},
                ),
              ],
            ),
            const SizedBox(height: 24),
            _Section(
              title: 'Integrations',
              children: [
                ListTile(
                  leading: const Icon(Icons.payment),
                  title: const Text('Stripe Gateway'),
                  trailing: const Text('PROVISIONED', style: TextStyle(color: Colors.green, fontSize: 10)),
                  onTap: () {},
                ),
                ListTile(
                  leading: const Icon(Icons.email),
                  title: const Text('SendGrid / SMTP'),
                  trailing: const Text('CONNECTED', style: TextStyle(color: Colors.green, fontSize: 10)),
                  onTap: () {},
                ),
                ListTile(
                  leading: const Icon(Icons.map),
                  title: const Text('GPS Providers'),
                  subtitle: const Text('Manage Teltonika, Concox, and custom GPS API endpoints'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {},
                ),
              ],
            ),
          ],
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, s) => Center(child: Text('Error: $e')),
      ),
    );
  }
}

class _Section extends StatelessWidget {
  final String title;
  final List<Widget> children;
  const _Section({required this.title, required this.children});
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.blue)),
        const SizedBox(height: 16),
        Container(
          decoration: BoxDecoration(color: const Color(0xFF1E1E1E), borderRadius: BorderRadius.circular(16)),
          child: Column(children: children),
        )
      ],
    );
  }
}
