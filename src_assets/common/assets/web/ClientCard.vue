<template>
  <div class="card p-2">
    <div class="card-body">
      <h2>{{ $t('client_card.clients') }}</h2>
      <br />
      <p>{{ $t('client_card.clients_desc') }}</p>
      <div class="card-group p-4 align-items-center">
        <a
          v-for="{ platform, icon, name, link } of clients"
          class="btn m-1"
          :class="[(link && 'btn-success') || 'btn-secondary']"
          :href="link"
          target="_blank"
          @click="shouldOpen($event, link)"
          ><LucideIcon v-if="icon" :name="icon" :size="16" class="inline-block" /> <span class="platform-text">{{ platform }}</span> [
          {{ name }} ]
        </a>
      </div>
      <i>* {{ $t('client_card.generic_moonlight_clients_desc') }}</i>
    </div>
  </div>
</template>

<style scoped>
.platform-text {
  font-weight: bold;
}
</style>

<script setup>
import LucideIcon from '@/components/LucideIcon.vue';
const clients = [
  {
    platform: 'Android',
    icon: 'fa-mobile',
    name: 'Artemis',
    link: 'https://github.com/ClassicOldSong/moonlight-android',
  },
  {
    platform: 'iOS',
    icon: 'fa-laptop',
    name: 'Coming soon...',
    link: '',
  },
  {
    platform: 'Desktop',
    icon: 'fa-desktop',
    name: 'Coming soon...',
    link: '',
  },
];

const shouldOpen = (e, link) => {
  if (!link) {
    e.preventDefault();
  }
};
</script>
