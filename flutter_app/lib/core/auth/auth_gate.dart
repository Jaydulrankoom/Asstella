import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../features/auth/login_screen.dart';
import '../../features/platform/shell/platform_shell.dart';
import '../../features/tenant/shell/tenant_shell.dart';

class AuthGate extends ConsumerWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return StreamBuilder<User?>(
      stream: FirebaseAuth.instance.authStateChanges(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const SplashScreen();
        }
        if (snapshot.hasData) {
          // Read custom claims from ID token
          return FutureBuilder<IdTokenResult>(
            future: snapshot.data!.getIdTokenResult(),
            builder: (context, tokenSnapshot) {
              if (!tokenSnapshot.hasData) return const SplashScreen();
              final claims = tokenSnapshot.data!.claims ?? {};
              final isPlatformAdmin = claims['is_platform_admin'] == true;
              return isPlatformAdmin ? const PlatformShell() : const TenantShell();
            },
          );
        }
        return const LoginScreen();
      },
    );
  }
}

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: CircularProgressIndicator(),
      ),
    );
  }
}
