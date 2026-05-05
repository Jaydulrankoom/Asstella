import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:async';
import '../../../core/providers/api_provider.dart';

final dashboardRefreshTriggerProvider = StateProvider<int>((ref) => 0);

final dashboardKpisProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  ref.watch(dashboardRefreshTriggerProvider);
  final api = ref.watch(apiServiceProvider);
  final response = await api.get('/platform/dashboard/kpis');
  return response.data['data'];
});

final revenueGraphProvider = FutureProvider<List<dynamic>>((ref) async {
  ref.watch(dashboardRefreshTriggerProvider);
  final api = ref.watch(apiServiceProvider);
  final response = await api.get('/platform/dashboard/revenue-graph');
  return response.data['data'];
});

final tenantGrowthProvider = FutureProvider<List<dynamic>>((ref) async {
  ref.watch(dashboardRefreshTriggerProvider);
  final api = ref.watch(apiServiceProvider);
  final response = await api.get('/platform/dashboard/tenant-growth');
  return response.data['data'];
});

final recentActivityProvider = FutureProvider<List<dynamic>>((ref) async {
  ref.watch(dashboardRefreshTriggerProvider);
  final api = ref.watch(apiServiceProvider);
  final response = await api.get('/platform/dashboard/recent-activity');
  return response.data['data'];
});
