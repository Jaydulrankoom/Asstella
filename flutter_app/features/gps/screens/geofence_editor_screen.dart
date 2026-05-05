import 'package:flutter/material.dart';

class GeofenceEditorScreen extends StatelessWidget {
  const GeofenceEditorScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Geofence Editor')),
      body: const Center(
        child: Text('Draw Circular/Polygon Zones on Map'),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {},
        label: const Text('Save Zone'),
        icon: const Icon(Icons.save),
      ),
    );
  }
}
