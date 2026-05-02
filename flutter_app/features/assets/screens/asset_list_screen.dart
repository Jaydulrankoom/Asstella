import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

/// Screen displaying the registry of assets with advanced filtering and search.
class AssetListScreen extends ConsumerStatefulWidget {
  const AssetListScreen({super.key});

  @override
  ConsumerState<AssetListScreen> createState() => _AssetListScreenState();
}

class _AssetListScreenState extends ConsumerState<AssetListScreen> {
  final TextEditingController _searchController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool _isSearchFocused = false;

  @override
  Widget build(BuildContext context) {
    final bool isDesktop = MediaQuery.of(context).size.width > 1024;
    
    return Scaffold(
      appBar: AppBar(
        title: _isSearchFocused 
          ? _buildSearchBar() 
          : const Text('Asset Registry', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          if (!_isSearchFocused)
            IconButton(
              icon: const Icon(LucideIcons.search),
              onPressed: () => setState(() => _isSearchFocused = true),
            ),
          IconButton(
            icon: const Icon(LucideIcons.qrCode),
            onPressed: _openScanner,
          ),
          IconButton(
            icon: const Icon(LucideIcons.slidersHorizontal),
            onPressed: _showFilterSheet,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async => ref.refresh(assetsProvider),
        child: isDesktop ? _buildDataTable() : _buildListView(),
      ),
      floatingActionButton: _canCreateAsset() ? FloatingActionButton.extended(
        onPressed: () => context.push('/assets/add'),
        label: const Text('Add Asset'),
        icon: const Icon(LucideIcons.plus),
      ) : null,
    );
  }

  Widget _buildSearchBar() {
    return TextField(
      controller: _searchController,
      autofocus: true,
      decoration: InputDecoration(
        hintText: 'Search code, name, or serial...',
        border: InputBorder.none,
        suffixIcon: IconButton(
          icon: const Icon(LucideIcons.x),
          onPressed: () => setState(() {
            _isSearchFocused = false;
            _searchController.clear();
          }),
        ),
      ),
      onChanged: (val) {
        // Debounced search logic would go here via Riverpod
      },
    );
  }

  Widget _buildListView() {
    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.all(12),
      itemCount: 20, // Example count
      itemBuilder: (context, index) => const AssetCard(),
    );
  }

  Widget _buildDataTable() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: DataTable(
        columns: const [
          DataColumn(label: Text('Code')),
          DataColumn(label: Text('Name')),
          DataColumn(label: Text('Category')),
          DataColumn(label: Text('Status')),
          DataColumn(label: Text('Action')),
        ],
        rows: List.generate(20, (index) => DataRow(cells: [
          DataCell(Text('AST-$index')),
          const DataCell(Text('MacBook Pro M2')),
          const DataCell(Text('IT')),
          const DataCell(Chip(label: Text('Active'))),
          DataCell(IconButton(icon: const Icon(LucideIcons.eye), onPressed: () {})),
        ])),
      ),
    );
  }

  void _openScanner() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => SizedBox(
        height: MediaQuery.of(context).size.height * 0.7,
        child: MobileScanner(
          onDetect: (capture) {
            final List<Barcode> barcodes = capture.barcodes;
            if (barcodes.isNotEmpty) {
              final code = barcodes.first.rawValue;
              context.pop();
              context.push('/assets/profile/$code');
            }
          },
        ),
      ),
    );
  }

  void _showFilterSheet() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) => const FilterSheet(),
    );
  }

  bool _canCreateAsset() => true; // Permission check logic
}

class AssetCard extends StatelessWidget {
  const AssetCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        title: const Text('Dell Latitude 5420', style: TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(color: Colors.blue.shade50, borderRadius: BorderRadius.circular(4)),
                  child: const Text('IT Equipment', style: TextStyle(fontSize: 10, color: Colors.blue)),
                ),
                const SizedBox(width: 8),
                const Text('AST-992831', style: TextStyle(fontSize: 12, color: Colors.grey)),
              ],
            ),
          ],
        ),
        trailing: const Chip(
          label: Text('Active', style: TextStyle(fontSize: 10, color: Colors.white)),
          backgroundColor: Colors.emerald,
        ),
        onTap: () => context.push('/assets/profile/AST-992831'),
      ),
    );
  }
}

class FilterSheet extends StatelessWidget {
  const FilterSheet({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Filters', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 20),
          const Text('Category', style: TextStyle(fontWeight: FontWeight.w600)),
          Wrap(
            spacing: 8,
            children: ['IT', 'Office', 'Furniture', 'Vehicles'].map((e) => FilterChip(label: Text(e), onSelected: (val) {})).toList(),
          ),
          const SizedBox(height: 40),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Apply Filters'),
            ),
          ),
        ],
      ),
    );
  }
}

final assetsProvider = FutureProvider((ref) => []); // Mock provider
