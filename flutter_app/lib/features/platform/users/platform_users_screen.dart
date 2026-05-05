import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core_providers.dart';

class PlatformUsersScreen extends ConsumerWidget {
  const PlatformUsersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final usersAsync = ref.watch(platformUsersProvider);

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
                const Text('Platform Administrators', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, fontFamily: 'Syne')),
                ElevatedButton.icon(onPressed: () {}, icon: const Icon(Icons.person_add), label: const Text('Invite Admin')),
              ],
            ),
            const SizedBox(height: 24),
            Expanded(
              child: usersAsync.when(
                data: (users) => Container(
                  decoration: BoxDecoration(color: const Color(0xFF1E1E1E), borderRadius: BorderRadius.circular(16)),
                  child: SingleChildScrollView(
                    child: DataTable(
                      columns: const [
                        DataColumn(label: Text('Name')),
                        DataColumn(label: Text('Role')),
                        DataColumn(label: Text('Status')),
                        DataColumn(label: Text('Last Login')),
                        DataColumn(label: Text('Actions')),
                      ],
                      rows: users.map((u) => DataRow(cells: [
                        DataCell(Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(u['name'], style: const TextStyle(fontWeight: FontWeight.bold)),
                            Text(u['email'], style: const TextStyle(fontSize: 12, color: Colors.grey)),
                          ],
                        )),
                        DataCell(_RoleBadge(role: u['role'])),
                        DataCell(_StatusBadge(status: u['status'])),
                        DataCell(Text(u['last_login_at'] ?? 'Never')),
                        DataCell(IconButton(icon: const Icon(Icons.more_vert), onPressed: () {})),
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

class _RoleBadge extends StatelessWidget {
  final String role;
  const _RoleBadge({required this.role});
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: Colors.blue.withOpacity(0.1), borderRadius: BorderRadius.circular(4)),
      child: Text(role.replaceAll('_', ' ').toUpperCase(), style: const TextStyle(color: Colors.blue, fontSize: 10, fontWeight: FontWeight.bold)),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final String status;
  const _StatusBadge({required this.status});
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(width: 8, height: 8, decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.green)),
        const SizedBox(width: 8),
        Text(status.toUpperCase(), style: const TextStyle(fontSize: 12)),
      ],
    );
  }
}
