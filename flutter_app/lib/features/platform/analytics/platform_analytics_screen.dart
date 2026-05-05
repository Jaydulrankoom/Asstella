import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core_providers.dart';

class PlatformAnalyticsScreen extends ConsumerWidget {
  const PlatformAnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dataAsync = ref.watch(platformAnalyticsProvider);

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: dataAsync.when(
        data: (data) => SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Expansion & Performance', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, fontFamily: 'Syne')),
              const SizedBox(height: 24),
              Row(
                children: [
                  _StatBox(label: 'Avg Revenue Per Tenant', value: '\$${data['avg_revenue_per_tenant']}', icon: Icons.attach_money),
                  const SizedBox(width: 24),
                  _StatBox(label: 'Net Monthly Churn', value: '${data['churn_rate']}%', icon: Icons.trending_down),
                ],
              ),
              const SizedBox(height: 32),
              const Text('Tenant Distribution', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(child: _ChartCard(title: 'Tenants by Plan', child: _PieChartPlaceholder())),
                  const SizedBox(width: 24),
                  Expanded(child: _ChartCard(title: 'Top Countries', child: _BarChartPlaceholder())),
                ],
              ),
              const SizedBox(height: 32),
              _ChartCard(title: 'Revenue Expansion (MRR Trend)', child: Container(height: 300, child: const Center(child: Icon(Icons.show_chart, size: 100, color: Colors.white10)))),
            ],
          ),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, s) => Center(child: Text('Error: $e')),
      ),
    );
  }
}

class _StatBox extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  const _StatBox({required this.label, required this.value, required this.icon});
  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(color: const Color(0xFF1E1E1E), borderRadius: BorderRadius.circular(16)),
        child: Row(
          children: [
            Icon(icon, color: Colors.blue, size: 32),
            const SizedBox(width: 16),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(color: Colors.grey)),
                Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
              ],
            )
          ],
        ),
      ),
    );
  }
}

class _ChartCard extends StatelessWidget {
  final String title;
  final Widget child;
  const _ChartCard({required this.title, required this.child});
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: const Color(0xFF1E1E1E), borderRadius: BorderRadius.circular(16)),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        child,
      ]),
    );
  }
}

// Simple Placeholders for Charts
class _PieChartPlaceholder extends StatelessWidget {
  @override
  Widget build(BuildContext context) { return Container(height: 200, child: const Center(child: Icon(Icons.pie_chart_outline, size: 80, color: Colors.white10))); }
}
class _BarChartPlaceholder extends StatelessWidget {
  @override
  Widget build(BuildContext context) { return Container(height: 200, child: const Center(child: Icon(Icons.bar_chart, size: 80, color: Colors.white10))); }
}
