import 'package:flutter/material.dart';

class IntegrationListScreen extends StatelessWidget {
  const IntegrationListScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('API Integration Hub')),
      body: const Center(
        child: Text('Integration list: name, type, last sync status'),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        child: const Icon(Icons.add),
      ),
    );
  }
}
