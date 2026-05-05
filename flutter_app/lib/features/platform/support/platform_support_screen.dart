import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core_providers.dart';

class PlatformSupportScreen extends ConsumerWidget {
  const PlatformSupportScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ticketsAsync = ref.watch(platformSupportTicketsProvider({}));

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Support Helpdesk', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, fontFamily: 'Syne')),
            const SizedBox(height: 24),
            Expanded(
              child: ticketsAsync.when(
                data: (tickets) => Row(
                  children: [
                    // List Panel
                    Expanded(
                      flex: 1,
                      child: Container(
                        decoration: BoxDecoration(color: const Color(0xFF1E1E1E), borderRadius: BorderRadius.circular(16)),
                        child: ListView.builder(
                          itemCount: tickets.length,
                          itemBuilder: (context, i) {
                            final t = tickets[i];
                            return ListTile(
                              leading: _PriorityDot(priority: t['priority']),
                              title: Text(t['subject'], maxLines: 1, overflow: TextOverflow.ellipsis),
                              subtitle: Text(t['tenant_name'], style: const TextStyle(fontSize: 12)),
                              trailing: _StatusBadge(status: t['status']),
                            );
                          },
                        ),
                      ),
                    ),
                    const SizedBox(width: 24),
                    // Detail Panel
                    Expanded(
                      flex: 2,
                      child: Container(
                        padding: const EdgeInsets.all(32),
                        decoration: BoxDecoration(color: const Color(0xFF1E1E1E), borderRadius: BorderRadius.circular(16)),
                        child: const Center(child: Text('Select a ticket to view conversation', style: TextStyle(color: Colors.grey))),
                      ),
                    ),
                  ],
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

class _PriorityDot extends StatelessWidget {
  final String priority;
  const _PriorityDot({required this.priority});
  @override
  Widget build(BuildContext context) {
    Color color = Colors.green;
    if (priority == 'high') color = Colors.orange;
    if (priority == 'critical') color = Colors.red;
    return Container(width: 12, height: 12, decoration: BoxDecoration(shape: BoxShape.circle, color: color));
  }
}

class _StatusBadge extends StatelessWidget {
  final String status;
  const _StatusBadge({required this.status});
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(border: Border.all(color: Colors.white24), borderRadius: BorderRadius.circular(4)),
      child: Text(status.toUpperCase(), style: const TextStyle(fontSize: 10, color: Colors.grey)),
    );
  }
}
