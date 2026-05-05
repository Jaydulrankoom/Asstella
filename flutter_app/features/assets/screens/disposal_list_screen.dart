import 'package:flutter/material.dart';

class DisposalListScreen extends StatelessWidget {
  const DisposalListScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Asset Disposals')),
      body: const Center(
        child: Text('List of disposed assets and pending disposal requests'),
      ),
    );
  }
}
