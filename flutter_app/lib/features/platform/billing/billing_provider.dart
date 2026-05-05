import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/api_provider.dart';

final invoicesProvider = FutureProvider.family<Map<String, dynamic>, Map<String, dynamic>>((ref, params) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.get('/platform/billing/invoices', queryParameters: params);
  return response.data['data'];
});

final billingSummaryProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.get('/platform/billing/summary');
  return response.data['data'];
});

class BillingNotifier extends StateNotifier<AsyncValue<void>> {
  final Ref ref;
  BillingNotifier(this.ref) : super(const AsyncValue.data(null));

  Future<void> createInvoice(Map<String, dynamic> data) async {
    state = const AsyncValue.loading();
    try {
      final api = ref.read(apiServiceProvider);
      await api.post('/platform/billing/invoices', data: data);
      state = const AsyncValue.data(null);
      ref.invalidate(invoicesProvider);
      ref.invalidate(billingSummaryProvider);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> updateInvoiceStatus(String id, Map<String, dynamic> data) async {
    state = const AsyncValue.loading();
    try {
      final api = ref.read(apiServiceProvider);
      await api.patch('/platform/billing/invoices/$id/status', data: data);
      state = const AsyncValue.data(null);
      ref.invalidate(invoicesProvider);
      ref.invalidate(billingSummaryProvider);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

final billingOpsProvider = StateNotifierProvider<BillingNotifier, AsyncValue<void>>((ref) {
  return BillingNotifier(ref);
});
