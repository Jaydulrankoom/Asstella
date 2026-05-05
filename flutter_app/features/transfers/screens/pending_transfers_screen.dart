import 'package:flutter/material.dart';

class PendingTransfersScreen extends StatelessWidget {
  const PendingTransfersScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Pending Transfers')),
      body: const Center(
        child: Text('List of transfers pending approval'),
      ),
    );
  }
}
