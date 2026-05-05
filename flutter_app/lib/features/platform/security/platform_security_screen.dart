import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core_providers.dart';

class PlatformSecurityScreen extends ConsumerWidget {
  const PlatformSecurityScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final logsAsync = ref.watch(platformSecurityLogsProvider({}));

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Security & Audit Logs', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, fontFamily: 'Syne')),
            const SizedBox(height: 24),
            Expanded(
              child: logsAsync.when(
                data: (data) => Container(
                  decoration: BoxDecoration(color: const Color(0xFF1E1E1E), borderRadius: BorderRadius.circular(16)),
                  child: SingleChildScrollView(
                    child: DataTable(
                      columns: const [
                        DataColumn(label: Text('Event')),
                        DataColumn(label: Text('Entity')),
                        DataColumn(label: Text('IP Address')),
                        DataColumn(label: Text('Risk')),
                        DataColumn(label: Text('Timestamp')),
                      ],
                      rows: (data['logs'] as List).map((l) => DataRow(cells: [
                        DataCell(Text(l['event_type'].toString().replaceAll('_', ' ').toUpperCase(), style: const TextStyle(fontSize: 12))),
                        DataCell(Text(l['tenant_id'] ?? 'Platform')),
                        DataCell(Text(l['ip_address'] ?? '0.0.0.0')),
                        DataCell(_RiskBadge(score: l['risk_score'] ?? 0)),
                        DataCell(const Text('Just now', style: TextStyle(fontSize: 12, color: Colors.grey))),
                      ])).toList(),
                    ),
                  ),
                ),
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (e, s) => Center(child: Text('Error: $e')),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RiskBadge extends StatelessWidget {
  final int score;
  const _RiskBadge({required this.score});
  @override
  Widget build(BuildContext context) {
    Color color = Colors.green;
    if (score > 70) color = Colors.red;
    else if (score > 30) color = Colors.amber;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(4)),
      child: Text(score.toString(), style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 12)),
    );
  }
}
