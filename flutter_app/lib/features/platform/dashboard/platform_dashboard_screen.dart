import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:fl_chart/fl_chart.dart';
import 'dart:async';
import 'platform_dashboard_provider.dart';

class PlatformDashboardScreen extends ConsumerStatefulWidget {
  const PlatformDashboardScreen({super.key});

  @override
  ConsumerState<PlatformDashboardScreen> createState() => _PlatformDashboardScreenState();
}

class _PlatformDashboardScreenState extends ConsumerState<PlatformDashboardScreen> {
  Timer? _refreshTimer;

  @override
  void initState() {
    super.initState();
    // Auto-refresh every 60 seconds
    _refreshTimer = Timer.periodic(const Duration(seconds: 60), (timer) {
      ref.read(dashboardRefreshTriggerProvider.notifier).state++;
    });
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final kpisAsync = ref.watch(dashboardKpisProvider);

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: kpisAsync.when(
        data: (kpis) => _DashboardContent(kpis: kpis),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, color: Colors.red, size: 48),
              const SizedBox(height: 16),
              Text('Error: $err', style: const TextStyle(color: Colors.red)),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.refresh(dashboardKpisProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _DashboardContent extends StatelessWidget {
  final Map<String, dynamic> kpis;

  const _DashboardContent({required this.kpis});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Platform Dashboard',
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, fontFamily: 'Syne'),
              ),
              Row(
                children: [
                  const Text('Live Updates', style: TextStyle(color: Colors.green, fontSize: 12)),
                  const SizedBox(width: 8),
                  Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.green),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 24),
          
          // KPIs
          LayoutBuilder(
            builder: (context, constraints) {
              final crossAxisCount = constraints.maxWidth > 1200 ? 6 : (constraints.maxWidth > 800 ? 3 : 2);
              return GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: crossAxisCount,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                childAspectRatio: 1.4,
                children: [
                   _KpiCard(
                    title: 'Total Tenants',
                    value: kpis['tenants']['total'].toString(),
                    icon: Icons.business,
                    color: Colors.blue,
                  ),
                  _KpiCard(
                    title: 'Active Tenants',
                    value: kpis['tenants']['active'].toString(),
                    icon: Icons.check_circle,
                    color: Colors.green,
                  ),
                  _KpiCard(
                    title: 'MRR',
                    value: NumberFormat.currency(symbol: '$', decimalDigits: 0).format(kpis['revenue']['mrr']),
                    icon: Icons.trending_up,
                    color: Colors.cyan,
                  ),
                  _KpiCard(
                    title: 'ARR',
                    value: NumberFormat.currency(symbol: '$', decimalDigits: 0).format(kpis['revenue']['arr']),
                    icon: Icons.calendar_month,
                    color: Colors.amber,
                  ),
                  _KpiCard(
                    title: 'Open Tickets',
                    value: kpis['platform']['open_support_tickets'].toString(),
                    icon: Icons.confirmation_number,
                    color: Colors.purple,
                  ),
                  _KpiCard(
                    title: 'Uptime',
                    value: '${kpis['platform']['uptime_percent']}%',
                    icon: Icons.bolt,
                    color: Colors.orange,
                  ),
                ],
              );
            },
          ),

          const SizedBox(height: 32),
          
          // Charts
          const Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                flex: 3,
                child: _RevenueLineChart(),
              ),
              SizedBox(width: 24),
              Expanded(
                flex: 2,
                child: _TenantGrowthBarChart(),
              ),
            ],
          ),

          const SizedBox(height: 32),

          // Lower Section
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Expanded(
                flex: 2,
                child: _RecentActivityPanel(),
              ),
              const SizedBox(width: 24),
              Expanded(
                flex: 1,
                child: _SystemHealthPanel(kpis: kpis['platform']),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _KpiCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const _KpiCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
            child: Icon(icon, color: color, size: 20),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, letterSpacing: -1),
              ),
              const SizedBox(height: 4),
              Text(
                title,
                style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 12),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _RevenueLineChart extends ConsumerWidget {
  const _RevenueLineChart();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final revenueAsync = ref.watch(revenueGraphProvider);

    return Container(
      height: 400,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('MRR Growth (12 Months)', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 32),
          Expanded(
            child: revenueAsync.when(
              data: (data) {
                if (data.isEmpty) return const Center(child: Text('No data available'));
                return LineChart(
                  LineChartData(
                    gridData: const FlGridData(show: false),
                    titlesData: FlTitlesData(
                      leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                      topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                      rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                      bottomTitles: AxisTitles(
                        sideTitles: SideTitles(
                          showTitles: true,
                          getTitlesWidget: (value, meta) {
                            int idx = value.toInt();
                            if (idx >= 0 && idx < data.length && idx % 2 == 0) {
                              return Text(data[idx]['month'].split(' ')[0], style: const TextStyle(fontSize: 10, color: Colors.grey));
                            }
                            return const Text('');
                          },
                        ),
                      ),
                    ),
                    borderData: FlBorderData(show: false),
                    lineBarsData: [
                      LineChartBarData(
                        spots: data.indexed.map((e) => FlSpot(e.$1.toDouble(), e.$2['revenue'].toDouble())).toList(),
                        isCurved: true,
                        color: Colors.cyan,
                        barWidth: 4,
                        isStrokeCapRound: true,
                        dotData: const FlDotData(show: false),
                        belowBarData: BarAreaData(
                          show: true,
                          color: Colors.cyan.withOpacity(0.1),
                        ),
                      ),
                    ],
                  ),
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, st) => Center(child: Text('Chart Error: $err')),
            ),
          ),
        ],
      ),
    );
  }
}

