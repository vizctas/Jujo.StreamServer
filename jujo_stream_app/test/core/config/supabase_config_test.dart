import 'package:flutter_test/flutter_test.dart';
import 'package:jujo_stream_app/core/config/supabase_config.dart';

void main() {
  test('is configured only when URL and publishable key are present', () {
    expect(
      const SupabaseRuntimeConfig(url: '', publishableKey: 'key').isConfigured,
      isFalse,
    );
    expect(
      const SupabaseRuntimeConfig(
        url: 'https://example.supabase.co',
        publishableKey: '',
      ).isConfigured,
      isFalse,
    );
    expect(
      const SupabaseRuntimeConfig(
        url: 'https://example.supabase.co',
        publishableKey: 'sb_publishable_example',
      ).isConfigured,
      isTrue,
    );
  });

  test('throws a clear error when initialization config is missing', () {
    expect(
      () => const SupabaseRuntimeConfig(
        url: '',
        publishableKey: '',
      ).validateForInitialization(),
      throwsA(isA<StateError>()),
    );
  });
}
