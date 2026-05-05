import 'package:flutter/material.dart';

class CreateTransferRequestScreen extends StatelessWidget {
  const CreateTransferRequestScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Request Asset Transfer')),
      body: const Center(
        child: Text('Asset picker, source, destination, and reason fields'),
      ),
    );
  }
}
