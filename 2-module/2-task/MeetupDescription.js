export const MeetupDescription = {
  template: `<p class="meetup-description">{{description}}</p>`,

  name: "MeetupDescription",

  props: {
    description: {
      type: String,
      required: false,
    }
  }

};
