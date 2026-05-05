import 'package:flutter/material.dart';

class TicketsScreen extends StatelessWidget {
  const TicketsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Maintenance Tickets')),
      body: const Center(
        child: Text('List of maintenance tickets with filters'),
      ),
    );
  }
}
