import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/api_provider.dart';

final tenantsProvider = FutureProvider.family<Map<String, dynamic>, Map<String, dynamic>>((ref, params) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.get('/platform/tenants', queryParameters: params);
  return response.data['data'];
});

final tenantDetailProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, id) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.get('/platform/tenants/$id');
  return response.data['data'];
});

class TenantNotifier extends StateNotifier<AsyncValue<void>> {
  final Ref ref;
  TenantNotifier(this.ref) : super(const AsyncValue.data(null));

  Future<void> createTenant(Map<String, dynamic> data) async {
    state = const AsyncValue.loading();
    try {
      final api = ref.read(apiServiceProvider);
      await api.post('/platform/tenants', data: data);
      state = const AsyncValue.data(null);
      ref.invalidate(tenantsProvider);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> updateStatus(String id, String status) async {
    state = const AsyncValue.loading();
    try {
      final api = ref.read(apiServiceProvider);
      await api.patch('/platform/tenants/$id/status', data: {'status': status, 'reason': 'Manual update'});
      state = const AsyncValue.data(null);
      ref.invalidate(tenantsProvider);
      ref.invalidate(tenantDetailProvider(id));
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> changePlan(String id, String planId) async {
    state = const AsyncValue.loading();
    try {
      final api = ref.read(apiServiceProvider);
      await api.patch('/platform/tenants/$id/plan', data: {'new_plan_id': planId});
      state = const AsyncValue.data(null);
      ref.invalidate(tenantsProvider);
      ref.invalidate(tenantDetailProvider(id));
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> resendCredentials(String id) async {
    state = const AsyncValue.loading();
    try {
      final api = ref.read(apiServiceProvider);
      await api.post('/platform/tenants/$id/send-credentials');
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> onboardTenant(String id) async {
    state = const AsyncValue.loading();
    try {
      final api = ref.read(apiServiceProvider);
      await api.post('/platform/tenants/$id/onboard');
      state = const AsyncValue.data(null);
      ref.invalidate(tenantDetailProvider(id));
      ref.invalidate(tenantsProvider);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> updateWhiteLabel(String id, Map<String, dynamic> data) async {
    state = const AsyncValue.loading();
    try {
      final api = ref.read(apiServiceProvider);
      await api.patch('/platform/tenants/$id/white-label', data: data);
      state = const AsyncValue.data(null);
      ref.invalidate(tenantDetailProvider(id));
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

final tenantOpsProvider = StateNotifierProvider<TenantNotifier, AsyncValue<void>>((ref) {
  return TenantNotifier(ref);
});
