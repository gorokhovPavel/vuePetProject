<template>
  <button @click="onclick" type="button">{{count}}</button>
</template>

<script>

export default {
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
    onclick() {
      this.$emit('increment', this.count + 1);
    }
  }

}
</script>
