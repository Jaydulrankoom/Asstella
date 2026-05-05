import 'package:flutter/material.dart';

class VendorScorecardScreen extends StatelessWidget {
  const VendorScorecardScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Vendor Scorecard')),
      body: const Center(
        child: Text('Vendor performance, SLAs, missing penalties'),
      ),
    );
  }
}
