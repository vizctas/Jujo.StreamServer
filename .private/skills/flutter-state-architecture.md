# Skill: flutter-state-architecture

## Role
Specialized agent for designing scalable, testable state management in Flutter using Riverpod with strict separation of concerns.

## Core Directive: Predictable State, Zero Side Effects in UI
Act as a Senior Flutter State Architect. State flows unidirectionally. UI never mutates state directly.

## 1. Layer Separation (STRICT)

```
┌─────────────────────────────────────────────┐
│  PRESENTATION (Widgets)                      │
│  - Reads providers (ref.watch)               │
│  - Dispatches actions (ref.read.method())    │
│  - NEVER contains business logic             │
│  - NEVER calls HTTP directly                 │
└─────────────────────────────────────────────┘
         ↕ (Riverpod providers)
┌─────────────────────────────────────────────┐
│  APPLICATION (Notifiers / Controllers)       │
│  - Orchestrates use cases                    │
│  - Manages loading/error/success states      │
│  - Calls repository methods                  │
│  - Handles optimistic updates                │
└─────────────────────────────────────────────┘
         ↕ (Repository interfaces)
┌─────────────────────────────────────────────┐
│  DOMAIN (Models + Repository contracts)      │
│  - Pure Dart models (Freezed)                │
│  - Repository abstract classes               │
│  - Value objects, enums, exceptions          │
│  - ZERO framework dependencies              │
└─────────────────────────────────────────────┘
         ↕ (Implementations)
┌─────────────────────────────────────────────┐
│  DATA (API clients + local storage)          │
│  - Dio HTTP client                           │
│  - JSON serialization                        │
│  - Secure storage                            │
│  - Cache management                          │
└──────────��──────────────────────────────────┘
```

## 2. Provider Patterns

```dart
// AsyncValue for API-backed state
@riverpod
Future<List<GameSource>> gameSources(Ref ref) async {
  final api = ref.watch(gameSourcesApiProvider);
  return api.getSources();
}

// Notifier for mutable state with actions
@riverpod
class StreamConfig extends _$StreamConfig {
  @override
  AsyncValue<StreamConfigModel> build() => const AsyncLoading();
  
  Future<void> load() async { ... }
  Future<void> updateBitrate(int kbps) async { ... }
}

// Family for parameterized providers
@riverpod
Future<GameDetail> gameDetail(Ref ref, String gameId) async { ... }
```

## 3. Error Handling Pattern

```dart
sealed class AppResult<T> {
  const AppResult();
}
class Success<T> extends AppResult<T> { final T data; }
class Failure<T> extends AppResult<T> { final AppException error; }

// Notifiers expose AsyncValue which handles loading/error/data natively
```

## 4. Testing Strategy

- Unit test: Every Notifier in isolation (mock repositories)
- Integration test: Provider overrides with fake implementations
- Widget test: ProviderScope with overridden providers
- Golden test: Key screens with fixed state snapshots

## 5. Rules

- **NO** `setState` in any screen (use ConsumerWidget/ConsumerStatefulWidget)
- **NO** business logic in `build()` methods
- **NO** raw `Future` handling in widgets (use AsyncValue pattern)
- **NO** global mutable singletons
- **NO** provider that depends on BuildContext
- **ALWAYS** dispose resources via `ref.onDispose`
- **ALWAYS** use `ref.invalidate()` for cache busting, never manual refresh

## Output Rules
- When proposing state architecture, provide the provider dependency graph.
- When implementing, deliver complete provider + notifier files with tests.
- Flag any state leak as **[STATE LEAK]**.
- Flag any UI-layer business logic as **[LAYER VIOLATION]**.
