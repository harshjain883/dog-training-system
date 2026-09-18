import 'dart:io';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:geolocator/geolocator.dart';
import 'package:camera/camera.dart';

class ApiService {
  static const String baseUrl = 'http://10.0.2.2:5000/api';

  // --- 1. LIVE GPS GEOFENCE CHECK ---
  static Future<Position> getCurrentLocation() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      throw Exception('Location services are disabled.');
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        throw Exception('Location permissions are denied.');
      }
    }
    
    return await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high
    );
  }

  // --- 2. MANDATORY LIVE CAMERA CAPTURE (NO GALLERY) ---
  static Future<String?> captureLivePhoto(CameraController cameraController) async {
    if (!cameraController.value.isInitialized) return null;
    
    // Gallery selection bypass disabled
    XFile file = await cameraController.takePicture();
    
    // Upload image to backend/cloud storage and get URL
    return await _uploadImageMock(File(file.path));
  }

  static Future<String> _uploadImageMock(File imageFile) async {
    // Simulated S3 / Storage URL return
    await Future.delayed(const Duration(seconds: 1));
    return "https://storage.dogtrainingapp.com/verification/${DateTime.now().millisecondsSinceEpoch}.jpg";
  }

  // --- 3. START SESSION API CALL WITH GPS & PHOTO ---
  static Future<bool> startSession({
    required String sessionId,
    required double lat,
    required double lng,
    required String photoUrl,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/sessions/start'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'sessionId': sessionId,
        'trainerLat': lat,
        'trainerLng': lng,
        'photoUrl': photoUrl,
      }),
    );

    final data = jsonDecode(response.body);
    return data['success'] == true;
  }
}
