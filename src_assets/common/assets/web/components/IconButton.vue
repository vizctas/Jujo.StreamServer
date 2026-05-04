<script setup lang="ts">
/**
 * IconButton — compact icon-only or icon+label button with consistent sizing and aria support.
 * Wraps a Naive UI NButton to keep the design system integrated.
 */
withDefaults(
  defineProps<{
    /** Accessible label; required for icon-only buttons */
    label: string;
    /** Size variant: xs = 28px, sm = 32px (default), md = 36px */
    size?: 'xs' | 'sm' | 'md';
    /** Naive UI button type */
    type?: 'default' | 'primary' | 'error' | 'warning' | 'info' | 'success';
    /** Show text label beside the icon */
    showLabel?: boolean;
    disabled?: boolean;
    loading?: boolean;
    circle?: boolean;
  }>(),
  {
    size: 'sm',
    type: 'default',
    showLabel: false,
    disabled: false,
    loading: false,
    circle: false,
  },
);

const emit = defineEmits<{ click: [event: MouseEvent] }>();
</script>

<template>
  <n-button
    :type="type"
    :disabled="disabled"
    :loading="loading"
    :circle="circle"
    :aria-label="label"
    :title="!showLabel ? label : undefined"
    :size="size === 'xs' ? 'tiny' : size === 'sm' ? 'small' : 'medium'"
    class="icon-btn"
    :class="[`icon-btn--${size}`]"
    @click="(e: MouseEvent) => emit('click', e)"
  >
    <slot name="icon" />
    <span v-if="showLabel" class="icon-btn__label">{{ label }}</span>
  </n-button>
</template>

<style scoped>
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 150ms ease-out, opacity 150ms ease-out, transform 150ms ease-out;
}

.icon-btn:active:not(:disabled) {
  transform: scale(0.94);
}

.icon-btn--xs {
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
}

.icon-btn--sm {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
}

.icon-btn--md {
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
}

.icon-btn__label {
  margin-left: 6px;
  font-size: 0.8125rem;
  line-height: 1;
}
</style>
