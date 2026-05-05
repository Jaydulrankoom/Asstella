import { flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/api_provider.dart';

final gpsProvidersProvider = FutureProvider<List<dynamic>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.get('/platform/integrations/gps-providers');
  return response.data['data'] as List<dynamic>;
});

final apiKeysProvider = FutureProvider<List<dynamic>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.get('/platform/integrations/api-keys');
  return response.data['data'] as List<dynamic>;
});

final webhooksProvider = FutureProvider<List<dynamic>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.get('/platform/integrations/webhooks');
  return response.data['data'] as List<dynamic>;
});

class IntegrationNotifier extends StateNotifier<AsyncValue<void>> {
  final Ref ref;
  IntegrationNotifier(this.ref) : super(const AsyncValue.data(null));

  Future<void> addGpsProvider(Map<String, dynamic> data) async {
    state = const AsyncValue.loading();
    try {
      final api = ref.read(apiServiceProvider);
      await api.post('/platform/integrations/gps-providers', data: data);
      state = const AsyncValue.data(null);
      ref.invalidate(gpsProvidersProvider);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<Map<String, dynamic>?> generateApiKey(String tenantId, String name) async {
    state = const AsyncValue.loading();
    try {
      final api = ref.read(apiServiceProvider);
      final response = await api.post('/platform/integrations/api-keys/generate', data: {'tenant_id': tenantId, 'name': name});
      state = const AsyncValue.data(null);
      ref.invalidate(apiKeysProvider);
      return response.data['data'];
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return null;
    }
  }

  Future<void> toggleWebhook(String id) async {
    try {
       final api = ref.read(apiServiceProvider);
       await api.patch('/platform/integrations/webhooks/$id/toggle');
       ref.invalidate(webhooksProvider);
    } catch (e) {}
  }
}

final integrationOpsProvider = StateNotifierProvider<IntegrationNotifier, AsyncValue<void>>((ref) {
  return IntegrationNotifier(ref);
});
