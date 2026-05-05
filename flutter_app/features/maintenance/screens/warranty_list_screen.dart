import 'package:flutter/material.dart';

class WarrantyListScreen extends StatelessWidget {
  const WarrantyListScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Warranty Management')),
      body: const Center(
        child: Text('Warranty list with expiration highlighting'),
      ),
    );
  }
}
