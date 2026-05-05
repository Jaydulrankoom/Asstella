import 'package:flutter/material.dart';

class RoutePlaybackScreen extends StatelessWidget {
  const RoutePlaybackScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Route History Playback')),
      body: Stack(
        children: [
          const Center(child: Text('Map with Polyline History')),
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              color: Colors.white,
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  IconButton(icon: const Icon(Icons.play_arrow), onPressed: () {}),
                  Expanded(
                    child: Slider(value: 0.5, onChanged: (v) {}),
                  ),
                  const Text('10:45 AM'),
                ],
              ),
            ),
          )
        ],
      ),
    );
  }
}
