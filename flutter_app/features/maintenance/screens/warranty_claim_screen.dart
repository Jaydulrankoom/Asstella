import 'package:flutter/material.dart';

class WarrantyClaimScreen extends StatelessWidget {
  const WarrantyClaimScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Warranty Claim')),
      body: const Center(
        child: Text('Claim submission form and tracker timeline'),
      ),
    );
  }
}
