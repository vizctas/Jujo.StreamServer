import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Manages multi-select state for the library screen.
///
/// Tracks which game indices are selected and provides batch operations.
/// Selection mode is entered via long-press and exited via clear/action.
final librarySelectionProvider =
    NotifierProvider<LibrarySelectionNotifier, LibrarySelectionState>(
  LibrarySelectionNotifier.new,
);

class LibrarySelectionState {
  const LibrarySelectionState({
    this.active = false,
    this.selectedIndices = const {},
  });

  /// Whether multi-select mode is active.
  final bool active;

  /// Set of selected game indices (server-side indices).
  final Set<int> selectedIndices;

  int get count => selectedIndices.length;
  bool get isEmpty => selectedIndices.isEmpty;

  bool isSelected(int index) => selectedIndices.contains(index);

  LibrarySelectionState copyWith({
    bool? active,
    Set<int>? selectedIndices,
  }) {
    return LibrarySelectionState(
      active: active ?? this.active,
      selectedIndices: selectedIndices ?? this.selectedIndices,
    );
  }
}

class LibrarySelectionNotifier extends Notifier<LibrarySelectionState> {
  @override
  LibrarySelectionState build() => const LibrarySelectionState();

  /// Enter selection mode with an initial item.
  void enterSelection(int index) {
    state = LibrarySelectionState(
      active: true,
      selectedIndices: {index},
    );
  }

  /// Toggle a single item's selection.
  void toggle(int index) {
    if (!state.active) return;
    final updated = Set<int>.from(state.selectedIndices);
    if (updated.contains(index)) {
      updated.remove(index);
    } else {
      updated.add(index);
    }
    // Auto-exit if nothing selected
    if (updated.isEmpty) {
      state = const LibrarySelectionState();
    } else {
      state = state.copyWith(selectedIndices: updated);
    }
  }

  /// Select all items from a list of indices.
  void selectAll(List<int> indices) {
    state = state.copyWith(
      active: true,
      selectedIndices: indices.toSet(),
    );
  }

  /// Clear selection and exit multi-select mode.
  void clear() {
    state = const LibrarySelectionState();
  }
}
