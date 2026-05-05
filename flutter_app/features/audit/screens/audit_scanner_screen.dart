import 'package:flutter/material.dart';

class AuditScannerScreen extends StatefulWidget {
  final String campaignId;
  const AuditScannerScreen({Key? key, required this.campaignId}) : super(key: key);

  @override
  _AuditScannerScreenState createState() => _AuditScannerScreenState();
}

class _AuditScannerScreenState extends State<AuditScannerScreen> {
  // MobileScannerController cameraController = MobileScannerController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Audit Scanner')),
      body: Stack(
        children: [
          const Center(child: Text('Camera Viewport... (MobileScanner)')),
          Positioned(
            top: 0, left: 0, right: 0,
            child: Container(
              color: Colors.green, padding: const EdgeInsets.all(8),
              child: const Text('Online Mode - Syncing queued results...', style: TextStyle(color: Colors.white)),
            ),
          ),
          Positioned(
            bottom: 0, left: 0, right: 0,
            child: Container(
              padding: const EdgeInsets.all(16),
              color: Colors.white,
              child: const Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('Progress: 45 / 120 Scanned', style: TextStyle(fontWeight: FontWeight.bold)),
                  Text('Found: 40 | Missing: 0 | Wrong Loc: 5'),
                ],
              ),
            ),
          )
        ],
      ),
    );
  }
}
