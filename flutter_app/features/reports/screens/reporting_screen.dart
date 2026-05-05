import 'package:flutter/material.dart';

class ReportingScreen extends StatelessWidget {
  const ReportingScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('IFRS Reports')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('Select Report Type, Filters, Setup Date Range'),
            ElevatedButton(onPressed: () {}, child: const Text('Generate Table')),
            ElevatedButton(onPressed: () {}, child: const Text('Export PDF')),
            ElevatedButton(onPressed: () {}, child: const Text('Export Excel')),
          ],
        ),
      ),
    );
  }
}
