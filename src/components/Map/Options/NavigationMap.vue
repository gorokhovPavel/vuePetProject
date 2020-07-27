<template>
  <div>
    <div class="absolute navigationPosAdp navigationStyle">
      <a-button class="" @click="setZoomUp" icon="plus-circle" />
      <a-button class="" @click="setZoomDown" icon="minus-circle"></a-button>
      <a-button class="" @click="setGoToStart" icon="compass"></a-button>
    </div>
    <span class="absolute scaleLonLat scaleLonLatPosAdp">
      {{ navLonLat }}
    </span>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
export default {
  props: ["navLonLat"],
  data: () => ({
    zoom: null
  }),
  created() {
    this.zoom = this.getZoomMap;
  },
  computed: {
    ...mapGetters(["getLocalMap", "getMapModel", "getZoomMap"])
  },
  methods: {
    setZoomUp() {
      this.zoom += 1;
      this.getLocalMap.zoomTo(this.zoom);
    },
    setZoomDown() {
      this.zoom -= 1;
      this.getLocalMap.zoomTo(this.zoom);
    },
    setGoToStart() {
      this.zoom = this.getZoomMap;
      this.getLocalMap.fitBounds(
        [this.getMapModel.center, this.getMapModel.center],
        {
          maxZoom: this.getZoomMap
        }
      );
    }
  }
};
</script>

<style>
.navigationStyle {
  display: flex;
}
.navigationStyle > button {
  width: 45px;
  margin-right: 10px;
}
.scaleLonLat {
  color: var(--kpmg);
}
</style>
