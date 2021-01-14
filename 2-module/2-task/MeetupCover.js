
export const MeetupCover = {

  template: `<div
    :style="link ? \`--bg-url: url('\${link}')\` : \`\${link}\`"
    class="meetup-cover"
  >
  <h1 class="meetup-cover__title" v-if="title">{{title}}</h1>
  </div>`,

  name: 'MeetupCover',

  // Пропсы
  props: {
    link: {
      type: String,
      required: false,
    },
    title: {
      type: String,
      required: false,
    }
  }

};
