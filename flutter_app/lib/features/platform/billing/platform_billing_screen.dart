import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'billing_provider.dart';

class PlatformBillingScreen extends ConsumerStatefulWidget {
  const PlatformBillingScreen({super.key});

  @override
  ConsumerState<PlatformBillingScreen> createState() => _PlatformBillingScreenState();
}

class _PlatformBillingScreenState extends ConsumerState<PlatformBillingScreen> {
  String? _statusFilter;

  @override
  Widget build(BuildContext context) {
    final summaryAsync = ref.watch(billingSummaryProvider);
    final invoicesAsync = ref.watch(invoicesProvider({
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
                  'Billing & Invoices',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, fontFamily: 'Syne'),
                ),
                ElevatedButton.icon(
                  onPressed: () {}, // Create Manual Invoice
                  icon: const Icon(Icons.add),
                  label: const Text('Create Manual Invoice'),
                ),
              ],
            ),
            const SizedBox(height: 24),
            summaryAsync.when(
              data: (summary) => _SummaryRow(summary: summary),
              loading: () => const LinearProgressIndicator(),
              error: (err, st) => Container(),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                _StatusChip(label: 'All', isSelected: _statusFilter == null, onSelected: (s) => setState(() => _statusFilter = null)),
                const SizedBox(width: 8),
                _StatusChip(label: 'Sent', isSelected: _statusFilter == 'sent', onSelected: (s) => setState(() => _statusFilter = 'sent')),
                const SizedBox(width: 8),
                _StatusChip(label: 'Paid', isSelected: _statusFilter == 'paid', onSelected: (s) => setState(() => _statusFilter = 'paid')),
                const SizedBox(width: 8),
                _StatusChip(label: 'Overdue', isSelected: _statusFilter == 'overdue', onSelected: (s) => setState(() => _statusFilter = 'overdue')),
              ],
            ),
            const SizedBox(height: 24),
            Expanded(
              child: invoicesAsync.when(
                data: (data) => _InvoiceTable(invoices: data['invoices']),
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (err, st) => Center(child: Text('Error: $err')),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final ValueChanged<bool> onSelected;

  const _StatusChip({required this.label, required this.isSelected, required this.onSelected});

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

class _SummaryRow extends StatelessWidget {
  final Map<String, dynamic> summary;
  const _SummaryRow({required this.summary});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _summaryCard('Collected (Month)', '\$${summary['total_collected_month']}', Colors.green),
        const SizedBox(width: 24),
        _summaryCard('Overdue Total', '\$${summary['overdue_total']}', Colors.red),
        const SizedBox(width: 24),
        _summaryCard('Expected (30d)', '\$${summary['expected_next_30_days']}', Colors.blue),
      ],
    );
  }

  Widget _summaryCard(String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: const Color(0xFF1E1E1E),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withOpacity(0.2)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(color: Colors.grey, fontSize: 13)),
            const SizedBox(height: 8),
            Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color)),
          ],
        ),
      ),
    );
  }
}

class _InvoiceTable extends ConsumerWidget {
  final List<dynamic> invoices;
  const _InvoiceTable({required this.invoices});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (invoices.isEmpty) return const Center(child: Text('No invoices found', style: TextStyle(color: Colors.grey)));

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(16),
      ),
      child: SingleChildScrollView(
        child: DataTable(
          columns: const [
            DataColumn(label: Text('Invoice No')),
            DataColumn(label: Text('Tenant')),
            DataColumn(label: Text('Amount')),
            DataColumn(label: Text('Status')),
            DataColumn(label: Text('Due Date')),
            DataColumn(label: Text('Actions')),
          ],
          rows: invoices.map((inv) {
            return DataRow(cells: [
              DataCell(Text(inv['invoice_no'])),
              DataCell(Text(inv['tenant_name'])),
              DataCell(Text('\$${inv['amount_usd']}')),
              DataCell(_statusBadge(inv['status'])),
              DataCell(Text(_formatDate(inv['due_date']))),
              DataCell(
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (inv['status'] != 'paid')
                      TextButton(
                        onPressed: () => _showMarkPaidDialog(context, ref, inv['id']),
                        child: const Text('Mark Paid'),
                      ),
                    IconButton(icon: const Icon(Icons.download_rounded, size: 18), onPressed: () {}),
                  ],
                ),
              ),
            ]);
          }).toList(),
        ),
      ),
    );
  }

  Widget _statusBadge(String status) {
    Color color = Colors.grey;
    if (status == 'paid') color = Colors.green;
    if (status == 'sent') color = Colors.blue;
    if (status == 'overdue') color = Colors.red;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold),
      ),
    );
  }

  String _formatDate(dynamic timestamp) {
    if (timestamp == null) return 'N/A';
    try {
      // Firebase timestamp map format usually has _seconds
      final seconds = timestamp['_seconds'] as int?;
      if (seconds != null) {
        return DateFormat('MMM dd, yyyy').format(DateTime.fromMillisecondsSinceEpoch(seconds * 1000));
      }
    } catch (e) {}
    return 'N/A';
  }

  void _showMarkPaidDialog(BuildContext context, WidgetRef ref, String id) {
    // Implementation of mark paid dialog
  }
}
