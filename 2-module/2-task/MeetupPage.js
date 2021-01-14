import { MeetupView } from './MeetupView.js';
import { MEETUP_ID, fetchMeetup } from './data.js';

export const MeetupPage = {
  name: 'MeetupPage',

  template: `<div>
    <meetup-view v-if="meetup" :meetup="meetup"></meetup-view>
  </div>`,

  // Components
  components: {
    MeetupView
  },

  // Data
  data() {
    return {
      meetup: null
    }
  },

  // Mounted
  async mounted() {
    this.meetup = await this.getMeetup(MEETUP_ID)
  },

  // Methods
  methods: {
    getMeetup(id) {
      return fetchMeetup(id);
    }
  }

};
