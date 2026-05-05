import { flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/api_provider.dart';

final platformUsersProvider = FutureProvider<List<dynamic>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.get('/platform/users');
  return response.data['data'] as List<dynamic>;
});

final platformSecurityLogsProvider = FutureProvider.family<Map<String, dynamic>, Map<String, dynamic>>((ref, params) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.get('/platform/security/logs', queryParameters: params);
  return response.data['data'];
});

final platformAnalyticsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.get('/platform/analytics/growth');
  return response.data['data'];
});

final platformSupportTicketsProvider = FutureProvider.family<List<dynamic>, Map<String, dynamic>>((ref, params) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.get('/platform/support/tickets', queryParameters: params);
  return response.data['data'] as List<dynamic>;
});

final platformSettingsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.get('/platform/settings');
  return response.data['data'];
});
