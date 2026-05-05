import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'tenants_provider.dart';

class CreateTenantDialog extends ConsumerStatefulWidget {
  const CreateTenantDialog({super.key});

  @override
  ConsumerState<CreateTenantDialog> createState() => _CreateTenantDialogState();
}

class _CreateTenantDialogState extends ConsumerState<CreateTenantDialog> {
  final _formKey = GlobalKey<FormState>();
  int _currentStep = 0;

  final _nameController = TextEditingController();
  final _slugController = TextEditingController();
  String _businessType = 'corporate';
  final _contactNameController = TextEditingController();
  final _contactEmailController = TextEditingController();
  String _planId = 'professional';
  int _trialDays = 14;

  void _onNameChanged(String val) {
    if (_slugController.text.isEmpty || _slugController.text == _nameController.text.toLowerCase().replaceAll(' ', '-')) {
      _slugController.text = val.toLowerCase().replaceAll(' ', '-').replaceAll(RegExp(r'[^a-z0-9-]'), '');
    }
  }

  Future<void> _submit() async {
    final data = {
      'name': _nameController.text,
      'slug': _slugController.text,
      'business_type': _businessType,
      'contact_name': _contactNameController.text,
      'contact_email': _contactEmailController.text,
      'plan_id': _planId,
      'trial_days': _trialDays,
    };

    await ref.read(tenantOpsProvider.notifier).createTenant(data);
    if (mounted) {
      final state = ref.read(tenantOpsProvider);
      if (!state.hasError) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Tenant created! Login credentials sent.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final opsState = ref.watch(tenantOpsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('New Tenant Onboarding'),
        leading: IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
      ),
      body: Stepper(
        type: StepperType.horizontal,
        currentStep: _currentStep,
        onStepContinue: () {
          if (_currentStep < 2) {
            setState(() => _currentStep++);
          } else {
            _submit();
          }
        },
        onStepCancel: () => _currentStep > 0 ? setState(() => _currentStep--) : Navigator.pop(context),
        steps: [
          Step(
            title: const Text('Company'),
            isActive: _currentStep >= 0,
            content: Column(
              children: [
                TextFormField(
                  controller: _nameController,
                  decoration: const InputDecoration(labelText: 'Company Name'),
                  onChanged: _onNameChanged,
                ),
                TextFormField(
                  controller: _slugController,
                  decoration: const InputDecoration(labelText: 'Unique Slug / Branch Code'),
                ),
                DropdownButtonFormField<String>(
                  value: _businessType,
                  decoration: const InputDecoration(labelText: 'Business Type'),
                  items: ['university', 'hospital', 'factory', 'ngo', 'corporate']
                      .map((t) => DropdownMenuItem(value: t, child: Text(t.toUpperCase())))
                      .toList(),
                  onChanged: (val) => setState(() => _businessType = val!),
                ),
              ],
            ),
          ),
          Step(
            title: const Text('Contact'),
            isActive: _currentStep >= 1,
            content: Column(
              children: [
                TextFormField(
                  controller: _contactNameController,
                  decoration: const InputDecoration(labelText: 'Primary Contact Name'),
                ),
                TextFormField(
                  controller: _contactEmailController,
                  decoration: const InputDecoration(labelText: 'Admin Email (System Login)'),
                  keyboardType: TextInputType.emailAddress,
                ),
              ],
            ),
          ),
          Step(
            title: const Text('Plan'),
            isActive: _currentStep >= 2,
            content: Column(
              children: [
                DropdownButtonFormField<String>(
                  value: _planId,
                  decoration: const InputDecoration(labelText: 'Subscription Plan'),
                  items: ['starter', 'professional', 'enterprise']
                      .map((p) => DropdownMenuItem(value: p, child: Text(p.toUpperCase())))
                      .toList(),
                  onChanged: (val) => setState(() => _planId = val!),
                ),
                Slider(
                  value: _trialDays.toDouble(),
                  min: 0,
                  max: 30,
                  divisions: 30,
                  label: '$_trialDays Days Trial',
                  onChanged: (val) => setState(() => _trialDays = val.toInt()),
                ),
                Text('Trial Period: $_trialDays days', style: const TextStyle(color: Colors.grey)),
              ],
            ),
          ),
        ],
        controlsBuilder: (context, details) {
          return Padding(
            padding: const EdgeInsets.only(top: 24.0),
            child: Row(
              children: [
                if (opsState.isLoading)
                  const CircularProgressIndicator()
                else ...[
                  ElevatedButton(
                    onPressed: details.onStepContinue,
                    child: Text(_currentStep == 2 ? 'Create Tenant' : 'Continue'),
                  ),
                  const SizedBox(width: 12),
                  TextButton(onPressed: details.onStepCancel, child: const Text('Back')),
                ],
              ],
            ),
          );
        },
      ),
    );
  }
}
