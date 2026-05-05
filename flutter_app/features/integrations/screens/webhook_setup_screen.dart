import 'package:flutter/material.dart';

class WebhookSetupScreen extends StatelessWidget {
  const WebhookSetupScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Webhook Setup')),
      body: const Center(
        child: Text('Endpoint info, event subscribing, and secret key display'),
      ),
    );
  }
}
