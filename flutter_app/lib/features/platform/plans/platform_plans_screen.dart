import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'plans_provider.dart';

class PlatformPlansScreen extends ConsumerWidget {
  const PlatformPlansScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final plansAsync = ref.watch(plansProvider);

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Subscription Plans',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, fontFamily: 'Syne'),
                ),
                ElevatedButton.icon(
                  onPressed: () => _showPlanDialog(context, ref),
                  icon: const Icon(Icons.add),
                  label: const Text('Create New Plan'),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Expanded(
              child: plansAsync.when(
                data: (plans) => GridView.builder(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 3,
                    crossAxisSpacing: 24,
                    mainAxisSpacing: 24,
                    childAspectRatio: 0.7,
                  ),
                  itemCount: plans.length,
                  itemBuilder: (context, index) => _PlanCard(plan: plans[index]),
                ),
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (err, stack) => Center(child: Text('Error: $err')),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showPlanDialog(BuildContext context, WidgetRef ref, [dynamic plan]) {
    // Implementation of plan dialog
  }
}

class _PlanCard extends ConsumerWidget {
  final dynamic plan;
  const _PlanCard({required this.plan});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isActive = plan['is_active'] ?? false;

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isActive ? Colors.blue.withOpacity(0.5) : Colors.white10),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: isActive ? Colors.blue.withOpacity(0.05) : Colors.white10,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            ),
            child: Column(
              children: [
                Text(
                  plan['name']?.toUpperCase() ?? 'PLAN',
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, letterSpacing: 2),
                ),
                const SizedBox(height: 8),
                Text(
                  '\$${plan['monthly_fee_usd']}/mo',
                  style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.blue),
                ),
                Text('Setup Fee: \$${plan['setup_fee_usd'] ?? 0}', style: const TextStyle(color: Colors.grey, fontSize: 12)),
              ],
            ),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(24),
              children: [
                _featureItem('Max Assets', '${plan['limits']?['max_assets']}'),
                _featureItem('Max Users', '${plan['limits']?['max_users']}'),
                _featureItem('Max Branches', '${plan['limits']?['max_branches']}'),
                _featureItem('Storage', '${plan['limits']?['storage_gb']} GB'),
                const Divider(height: 32),
                const Text('Enabled Modules', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.grey)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 4,
                  runSpacing: 4,
                  children: (plan['modules_included'] as List<dynamic>? ?? [])
                      .map((m) => _moduleChip(m.toString()))
                      .toList(),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => ref.read(planOpsProvider.notifier).togglePlan(plan['id']),
                    child: Text(isActive ? 'Deactivate' : 'Activate'),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  onPressed: () {}, // Edit
                  icon: const Icon(Icons.edit_outlined),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _featureItem(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey, fontSize: 13)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
        ],
      ),
    );
  }

  Widget _moduleChip(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: Colors.blue.withOpacity(0.1),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        label.replaceAll('_', ' ').toUpperCase(),
        style: const TextStyle(fontSize: 8, color: Colors.blue, fontWeight: FontWeight.bold),
      ),
    );
  }
}
