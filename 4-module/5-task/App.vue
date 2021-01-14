<template>
  <div>
    <nav>
      <router-link :to="{ name: 'meetups' }">Митапы</router-link> |
      <router-link :to="{ name: 'form' }">Создать митап</router-link> |
      <router-link :to="{ name: 'login' }">Вход</router-link>
    </nav>
    <base-layout id="app">
      <router-view />
    </base-layout>
  </div>
</template>

<script>
import BaseLayout from './components/BaseLayout';
export default {
  name: 'App',
  components: { BaseLayout },
  created() {
    this.$router.replace('/');
  },
};
</script>

<style scoped></style>
