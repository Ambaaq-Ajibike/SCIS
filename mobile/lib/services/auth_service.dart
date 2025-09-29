import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';

class AuthService extends ChangeNotifier {
  bool _isLoggedIn = false;
  Map<String, dynamic>? _user;

  bool get isLoggedIn => _isLoggedIn;
  Map<String, dynamic>? get user => _user;

  Future<void> checkAuthStatus() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    final userData = prefs.getString('user_data');
    
    if (token != null && userData != null) {
      _isLoggedIn = true;
      _user = Map<String, dynamic>.from(
        const JsonDecoder().convert(userData)
      );
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    final apiService = ApiService();
    final result = await apiService.login(email, password);
    
    if (result != null) {
      _isLoggedIn = true;
      _user = result['user'];
      notifyListeners();
      return true;
    }
    return false;
  }

  Future<void> logout() async {
    final apiService = ApiService();
    await apiService.logout();
    _isLoggedIn = false;
    _user = null;
    notifyListeners();
  }
}
