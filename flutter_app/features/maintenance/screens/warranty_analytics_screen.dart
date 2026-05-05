import 'package:flutter/material.dart';

class WarrantyAnalyticsScreen extends StatelessWidget {
  const WarrantyAnalyticsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Warranty Analytics')),
      body: const Center(
        child: Text('Claims, recovery rate, cost vs maintenance spend'),
      ),
    );
  }
}
