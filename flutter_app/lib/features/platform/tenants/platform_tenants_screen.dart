import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'tenants_provider.dart';
import 'create_tenant_dialog.dart';
import 'tenant_detail_screen.dart';

class PlatformTenantsScreen extends ConsumerStatefulWidget {
  const PlatformTenantsScreen({super.key});

  @override
  ConsumerState<PlatformTenantsScreen> createState() => _PlatformTenantsScreenState();
}

class _PlatformTenantsScreenState extends ConsumerState<PlatformTenantsScreen> {
  String _search = '';
  String? _statusFilter;

  @override
  Widget build(BuildContext context) {
    final tenantsAsync = ref.watch(tenantsProvider({
      'search': _search,
      if (_statusFilter != null) 'status': _statusFilter,
    }));

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
                  'Tenant Management',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, fontFamily: 'Syne'),
                ),
                ElevatedButton.icon(
                  onPressed: () => showDialog(
                    context: context,
                    builder: (context) => const CreateTenantDialog(),
                  ),
                  icon: const Icon(Icons.add),
                  label: const Text('Add Tenant'),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    decoration: InputDecoration(
                      hintText: 'Search by name, slug, or email...',
                      prefixIcon: const Icon(Icons.search),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      filled: true,
                      fillColor: const Color(0xFF1E1E1E),
                    ),
                    onChanged: (val) => setState(() => _search = val),
                  ),
                ),
                const SizedBox(width: 16),
                _FilterChip(
                  label: 'All',
                  isSelected: _statusFilter == null,
                  onSelected: (s) => setState(() => _statusFilter = null),
                ),
                const SizedBox(width: 8),
                _FilterChip(
                  label: 'Trial',
                  isSelected: _statusFilter == 'trial',
                  onSelected: (s) => setState(() => _statusFilter = 'trial'),
                ),
                const SizedBox(width: 8),
                _FilterChip(
                  label: 'Active',
                  isSelected: _statusFilter == 'active',
                  onSelected: (s) => setState(() => _statusFilter = 'active'),
                ),
                const SizedBox(width: 8),
                _FilterChip(
                  label: 'Suspended',
                  isSelected: _statusFilter == 'suspended',
                  onSelected: (s) => setState(() => _statusFilter = 'suspended'),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Expanded(
              child: tenantsAsync.when(
                data: (data) => _TenantTable(tenants: data['tenants']),
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (err, stack) => Center(child: Text('Error: $err')),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final ValueChanged<bool> onSelected;

  const _FilterChip({required this.label, required this.isSelected, required this.onSelected});

  @override
  Widget build(BuildContext context) {
    return FilterChip(
      label: Text(label),
      selected: isSelected,
      onSelected: onSelected,
      selectedColor: Colors.blue.withOpacity(0.2),
      checkmarkColor: Colors.blue,
    );
  }
}

class _TenantTable extends StatelessWidget {
  final List<dynamic> tenants;

  const _TenantTable({required this.tenants});

  @override
  Widget build(BuildContext context) {
    if (tenants.isEmpty) {
      return const Center(child: Text('No tenants found', style: TextStyle(color: Colors.grey)));
    }

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(16),
      ),
      child: SingleChildScrollView(
        child: DataTable(
          showCheckboxColumn: false,
          columns: const [
            DataColumn(label: Text('Company')),
            DataColumn(label: Text('Type')),
            DataColumn(label: Text('Plan')),
            DataColumn(label: Text('Status')),
            DataColumn(label: Text('Assets')),
            DataColumn(label: Text('Actions')),
          ],
          rows: tenants.map((t) {
            return DataRow(
              onSelectChanged: (_) => Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => TenantDetailScreen(tenantId: t['id'])),
              ),
              cells: [
                DataCell(
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(t['name'], style: const TextStyle(fontWeight: FontWeight.bold)),
                      Text(t['slug'], style: TextStyle(fontSize: 12, color: Colors.grey)),
                    ],
                  ),
                ),
                DataCell(Text(t['business_type'] ?? 'N/A')),
                DataCell(Text(t['plan_id'] ?? 'Starter')),
                DataCell(_StatusBadge(status: t['status'])),
                DataCell(Text('${t['current_usage']?['asset_count'] ?? 0} / ${t['limits']?['max_assets'] ?? 100}')),
                DataCell(const Icon(Icons.chevron_right, color: Colors.grey)),
              ],
            );
          }).toList(),
        ),
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final String status;
  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    Color color;
    switch (status) {
      case 'active': color = Colors.green; break;
      case 'trial': color = Colors.blue; break;
      case 'suspended': color = Colors.red; break;
      default: color = Colors.grey;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: color.withOpacity(0.5)),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold),
      ),
    );
  }
}
