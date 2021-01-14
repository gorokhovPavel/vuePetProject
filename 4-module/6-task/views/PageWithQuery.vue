<template>
  <div class="container">
    <meetups-view :date.sync="date" :view.sync="view" :participation.sync="participation" :search.sync="search"/>
  </div>
</template>

<script>
import MeetupsView from '../components/MeetupsView';

export default {
  name: 'PageWithQuery',
  components: { MeetupsView },

  data() {
    return {
      date: this.$route.query.date ? this.$route.query.date : 'all',
      participation: this.$route.query.participation ? this.$route.query.participation : 'all',
      view: this.$route.query.view ? this.$route.query.view : 'list',
      search: this.$route.query.search ? this.$route.query.search : '',
    }
  },

  computed: {
    routeQuery() {
      return this.$route.query
    }
  },

  watch: {
    date: function () {
      this.routerReplace();
    },

    participation: function () {
      this.routerReplace();
    },

    search: function () {
      this.routerReplace();
    },

    view: function () {
      this.routerReplace();
    },

    routeQuery: {
      immediate: true,
      handler: function() {
        this.date = this.$route.query.date ? this.$route.query.date  : 'all';
        this.participation = this.$route.query.participation ? this.$route.query.participation : 'all';
        this.view = this.$route.query.view ? this.$route.query.view : 'list';
        this.search = this.$route.query.search ? this.$route.query.search : '';
      },
    },
  },

  methods: {
    routerReplace() {
      this.$router.replace({
        query: {
          date: (this.date === 'all') ? undefined : this.date,
          participation: (this.participation === 'all') ? undefined : this.participation,
          view: (this.view === 'list') ? undefined : this.view,
          search: (this.search === '') ? undefined : this.search,
        }
      }).catch(err => {
        if (err.name !== 'NavigationDuplicated') {
          throw err;
        }
      });
    }
  }

};
</script>

<style scoped></style>
