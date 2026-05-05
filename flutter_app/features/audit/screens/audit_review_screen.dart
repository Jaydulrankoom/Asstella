import 'package:flutter/material.dart';

class AuditReviewScreen extends StatelessWidget {
  final String campaignId;
  const AuditReviewScreen({Key? key, required this.campaignId}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Complete Audit')),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
             Text('Summary report before final submission'),
             ElevatedButton(onPressed: null, child: Text('Submit & Calculate Score'))
          ],
        ),
      ),
    );
  }
}
