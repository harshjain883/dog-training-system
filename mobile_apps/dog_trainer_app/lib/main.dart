import 'dart:async';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

void main() {
  runApp(const DogTrainingApp());
}

class DogTrainingApp extends StatelessWidget {
  const DogTrainingApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Dog Training Hub',
      theme: ThemeData(primarySwatch: Colors.indigo),
      home: const LoginScreen(),
    );
  }
}

// ==========================================
// 1. LOGIN SCREEN
// ==========================================
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _isLoading = false;

  Future<void> _login() async {
    setState(() => _isLoading = true);
    try {
      final response = await http.post(
        Uri.parse('http://10.0.2.2:5000/api/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'username': _usernameController.text,
          'password': _passwordController.text,
        }),
      );

      final data = jsonDecode(response.body);
      if (data['success'] == true) {
        final role = data['user']['role'];
        if (role == 'TRAINER') {
          Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const TrainerHomeScreen()));
        } else {
          Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => ClientHomeScreen(userData: data['user'])));
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(data['message'] ?? 'Login Failed')));
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error connecting to server: $e')));
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.pets, size: 80, color: Colors.indigo),
            const SizedBox(height: 16),
            const Text("Dog Training Portal", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            const SizedBox(height: 32),
            TextField(controller: _usernameController, decoration: const InputDecoration(labelText: 'Username or Phone', border: OutlineInputBorder())),
            const SizedBox(height: 16),
            TextField(controller: _passwordController, obscureText: true, decoration: const InputDecoration(labelText: 'Password', border: OutlineInputBorder())),
            const SizedBox(height: 24),
            _isLoading 
              ? const CircularProgressIndicator()
              : ElevatedButton(
                  onPressed: _login,
                  style: ElevatedButton.styleFrom(minimumSize: const Size.fromHeight(50)),
                  child: const Text("LOGIN"),
                )
          ],
        ),
      ),
    );
  }
}

// ==========================================
// 2. TRAINER MOBILE APP SCREEN (GPS & TIMERS)
// ==========================================
class TrainerHomeScreen extends StatefulWidget {
  const TrainerHomeScreen({super.key});

  @override
  State<TrainerHomeScreen> createState() => _TrainerHomeScreenState();
}

class _TrainerHomeScreenState extends State<TrainerHomeScreen> {
  // Pre-session Countdown (15-min window) & Live 30-min timer
  int _preSessionSeconds = 900; // 15 mins
  int _sessionSeconds = 1800;   // 30 mins
  Timer? _timer;
  bool _isSessionActive = false;
  bool _canStartSession = false;

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
        setState(() => _canStartSession = true);
        _timer?.cancel();
      }
    });
  }

  void _startLive30MinSession() {
    setState(() {
      _isSessionActive = true;
    });
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_sessionSeconds > 0) {
        setState(() => _sessionSeconds--);
      } else {
        _timer?.cancel();
        // Session 30 mins complete - prompt mandatory end photo
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
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Card(
              child: ListTile(
                leading: Icon(Icons.person, color: Colors.indigo),
                title: Text("Client: Rocky (German Shepherd)"),
                subtitle: Text("Schedule: MWF - 10:00 AM\nAddress: 123 Palm Street"),
              ),
            ),
            const SizedBox(height: 20),
            
            // 15-Minute Pre-Session Countdown View
            if (!_isSessionActive) ...[
              Card(
                color: Colors.amber.shade50,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      const Text("15-Min Pre-Session Window", style: TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Text(_formatTime(_preSessionSeconds), style: const TextStyle(fontSize: 36, color: Colors.amber)),
                      const Text("Arrive at client location before timer reaches 00:00"),
                    ],
                  ),
                ),
              ),
              const Spacer(),
              ElevatedButton.icon(
                icon: const Icon(Icons.camera_alt),
                label: const Text("VERIFY GPS & START SESSION (PHOTO)"),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  minimumSize: const Size.fromHeight(50)
                ),
                onPressed: () {
                  // Triggers Live Photo Camera Capture & Geofence Verification
                  _startLive30MinSession();
                },
              )
            ],

            // Active 30-Minute Session View
            if (_isSessionActive) ...[
              Card(
                color: Colors.green.shade50,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      const Text("LIVE SESSION IN PROGRESS", style: TextStyle(fontWeight: FontWeight.bold, color: Colors.green)),
                      const SizedBox(height: 8),
                      Text(_formatTime(_sessionSeconds), style: const TextStyle(fontSize: 48, fontWeight: FontWeight.bold, color: Colors.green)),
                      const LinearProgressIndicator(value: 0.5),
                    ],
                  ),
                ),
              ),
              const Spacer(),
              ElevatedButton.icon(
                icon: const Icon(Icons.check_circle),
                label: const Text("COMPLETE & END SESSION (PHOTO)"),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.redAccent,
                  minimumSize: const Size.fromHeight(50)
                ),
                onPressed: () {
                  // Triggers mandatory end session photo capture & wallet credit
                },
              )
            ]
          ],
        ),
      ),
    );
  }
}

// ==========================================
// 3. CLIENT MOBILE APP SCREEN (TRACKER)
// ==========================================
class ClientHomeScreen extends StatelessWidget {
  final Map<String, dynamic> userData;
  const ClientHomeScreen({super.key, required this.userData});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Pet Parent Dashboard")),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Active Package Card
            Card(
              elevation: 4,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: const Padding(
                padding: EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("Active Package", style: TextStyle(color: Colors.grey, fontSize: 14)),
                    Text("Basic Obedience & Behaviour", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                    SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text("Progress: 8 / 12 Sessions", style: TextStyle(fontWeight: FontWeight.w600)),
                        Text("Remaining: 4", style: TextStyle(color: Colors.indigo, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    SizedBox(height: 8),
                    LinearProgressIndicator(value: 8 / 12, minHeight: 8),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            
            const Text("Upcoming Scheduled Session", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Card(
              child: ListTile(
                leading: Icon(Icons.event, color: Colors.indigo),
                title: Text("Tomorrow at 10:00 AM"),
                subtitle: Text("Trainer: Alex Johnson\nNote: Cancel/Pause available 24h prior"),
              ),
            ),

            const SizedBox(height: 20),
            const Text("Completed Sessions History", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            
            ListTile(
              tileColor: Colors.white,
              leading: const CircleAvatar(backgroundColor: Colors.green, child: Icon(Icons.check, color: Colors.white)),
              title: const Text("Session #8 Completed"),
              subtitle: const Text("Verified Start: 10:01 AM | End: 10:31 AM"),
              trailing: IconButton(
                icon: const Icon(Icons.image),
                onPressed: () {
                  // View live start/end photos recorded by trainer
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
