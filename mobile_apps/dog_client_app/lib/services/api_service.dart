import 'dart0:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'https://dog-backend-production.up.railway.app/api';

  static Future<Map<String, dynamic>> login(String username, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'username': username, 'password': password}),
    );
    return jsonDecode(response.body);
  }
}
