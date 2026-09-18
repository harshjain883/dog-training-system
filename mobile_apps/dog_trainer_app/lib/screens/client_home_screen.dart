import 'package:flutter/material.dart';

class ClientHomeScreen extends StatelessWidget {
  final Map<String, dynamic> userData;
  const ClientHomeScreen({super.key, required this.userData});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Client Dashboard")),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Welcome, ${userData['fullName']}!", style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),
            const Card(
              child: Padding(
                padding: EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("Active Package: Basic Obedience", style: TextStyle(fontWeight: FontWeight.bold)),
                    SizedBox(height: 8),
                    Text("Completed: 4 / 12 Sessions"),
                    LinearProgressIndicator(value: 4 / 12),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