class _TenantGrowthBarChart extends ConsumerWidget {
  const _TenantGrowthBarChart();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final growthAsync = ref.watch(tenantGrowthProvider);

    return Container(
      height: 400,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('New Tenants', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 32),
          Expanded(
            child: growthAsync.when(
              data: (data) {
                if (data.isEmpty) return const Center(child: Text('No data available'));
                return BarChart(
                  BarChartData(
                    gridData: const FlGridData(show: false),
                    titlesData: FlTitlesData(
                      leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                      topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                      rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                      bottomTitles: AxisTitles(
                        sideTitles: SideTitles(
                          showTitles: true,
                          getTitlesWidget: (value, meta) {
                            int idx = value.toInt();
                            if (idx >= 0 && idx < data.length) {
                              return Text(data[idx]['month'][0], style: const TextStyle(fontSize: 10, color: Colors.grey));
                            }
                            return const Text('');
                          },
                        ),
                      ),
                    ),
                    borderData: FlBorderData(show: false),
                    barGroups: data.indexed.map((e) => BarChartGroupData(
                      x: e.$1,
                      barRods: [BarChartRodData(toY: e.$2['new'].toDouble(), color: Colors.blue, width: 12, borderRadius: BorderRadius.circular(4))],
                    )).toList(),
                  ),
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, st) => Center(child: Text('Chart Error: $err')),
            ),
          ),
        ],
      ),
    );
  }
}

class _RecentActivityPanel extends ConsumerWidget {
  const _RecentActivityPanel();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final activityAsync = ref.watch(recentActivityProvider);

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Recent Platform Activity', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              TextButton(onPressed: () {}, child: const Text('View All')),
            ],
          ),
          const SizedBox(height: 16),
          activityAsync.when(
            data: (logs) {
              if (logs.isEmpty) {
                return const Padding(
                  padding: EdgeInsets.symmetric(vertical: 40),
                  child: Center(child: Text('No recent activity records', style: TextStyle(color: Colors.grey))),
                );
              }
              return ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: logs.length,
                separatorBuilder: (context, index) => Divider(color: Colors.white.withOpacity(0.03)),
                itemBuilder: (context, index) {
                  final log = logs[index];
                  return ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(color: Colors.blue.withOpacity(0.1), shape: BoxShape.circle),
                      child: const Icon(Icons.flash_on, size: 16, color: Colors.blue),
                    ),
                    title: Text(log['action'] ?? 'Unknown Action', style: const TextStyle(fontSize: 14)),
                    subtitle: Text('by ${log['performed_by'] ?? 'System'}', style: const TextStyle(fontSize: 12)),
                    trailing: Text(
                      log['created_at'] != null ? DateFormat.jm().format(DateTime.parse(log['created_at'])) : '--:--',
                      style: const TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                  );
                },
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (err, stack) => Text('Failed to load activity: $err'),
          ),
        ],
      ),
    );
  }
}

class _SystemHealthPanel extends StatelessWidget {
  final Map<String, dynamic> kpis;

  const _SystemHealthPanel({required this.kpis});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('System Health', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 24),
          _HealthRow(label: 'Platform Uptime', value: '${kpis['uptime_percent']}%', status: Colors.green),
          _HealthRow(label: 'API Errors (24h)', value: kpis['api_errors_24h'].toString(), status: kpis['api_errors_24h'] > 50 ? Colors.red : (kpis['api_errors_24h'] > 10 ? Colors.amber : Colors.green)),
          _HealthRow(label: 'Security Alerts', value: kpis['suspicious_logins_24h'].toString(), status: kpis['suspicious_logins_24h'] > 0 ? Colors.amber : Colors.green),
          _HealthRow(label: 'Instance Load', value: 'Low', status: Colors.green),
          _HealthRow(label: 'Database Latency', value: '45ms', status: Colors.green),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: Colors.white10, foregroundColor: Colors.white),
              onPressed: () {}, 
              child: const Text('Detailed Status Page'),
            ),
          ),
        ],
      ),
    );
  }
}

class _HealthRow extends StatelessWidget {
  final String label;
  final String value;
  final Color status;

  const _HealthRow({required this.label, required this.value, required this.status});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey, fontSize: 13)),
          Row(
            children: [
              Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              const SizedBox(width: 8),
              Container(width: 6, height: 6, decoration: BoxDecoration(shape: BoxShape.circle, color: status)),
            ],
          ),
        ],
      ),
    );
  }
}
