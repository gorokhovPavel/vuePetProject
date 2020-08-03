<template>
  <div class="incCardContainer">
    <a-card
      v-for="item in incData"
      :key="item.key"
      class="incCard pointer"
      :title="item.inc"
    >
      <p class="incCardDesc">{{ item.desc }}</p>
      <p class="bold upperCase">{{ item.status }}</p>
      <div class="fullSize flex justBetween">
        <p>{{ item.createDt }}</p>
        <p>{{ item.needFixDt }}</p>
      </div>
      <div class="fullSize flex justBetween">
        <p>{{ item.creator }}</p>
        <p>{{ item.responsible }}</p>
      </div>
    </a-card>
  </div>
</template>

<script>
export default {
  props: ["incData"]
};
</script>

<style>
.incCardContainer {
  display: flex;
  align-items: start;
}
.incCard.incCard {
  width: 300px;
  margin: 10px;
}
.incCardDesc {
  min-height: 10vh;
}
</style>
