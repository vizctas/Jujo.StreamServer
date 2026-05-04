<script setup lang="ts">
/**
 * SectionCard — consistent container for settings panels and content sections.
 * Provides a rounded card with optional header, title, description and footer slot.
 */
withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    /** Extra classes on the card wrapper */
    class?: string;
    /** Remove all padding (useful when content handles its own spacing) */
    flush?: boolean;
  }>(),
  {
    flush: false,
  },
);
</script>

<template>
  <div
    class="section-card rounded-lg border border-dark/10 bg-white/80 shadow-sm backdrop-blur dark:border-light/10 dark:bg-surface/80"
    :class="[flush ? '' : 'p-5 sm:p-6', $props.class ?? '']"
  >
    <!-- Header slot or title/description fallback -->
    <div v-if="$slots['header'] || title" class="section-card__header mb-4">
      <slot name="header">
        <div v-if="title || description" class="space-y-0.5">
          <h3 v-if="title" class="text-sm font-semibold text-dark dark:text-light leading-snug">
            {{ title }}
          </h3>
          <p v-if="description" class="text-xs leading-relaxed opacity-60">{{ description }}</p>
        </div>
      </slot>
    </div>

    <!-- Main content -->
    <slot />

    <!-- Optional footer -->
    <div v-if="$slots['footer']" class="section-card__footer mt-4 pt-4 border-t border-dark/8 dark:border-light/8">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.section-card {
  transition: box-shadow 150ms ease-out;
}
</style>
