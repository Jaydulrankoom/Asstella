import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';

class AssetProfileScreen extends StatelessWidget {
  final String assetCode;

  const AssetProfileScreen({super.key, required this.assetCode});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 6,
      child: Scaffold(
        appBar: AppBar(
          title: Text(assetCode, style: const TextStyle(fontWeight: FontWeight.bold)),
          actions: [
            IconButton(icon: const Icon(LucideIcons.edit3), onPressed: () {}),
            IconButton(icon: const Icon(LucideIcons.moreVertical), onPressed: () {}),
          ],
        ),
        body: Column(
          children: [
            _buildHeader(),
            const TabBar(
              isScrollable: true,
              tabs: [
                Tab(text: 'Details'),
                Tab(text: 'Assignments'),
                Tab(text: 'Transfers'),
                Tab(text: 'Maintenance'),
                Tab(text: 'Audit'),
                Tab(text: 'Financial'),
              ],
            ),
            const Expanded(
              child: TabBarView(
                children: [
                  _DetailsTab(),
                  Center(child: Text('Assignments List')),
                  Center(child: Text('Transfer History')),
                  Center(child: Text('Maintenance Logs')),
                  Center(child: Text('Audit History')),
                  Center(child: Text('Depreciation Schedule')),
                ],
              ),
            ),
          ],
        ),
        bottomNavigationBar: _buildActionTray(),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(24),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: BorderRadius.circular(20),
              image: const DecorationImage(
                image: NetworkImage('https://via.placeholder.com/150'),
                fit: BoxFit.cover,
              ),
            ),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('MacBook Pro M2 - Space Gray', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                const Text('Serial: LCV991X92S', style: TextStyle(color: Colors.grey, fontSize: 13)),
                const SizedBox(height: 12),
                Row(
                  children: [
                    _buildBadge('In Use', Colors.emerald),
                    const SizedBox(width: 8),
                    _buildBadge('Good', Colors.blue),
                  ],
                ),
              ],
            ),
          ),
          Image.network(
            'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=AST-99123',
            width: 60,
            height: 60,
          ),
        ],
      ),
    );
  }

  Widget _buildBadge(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
      child: Text(label, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.bold)),
    );
  }

  Widget _buildActionTray() {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Expanded(
              child: ElevatedButton.icon(
                onPressed: () {},
                icon: const Icon(LucideIcons.userPlus),
                label: const Text('Assign'),
                style: ElevatedButton.styleFrom(backgroundColor: Colors.blue, foregroundColor: Colors.white),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () {},
                icon: const Icon(LucideIcons.wrench),
                label: const Text('Maintenance'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DetailsTab extends StatelessWidget {
  const _DetailsTab();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(24),
      children: const [
        _DetailRow(label: 'Category', value: 'IT Hardware'),
        _DetailRow(label: 'Branch', value: 'HQ - Silicon Valley'),
        _DetailRow(label: 'Department', value: 'Product Management'),
        _DetailRow(label: 'Location', value: 'Floor 4, Desk 12'),
        _DetailRow(label: 'Vendor', value: 'Apple Enterprise'),
        _DetailRow(label: 'Purchase Date', value: 'Jan 12, 2024'),
        _DetailRow(label: 'Purchase Price', value: '$2,499.00'),
        _DetailRow(label: 'Warranty Expiry', value: 'Jan 12, 2026'),
      ],
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;

  const _DetailRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12)),
          const SizedBox(height: 4),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 15)),
        ],
      ),
    );
  }
}
