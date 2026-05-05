import 'package:flutter/material.dart';

class PreventiveSchedulesScreen extends StatelessWidget {
  const PreventiveSchedulesScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Preventive Schedules')),
      body: const Center(
        child: Text('Setup preventive schedules for assets / categories'),
      ),
    );
  }
}
