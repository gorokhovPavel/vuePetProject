export const MeetupInfo = {
  template: `<ul class="info-list">
      <li>
        <img class="icon info-list__icon" alt="icon" src="/assets/icons/icon-user.svg" />
        {{meetup.organizer}}
      </li>
      <li>
        <img class="icon info-list__icon" alt="icon" src="/assets/icons/icon-map.svg" />
        {{meetup.place}}
      </li>
      <li>
        <img class="icon info-list__icon" alt="icon" src="/assets/icons/icon-cal-lg.svg" />
        <time datetime="2020-01-01">{{processedMeetup.date}}</time>
      </li>
    </ul>`,

  name: 'MeetupInfo',

  // Пропсы
  props: {
    meetup: {
      type: Object,
      required: true,
    }
  },

  // computed
  computed: {
    processedMeetup() {
      return Object.assign({}, this.meetup, {
        date: new Date(this.meetup.date).toLocaleString(navigator.language, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      })
    }
  }

};
