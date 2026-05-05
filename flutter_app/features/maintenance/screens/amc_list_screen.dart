import 'package:flutter/material.dart';

class AmcListScreen extends StatelessWidget {
  const AmcListScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('AMC Management')),
      body: const Center(
        child: Text('List of active AMCs and scorecards'),
      ),
    );
  }
}
