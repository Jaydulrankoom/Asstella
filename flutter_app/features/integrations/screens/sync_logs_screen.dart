import 'package:flutter/material.dart';

class SyncLogsScreen extends StatelessWidget {
  const SyncLogsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Sync Logs')),
      body: const Center(
        child: Text('Filterable timeline of success/failure sync logs'),
      ),
    );
  }
}
