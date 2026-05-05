import 'package:flutter/material.dart';

class DisposalRequestScreen extends StatelessWidget {
  const DisposalRequestScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Request Asset Disposal')),
      body: const Center(
        child: Text('Asset picker, type, disposal value, upload documents, calculate gain/loss'),
      ),
    );
  }
}
