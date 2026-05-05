import 'package:flutter/material.dart';

class ExecutiveDashboardScreen extends StatefulWidget {
  const ExecutiveDashboardScreen({Key? key}) : super(key: key);

  @override
  _ExecutiveDashboardScreenState createState() => _ExecutiveDashboardScreenState();
}

class _ExecutiveDashboardScreenState extends State<ExecutiveDashboardScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Executive Dashboard')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Financial KPIs', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            // Mock KPI cards
            Row(
              children: [
                _buildKpiCard('Total Asset Value', '\$450,000'),
                const SizedBox(width: 8),
                _buildKpiCard('Current Book Value', '\$380,000'),
              ],
            ),
            const SizedBox(height: 16),
            const Text('Asset Category Distribution', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Container(height: 200, color: Colors.grey[200], child: const Center(child: Text('Pie Chart Placeholder'))),
            const SizedBox(height: 16),
            const Text('Asset Value Trend', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Container(height: 200, color: Colors.grey[200], child: const Center(child: Text('Line Chart Placeholder'))),
            const SizedBox(height: 16),
            const Text('GPS Live Panel', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Container(height: 100, color: Colors.blue[100], child: const Center(child: Text('12 Vehicles Online'))),
          ],
        ),
      ),
    );
  }

  Widget _buildKpiCard(String title, String value) {
    return Expanded(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontSize: 14, color: Colors.grey)),
              const SizedBox(height: 8),
              Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            ],
          ),
        ),
      ),
    );
  }
}
