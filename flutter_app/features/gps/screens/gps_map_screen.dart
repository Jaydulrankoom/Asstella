import 'package:flutter/material.dart';

class GpsMapScreen extends StatelessWidget {
  const GpsMapScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Live GPS Tracking')),
      body: Stack(
        children: [
          const Center(child: Text('Map View (flutter_map)')),
          Positioned(
            bottom: 20,
            left: 20,
            right: 20,
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: const [
                    Text('Vehicle Info Sheet', style: TextStyle(fontWeight: FontWeight.bold)),
                    SizedBox(height: 8),
                    Text('Driver: John Doe | Speed: 40 km/h | Ign: ON'),
                  ],
                ),
              ),
            ),
          )
        ],
      ),
    );
  }
}
