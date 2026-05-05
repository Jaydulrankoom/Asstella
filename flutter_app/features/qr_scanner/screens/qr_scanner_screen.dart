import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
// Note: In a full app you might use image_picker and a jsQR interop or zxing for web fallback if needed
import 'dart:convert';
import 'package:http/http.dart' as http;

class QrScannerScreen extends StatefulWidget {
  final String tenantId;
  final String token;

  const QrScannerScreen({Key? key, required this.tenantId, required this.token}) : super(key: key);

  @override
  _QrScannerScreenState createState() => _QrScannerScreenState();
}

class _QrScannerScreenState extends State<QrScannerScreen> {
  MobileScannerController cameraController = MobileScannerController();
  bool _isScanning = true;
  Map<String, dynamic>? _scannedAsset;
  Map<String, dynamic>? _allowedActions;
  bool _isLoading = false;

  Future<void> _handleScan(BarcodeCapture capture) async {
    if (!_isScanning) return;
    
    final List<Barcode> barcodes = capture.barcodes;
    if (barcodes.isNotEmpty && barcodes.first.rawValue != null) {
        setState(() {
          _isScanning = false;
          _isLoading = true;
        });

        final code = barcodes.first.rawValue!;
        await _fetchAssetDetails(code);
    }
  }

  Future<void> _fetchAssetDetails(String code) async {
    try {
      // In production, configure the base URL properly
      final response = await http.get(
        Uri.parse('https://api.yourdomain.com/api/v1/qr/scan/$code'),
        headers: {
          'Authorization': 'Bearer \${widget.token}',
          'x-tenant-id': widget.tenantId,
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body)['data'];
        setState(() {
          _scannedAsset = data['asset'];
          _allowedActions = data['allowed_actions'];
          _isLoading = false;
        });
      } else {
        _showError('Asset not found or access denied');
      }
    } catch (e) {
      _showError('Network error occurred');
    }
  }

  void _showError(String message) {
    setState(() {
      _isLoading = false;
    });
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
    Future.delayed(Duration(seconds: 2), () {
      setState(() {
        _isScanning = true;
      });
    });
  }

  void _resetScanner() {
    setState(() {
      _scannedAsset = null;
      _allowedActions = null;
      _isScanning = true;
    });
  }

  Widget _buildAssetOverlay() {
    if (_scannedAsset == null) return const SizedBox.shrink();

    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Container(
        padding: const EdgeInsets.all(16.0),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24.0)),
          boxShadow: [
            BoxShadow(color: Colors.black26, blurRadius: 10, spreadRadius: 2)
          ]
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    _scannedAsset!['asset_name'] ?? 'Unknown Asset',
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                ),
                IconButton(icon: const Icon(Icons.close), onPressed: _resetScanner),
              ],
            ),
            const SizedBox(height: 8),
            Text('Code: \${_scannedAsset!['asset_code']}'),
            Text('Custodian: \${_scannedAsset!['custodian_user_id'] ?? 'Unassigned'}'),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8.0,
              children: [
                Chip(
                  label: Text('Condition: \${_scannedAsset!['condition']}'),
                  backgroundColor: Colors.grey[200],
                ),
                Chip(
                  label: Text('Status: \${_scannedAsset!['status']}'),
                  backgroundColor: _scannedAsset!['status'] == 'active' ? Colors.green[100] : Colors.orange[100],
                ),
              ],
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8.0,
              runSpacing: 8.0,
              children: _buildActionButtons(),
            )
          ],
        ),
      ),
    );
  }

  List<Widget> _buildActionButtons() {
    List<Widget> buttons = [];
    
    if (_allowedActions?['view'] == true) {
      buttons.add(ElevatedButton(
        onPressed: () { /* Navigate to Asset Detail */ },
        child: const Text('View Asset'),
      ));
    }
    
    if (_allowedActions?['create_maintenance'] == true) {
      buttons.add(ElevatedButton(
        style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
        onPressed: () { /* Navigate to Create Maintenance */ },
        child: const Text('Create Maintenance'),
      ));
    }

    if (_allowedActions?['request_transfer'] == true) {
      buttons.add(ElevatedButton(
        style: ElevatedButton.styleFrom(backgroundColor: Colors.blue),
        onPressed: () { /* Navigate to Request Transfer */ },
        child: const Text('Request Transfer'),
      ));
    }

    if (_allowedActions?['audit_verify'] == true) {
      buttons.add(ElevatedButton(
        style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
        onPressed: () { /* Audit Verify Action */ },
        child: const Text('Audit Verify'),
      ));
    }

    return buttons;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Scan Asset')),
      body: Stack(
        children: [
          MobileScanner(
            controller: cameraController,
            onDetect: _handleScan,
          ),
          if (_isScanning)
            Center(
              child: Container(
                width: 250,
                height: 250,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.green, width: 4),
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          if (_isLoading)
            const Center(child: CircularProgressIndicator()),
          _buildAssetOverlay(),
        ],
      ),
    );
  }
}
