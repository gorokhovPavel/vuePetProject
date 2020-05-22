<template>
  <BaseAuth :modelAuth="modelObj" />
</template>

<script>
import { mapGetters } from "vuex";
import BaseAuth from "../components/Auth/ExctAuth/BaseAuth.vue";

export default {
  components: { BaseAuth },
  computed: {
    ...mapGetters(["getAllAuthState", "getAuthHeadLogoInSuccessAuth"])
  },
  data: () => ({
    modelObj: null
  })
};
</script>
