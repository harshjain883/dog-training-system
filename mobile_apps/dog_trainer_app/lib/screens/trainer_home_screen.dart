import 'dart:async';
import 'package:flutter/material.dart';

class TrainerHomeScreen extends StatefulWidget {
  const TrainerHomeScreen({super.key});

  @override
  State<TrainerHomeScreen> createState() => _TrainerHomeScreenState();
}

class _TrainerHomeScreenState extends State<TrainerHomeScreen> {
  int _preSessionSeconds = 900;
  int _sessionSeconds = 1800;
  Timer? _timer;
  bool _isSessionActive = false;

  @override
  void initState() {
    super.initState();
    _startPreSessionCountdown();
  }

  void _startPreSessionCountdown() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_preSessionSeconds > 0) {
        setState(() => _preSessionSeconds--);
      } else {
        _timer?.cancel();
      }
    });
  }

  void _startLiveSession() {
    setState(() => _isSessionActive = true);
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_sessionSeconds > 0) {
        setState(() => _sessionSeconds--);
      } else {
        _timer?.cancel();
      }
    });
  }

  String _formatTime(int seconds) {
    final m = seconds ~/ 60;
    final s = seconds % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Trainer Workspace")),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            const Card(
              child: ListTile(
                leading: Icon(Icons.pets, color: Colors.indigo),
                title: Text("Client: Bruno"),
                subtitle: Text("Location: 100m Geofence Radius Target"),
              ),
            ),
            const SizedBox(height: 20),
            if (!_isSessionActive) ...[
              Text("Pre-Session Countdown: ${_formatTime(_preSessionSeconds)}", style: const TextStyle(fontSize: 20, color: Colors.amber)),
              const Spacer(),
              ElevatedButton(
                onPressed: _startLiveSession,
                style: ElevatedButton.styleFrom(backgroundColor: Colors.green, minimumSize: const Size.fromHeight(50)),
                child: const Text("START SESSION (CAPTURE PHOTO)"),
              )
            ] else ...[
              Text("Session Time Left: ${_formatTime(_sessionSeconds)}", style: const TextStyle(fontSize: 24, color: Colors.green, fontWeight: FontWeight.bold)),
              const Spacer(),
              ElevatedButton(
                onPressed: () {},
                style: ElevatedButton.styleFrom(backgroundColor: Colors.red, minimumSize: const Size.fromHeight(50)),
                child: const Text("END SESSION (CAPTURE PHOTO)"),
              )
            ]
          ],
        ),
      ),
    );
  }
}
