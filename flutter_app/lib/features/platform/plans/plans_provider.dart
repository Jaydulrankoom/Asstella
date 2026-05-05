import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/api_provider.dart';

final plansProvider = FutureProvider<List<dynamic>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.get('/platform/plans');
  return response.data['data'] as List<dynamic>;
});

class PlanNotifier extends StateNotifier<AsyncValue<void>> {
  final Ref ref;
  PlanNotifier(this.ref) : super(const AsyncValue.data(null));

  Future<void> createPlan(Map<String, dynamic> data) async {
    state = const AsyncValue.loading();
    try {
      final api = ref.read(apiServiceProvider);
      await api.post('/platform/plans', data: data);
      state = const AsyncValue.data(null);
      ref.invalidate(plansProvider);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> updatePlan(String id, Map<String, dynamic> data) async {
    state = const AsyncValue.loading();
    try {
      final api = ref.read(apiServiceProvider);
      await api.put('/platform/plans/$id', data: data);
      state = const AsyncValue.data(null);
      ref.invalidate(plansProvider);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> togglePlan(String id) async {
    state = const AsyncValue.loading();
    try {
      final api = ref.read(apiServiceProvider);
      await api.patch('/platform/plans/$id/toggle');
      state = const AsyncValue.data(null);
      ref.invalidate(plansProvider);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

final planOpsProvider = StateNotifierProvider<PlanNotifier, AsyncValue<void>>((ref) {
  return PlanNotifier(ref);
});
