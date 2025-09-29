import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';
import 'screens/feedback_screen.dart';
import 'screens/history_screen.dart';
import 'services/api_service.dart';
import 'services/auth_service.dart';

void main() {
  runApp(const SCISApp());
}

class SCISApp extends StatelessWidget {
  const SCISApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthService()),
        ChangeNotifierProvider(create: (_) => ApiService()),
      ],
      child: MaterialApp(
        title: 'SCIS Patient App',
        theme: ThemeData(
          primarySwatch: Colors.blue,
          primaryColor: const Color(0xFF3B82F6),
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF3B82F6),
            brightness: Brightness.light,
          ),
          useMaterial3: true,
          appBarTheme: const AppBarTheme(
            backgroundColor: Color(0xFF3B82F6),
            foregroundColor: Colors.white,
            elevation: 0,
          ),
        ),
        home: const AuthWrapper(),
        routes: {
          '/login': (context) => const LoginScreen(),
          '/home': (context) => const HomeScreen(),
          '/feedback': (context) => const FeedbackScreen(),
          '/history': (context) => const HistoryScreen(),
        },
      ),
    );
  }
}

class AuthWrapper extends StatefulWidget {
  const AuthWrapper({super.key});

  @override
  State<AuthWrapper> createState() => _AuthWrapperState();
}

class _AuthWrapperState extends State<AuthWrapper> {
  bool _isLoading = true;
  bool _isLoggedIn = false;

  @override
  void initState() {
    super.initState();
    _checkAuthStatus();
  }

  Future<void> _checkAuthStatus() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    
    setState(() {
      _isLoggedIn = token != null;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    return _isLoggedIn ? const HomeScreen() : const LoginScreen();
  }
}
