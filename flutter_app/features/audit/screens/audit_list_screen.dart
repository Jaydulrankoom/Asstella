import 'package:flutter/material.dart';

class AuditListScreen extends StatelessWidget {
  const AuditListScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Audit Campaigns')),
      body: const Center(
        child: Text('List of Active & Draft Audits'),
      ),
    );
  }
}
