<template>
  <Troubleshooting />
</template>

<script>
import { useConfigStore } from '@/stores/config';
import { http } from '@/http';
import LucideIcon from '@/components/LucideIcon.vue';
import Troubleshooting from '@/Troubleshooting.vue';

export default {
  name: 'TroubleshootingView',
  components: {
    Troubleshooting,
    LucideIcon,
  },
};
</script>
