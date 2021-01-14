<template>
  <main class="main">
    <div class="page page_onboarding">
      <div class="container">
        <h1 class="page__title text-center">{{title}}</h1>
        AuthLayout
      </div>
    </div>
  </main>

</template>

<script>
export default {
  name: 'AuthLayout',
  props: {
    title: {
      required: true,
      type: String
    }
  }
};
</script>

<style scoped>
.page.page_onboarding {
  max-width: 374px;
  width: 100%;
  margin: 0 auto;
}

</style>
