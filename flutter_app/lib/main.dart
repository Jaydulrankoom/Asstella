import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'features/assets/screens/asset_list_screen.dart';
import 'features/assets/screens/add_asset_screen.dart';
import 'features/assets/screens/asset_profile_screen.dart';

void main() {
  runApp(const ProviderScope(child: AssetsFlowApp()));
}

class AssetsFlowApp extends StatelessWidget {
  const AssetsFlowApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'AssetsFlow ERP',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF1A3FF0)),
        useMaterial3: true,
        fontFamily: 'Inter',
        appBarTheme: const AppBarTheme(
          centerTitle: false,
          elevation: 0,
        ),
      ),
      routerConfig: _router,
    );
  }
}

final _router = GoRouter(
  initialLocation: '/assets',
  routes: [
    GoRoute(
      path: '/assets',
      builder: (context, state) => const AssetListScreen(),
      routes: [
        GoRoute(
          path: 'add',
          builder: (context, state) => const AddAssetScreen(),
        ),
        GoRoute(
          path: 'profile/:id',
          builder: (context, state) => AssetProfileScreen(assetCode: state.pathParameters['id']!),
        ),
      ],
    ),
  ],
);
