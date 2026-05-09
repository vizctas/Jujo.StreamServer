import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'package:jujo_stream_app/core/theme/tokens/spacing.dart';
import 'package:jujo_stream_app/core/theme/tokens/radius.dart';

// ─── Section Title ────────────────────────────────────────────────────────────

class ConfigSectionTitle extends StatelessWidget {
  const ConfigSectionTitle({super.key, required this.title, this.subtitle});
  final String title;
  final String? subtitle;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w500),
        ),
        if (subtitle != null) ...[
          const SizedBox(height: 2),
          Text(
            subtitle!,
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ],
    );
  }
}

// ─── Dropdown Field ─────────────��─────────────────────────────────────────────

class ConfigDropdownField extends StatelessWidget {
  const ConfigDropdownField({
    super.key,
    required this.label,
    required this.value,
    required this.options,
    required this.labels,
    required this.onChanged,
    this.helperText,
  });

  final String label;
  final String value;
  final List<String> options;
  final List<String> labels;
  final ValueChanged<String> onChanged;
  final String? helperText;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final effectiveValue = options.contains(value) ? value : options.first;
    return DropdownButtonFormField<String>(
      initialValue: effectiveValue,
      decoration: InputDecoration(
        labelText: label,
        helperText: helperText,
        helperMaxLines: 2,
      ),
      items: List.generate(options.length, (i) {
        return DropdownMenuItem(
          value: options[i],
          child: Text(labels[i], style: theme.textTheme.bodyMedium),
        );
      }),
      onChanged: (v) {
        if (v != null) onChanged(v);
      },
    );
  }
}

// ─── Slider Field ─────────────────────────────────────────────────────────────

class ConfigSliderField extends StatelessWidget {
  const ConfigSliderField({
    super.key,
    required this.label,
    required this.value,
    required this.min,
    required this.max,
    required this.divisions,
    required this.suffix,
    required this.onChanged,
    this.helperText,
  });

  final String label;
  final double value;
  final double min;
  final double max;
  final int divisions;
  final String suffix;
  final ValueChanged<double> onChanged;
  final String? helperText;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final clampedValue = value.clamp(min, max);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: theme.textTheme.bodyMedium),
            Text(
              '${clampedValue.round()} $suffix',
              style: theme.textTheme.labelLarge?.copyWith(
                color: theme.colorScheme.primary,
              ),
            ),
          ],
        ),
        Slider(
          value: clampedValue,
          min: min,
          max: max,
          divisions: divisions,
          onChanged: onChanged,
        ),
        if (helperText != null)
          Padding(
            padding: const EdgeInsets.only(left: AppSpacing.xs),
            child: Text(
              helperText!,
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
                fontSize: 11,
              ),
            ),
          ),
      ],
    );
  }
}

// ─── Switch Field ─────────────────────────────────────────────────────────────

class ConfigSwitchField extends StatelessWidget {
  const ConfigSwitchField({
    super.key,
    required this.label,
    required this.value,
    required this.onChanged,
    this.subtitle,
  });

  final String label;
  final bool value;
  final ValueChanged<bool> onChanged;
  final String? subtitle;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SwitchListTile(
      title: Text(label, style: theme.textTheme.bodyMedium),
      subtitle: subtitle != null
          ? Text(
              subtitle!,
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            )
          : null,
      value: value,
      onChanged: onChanged,
      contentPadding: EdgeInsets.zero,
      dense: true,
    );
  }
}

// ─── Text Field ───────────────────────────────────────────────────────────────

class ConfigTextField extends StatelessWidget {
  const ConfigTextField({
    super.key,
    required this.label,
    required this.value,
    required this.onChanged,
    this.helperText,
    this.hintText,
  });

  final String label;
  final String value;
  final ValueChanged<String> onChanged;
  final String? helperText;
  final String? hintText;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      initialValue: value,
      decoration: InputDecoration(
        labelText: label,
        helperText: helperText,
        helperMaxLines: 2,
        hintText: hintText,
      ),
      onChanged: onChanged,
    );
  }
}

// ─── Number Field ─────────────────────────────────────────────────────────────

class ConfigNumberField extends StatelessWidget {
  const ConfigNumberField({
    super.key,
    required this.label,
    required this.value,
    required this.onChanged,
    this.helperText,
    this.min,
    this.max,
    this.suffix,
  });

  final String label;
  final int value;
  final ValueChanged<int> onChanged;
  final String? helperText;
  final int? min;
  final int? max;
  final String? suffix;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      initialValue: value.toString(),
      decoration: InputDecoration(
        labelText: label,
        helperText: helperText,
        helperMaxLines: 2,
        suffixText: suffix,
      ),
      keyboardType: TextInputType.number,
      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
      onChanged: (v) {
        final parsed = int.tryParse(v);
        if (parsed != null) {
          final clamped = parsed.clamp(min ?? 0, max ?? 999999);
          onChanged(clamped);
        }
      },
    );
  }
}

// ─── Config Group Card ────────────────────────────────────────────────────────

/// Wraps a group of config fields in a subtle card container.
class ConfigGroupCard extends StatelessWidget {
  const ConfigGroupCard({
    super.key,
    required this.children,
    this.title,
  });

  final List<Widget> children;
  final String? title;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.base),
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: colorScheme.outlineVariant.withValues(alpha: 0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (title != null) ...[
            Text(
              title!.toUpperCase(),
              style: theme.textTheme.labelSmall?.copyWith(
                color: colorScheme.onSurfaceVariant,
                letterSpacing: 0.6,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: AppSpacing.md),
          ],
          ...children,
        ],
      ),
    );
  }
}
