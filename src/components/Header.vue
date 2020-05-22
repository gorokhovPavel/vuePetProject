<template>
  <div>
    <Loader :flag="getAllMapState.loading" />
    <MDialog />
    <md-toolbar class="md-primary">
      <table class="fullSize">
        <tr>
          <td width="95%">
            <md-button to="/">KPMG SiteSurveyor</md-button>
          </td>
          <td align="right">
            <md-button class="md-icon-button md-primary" @click="setGoLanding">
              <img class=" point" :src="require(`@/content/images/help.png`)" />
            </md-button>
          </td>
          <td align="right">
            <md-button class="md-icon-button md-primary" to="/AccountData">
              <img class=" point" :src="require(`@/content/images/user.png`)" />
            </md-button>
          </td>
          <td align="right">
            <md-button class="md-icon-button md-primary">
              <img
                class=" point"
                v-if="getAllMapState.isRuLang"
                :src="require(`@/content/images/ru.png`)"
                @click="setChangeLang"
              />
              <img
                class=" point"
                v-else
                :src="require(`@/content/images/en.png`)"
                @click="setChangeLang"
              />
            </md-button>
          </td>
        </tr>
      </table>
    </md-toolbar>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
import { api } from "../api";
import MDialog from "./Additional/MDialog.vue";
import Loader from "./Additional/Loader.vue";

export default {
  components: { Loader, MDialog },
  created() {
    this.setLanguageValue();
  },
  computed: {
    ...mapGetters(["getAllMapState", "getAllAuthState", "getCheckFormIsAuth"])
  },
  methods: {
    ...mapMutations(["setStateMapValue"]),
    setGoLanding() {
      //Переход на страницу лендинга - срабатывает только на проде, там роутинг на другое приложение
      const baseUrl = "https://www.sitesurveyor.ru";
      const _landingUrl = process.env.NODE_ENV === "production" ? baseUrl : "/";
      window.location.replace(_landingUrl);
    },
    setLanguageValue() {
      //Смена флажка языка и занесение его в хедер для серверных запросов/ответов
      let lang = this.getAllMapState.isRuLang ? "ru" : "en";
      this.$lang.setLang(lang);
      api.setLangToHeader(lang);
    },
    setChangeLang() {
      //Смена языка
      this.setStateMapValue({
        field: "isRuLang",
        value: !this.getAllMapState.isRuLang
      });
      this.setLanguageValue();
      //Смотрим на имя текущего компонета и на список исключений, где локализация не меняется
      const nameOfComponent = this.$route.name;
      const isAuthForm = this.getCheckFormIsAuth(nameOfComponent, true);
      //Костыль - перенаправляемся на другой компонент, потом обратно, иначе локализация не сработает
      if (isAuthForm) {
        this.$route.push(`/Base`);
        setTimeout(() => this.$route.push(`/${nameOfComponent}`), 1);
      }
    }
  }
};
</script>

<style>
.md-toolbar {
  background: #00338d !important;
}
.router-link-active {
  text-decoration: none;
}
</style>
