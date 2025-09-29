import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:5000/api';
  
  Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<Map<String, dynamic>?> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: await _getHeaders(),
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', data['token']);
        await prefs.setString('user_data', jsonEncode(data['user']));
        return data;
      }
      return null;
    } catch (e) {
      print('Login error: $e');
      return null;
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('user_data');
  }

  Future<Map<String, dynamic>?> submitFeedback({
    required int patientId,
    required int doctorId,
    String? treatmentDescription,
    required int preTreatmentRating,
    required int postTreatmentRating,
    required int satisfactionRating,
    String? textFeedback,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/feedback/submit'),
        headers: await _getHeaders(),
        body: jsonEncode({
          'patientId': patientId,
          'doctorId': doctorId,
          'treatmentDescription': treatmentDescription,
          'preTreatmentRating': preTreatmentRating,
          'postTreatmentRating': postTreatmentRating,
          'satisfactionRating': satisfactionRating,
          'textFeedback': textFeedback,
        }),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return null;
    } catch (e) {
      print('Submit feedback error: $e');
      return null;
    }
  }

  Future<List<Map<String, dynamic>>> getFeedbackHistory() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/feedback/history'),
        headers: await _getHeaders(),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.cast<Map<String, dynamic>>();
      }
      return [];
    } catch (e) {
      print('Get feedback history error: $e');
      return [];
    }
  }

  Future<List<Map<String, dynamic>>> getDoctors() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/doctors'),
        headers: await _getHeaders(),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.cast<Map<String, dynamic>>();
      }
      return [];
    } catch (e) {
      print('Get doctors error: $e');
      return [];
    }
  }
}
