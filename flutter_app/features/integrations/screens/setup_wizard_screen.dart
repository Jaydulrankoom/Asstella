import 'package:flutter/material.dart';

class SetupWizardScreen extends StatelessWidget {
  const SetupWizardScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Setup Integration Wizard')),
      body: const Center(
        child: Text('Step 1: Select Type\nStep 2: Enter Credentials\nStep 3: Test Connection\nStep 4: Field Mapping'),
      ),
    );
  }
}
