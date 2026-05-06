import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'app.dart';
import 'core/config/supabase_config.dart';
import 'core/platform/desktop_window.dart';
import 'core/services/server_profiles_repository.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await configureDesktopWindow();

  final supabaseConfig = SupabaseConfig.current;
  if (supabaseConfig.isConfigured) {
    await Supabase.initialize(
      url: supabaseConfig.url,
      anonKey: supabaseConfig.publishableKey,
      debug: kDebugMode,
    );
  }

  final prefs = await SharedPreferences.getInstance();
  const secure = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
    iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
  );
  final profilesRepo = ServerProfilesRepository(prefs: prefs, secure: secure);

  runApp(
    ProviderScope(
      overrides: [
        serverProfilesRepositoryProvider.overrideWithValue(profilesRepo),
      ],
      child: const _FirstFrameShow(child: JujoStreamApp()),
    ),
  );
}

class _FirstFrameShow extends StatefulWidget {
  const _FirstFrameShow({required this.child});
  final Widget child;

  @override
  State<_FirstFrameShow> createState() => _FirstFrameShowState();
}

class _FirstFrameShowState extends State<_FirstFrameShow> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await showDesktopWindowAfterFirstFrame();
    });
  }

  @override
  Widget build(BuildContext context) => widget.child;
}
