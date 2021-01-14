export const CounterButton = {

  template: '<button @click="increment" type="button">{{count}}</button>',

  name: 'CounterButton',

  props: {
    count: {
      default: 0,
      type: Number
    }
  },

  model: {
    prop: 'count',
    event: 'increment'
  },

  methods: {
    increment() {
      this.$emit('increment', this.count + 1);
    }
  }


};
