import Vue from '/vendor/vue.esm.browser.js';

export const app = new Vue({
  el: '#app',

  data() {
    return {
      meetup: null,
      API_URL: 'https://course-vue.javascript.ru/api',
      MEETUP_ID: 5,
      meetupImageUrl: '',

      agendaItemTitles: {
        registration: 'Регистрация',
        opening: 'Открытие',
        break: 'Перерыв',
        coffee: 'Coffee Break',
        closing: 'Закрытие',
        afterparty: 'Afterparty',
        talk: 'Доклад',
        other: 'Другое',
      },

      agendaItemIcons: {
        registration: 'key',
        opening: 'cal-sm',
        talk: 'tv',
        break: 'clock',
        coffee: 'coffee',
        closing: 'key',
        afterparty: 'cal-sm',
        other: 'cal-sm',
      }
    }
  },

  async mounted() {
    this.meetup = await this.fetchMeetup(this.MEETUP_ID);
    this.meetupImageUrl = await this.fetchMeetupImage(this.MEETUP_ID);
  },

  computed: {
    processedMeetup() {
      if (this.meetup) {
        return Object.assign({}, this.meetup, {
          date: new Date(this.meetup.date).toLocaleString(navigator.language, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          meetupImageUrl: this.meetupImageUrl,
          agenda: this.meetup.agenda ? this.meetup.agenda.map(agenda => ({
              ...agenda,
              defaultTitle: this.agendaItemTitles[agenda.type],
              defaultIcon: this.agendaItemIcons[agenda.type],
            })
          ) : null
        });
      }
      return null
    },
  },

  methods: {
    fetchMeetup(meetupId) {
      return fetch(`${this.API_URL}/meetups/${meetupId}`).then( response => response.json())
    },

    fetchMeetupImage(imageId) {
      return fetch (`${this.API_URL}/images/${imageId}`).then(res => res.url)
    }

  },
});

