import { MeetupCover } from './MeetupCover.js';
import { MeetupDescription } from './MeetupDescription.js';
import { MeetupAgenda } from './MeetupAgenda.js';
import { MeetupInfo } from './MeetupInfo.js';
import { getMeetupCoverLink } from './data.js';

export const MeetupView = {
  name: 'MeetupView',

  template: `
    <div>
      <!-- meetup-cover -->
      <meetup-cover :link="imgUrl" :title="meetup.title"></meetup-cover>
      <div class="container">
        <div class="meetup">
          <div class="meetup__content">
            <h3>Описание</h3>
            <!-- meetup description -->
            <meetup-description v-if="meetup.description" :description="meetup.description"></meetup-description>

            <h3>Программа</h3>
            <!-- meetup agenda -->
            <meetup-agenda v-if="meetup.agenda" :agenda="meetup.agenda"></meetup-agenda>
          </div>
          <div class="meetup__aside">
            <meetup-info :meetup="meetup"></meetup-info>
          </div>
        </div>
      </div>
    </div>`,

  props: {
    meetup: {
      type: Object,
      required: true
    }
  },

  computed: {
    imgUrl() {
      return getMeetupCoverLink(this.meetup);
    }
  },

  components: {
    MeetupDescription,
    MeetupInfo,
    MeetupCover,
    MeetupAgenda
  },

};
