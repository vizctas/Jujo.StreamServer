<script setup lang="ts">
/**
 * FormField — wrapper for label + input/control + optional hint/error text.
 * Provides consistent vertical spacing and typography for all form layouts.
 */
withDefaults(
  defineProps<{
    label?: string;
    hint?: string;
    error?: string;
    /** Associate the label with an input id */
    for?: string;
    required?: boolean;
    /** Inline (label beside control) vs stacked (label above, default) */
    inline?: boolean;
  }>(),
  {
    required: false,
    inline: false,
  },
);
</script>

<template>
  <div
    class="form-field"
    :class="inline ? 'form-field--inline' : 'form-field--stacked'"
  >
    <label
      v-if="label"
      v-bind="{ ...($props.for ? { for: $props.for } : {}) }"
      class="form-field__label block text-xs font-medium leading-snug text-dark/75 dark:text-light/75"
      :class="inline ? 'w-40 shrink-0 mt-2' : 'mb-1.5'"
    >
      {{ label }}<span v-if="required" class="ml-0.5 text-danger" aria-hidden>*</span>
    </label>

    <div class="form-field__body min-w-0 flex-1">
      <slot />
      <p
        v-if="error"
        class="mt-1 text-xs text-danger leading-snug"
        role="alert"
        aria-live="polite"
      >
        {{ error }}
      </p>
      <p
        v-else-if="hint"
        class="mt-1 text-xs opacity-55 leading-snug"
      >
        {{ hint }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.form-field--stacked {
  display: flex;
  flex-direction: column;
}

.form-field--inline {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
</style>
