<template>
  <div v-if="getAllMapState.mapModel" class="divMap noselect">
    <mapbox
      class="map"
      :access-token="getAllMapState.mapModel.accessToken"
      :map-options="{
        style: mapStyle,
        center: getAllMapState.mapModel.center,
        zoom: 15,
        attributionControl: false
      }"
      @map-init="setMapStart"
      @map-render="setMapRendering"
      @map-click="setClick"
      @map-mouseup="setClick"
      @map-dblclick="setDblClick"
      @map-mousemove="setScaleLatLon"
      @map-contextmenu="setContextMenu"
    />
    <OptionMap />
    <ObjectsMapTable :tableName="'mapObjListTable'" />
    <NavigationMap v-if="false" :navLonLat="lonLat" />
    <vueGallery
      :index="getAllMapState.mediaIndex"
      :images="getAllMapState.mediaImageList"
      @close="setStateMapValue({ field: 'mediaIndex', value: null })"
    />
  </div>
</template>

<script>
import { mapActions, mapMutations, mapGetters } from "vuex";
import mapbox from "mapbox-gl-vue";
import vueGallery from "vue-gallery";
import ObjectsMapTable from "./Instruments/ObjectsMapTable.vue";
import NavigationMap from "./Options/NavigationMap.vue";
import OptionMap from "./Options/OptionMap.vue";

export default {
  components: {
    mapbox,
    vueGallery,
    OptionMap,
    NavigationMap,
    ObjectsMapTable
  },
  data: () => ({
    lonLat: "",
    mapStyle: "mapbox://styles/mapbox/emerald-v8"
  }),
  created() {
    this.setStateMapValue({ field: "mapId", value: this.$route.params.Id });
    this.setLoadMapData();
  },
  computed: {
    ...mapGetters(["getAllMapState", "getModalData"])
  },
  methods: {
    ...mapActions([
      "setMapRendering",
      "setActionClick",
      "setActionMoveMouse",
      "setActionDblClick",
      "setLoadMapData"
    ]),
    ...mapMutations(["setStateMapValue"]),
    setMapStart(map) {
      this.setStateMapValue({ field: "curMap", value: map });
      this.setStateMapValue({ field: "showTableMap", value: false });
    },
    setScaleLatLon(map, e) {
      this.lonLat = `${e.lngLat.lat.toFixed(10)} ${e.lngLat.lng.toFixed(10)}`;
      this.setActionMoveMouse(e);
      this.setCloseNotify();
    },
    setClick(map, e) {
      this.setActionClick(e);
    },
    setDblClick(map, e) {
      this.setActionDblClick(e);
    },
    setContextMenu() {
      this.setStateMapValue({ field: "currentInstrument", value: 0 });
    },
    setCloseNotify() {
      if (this.getModalData.activeSnack === true) {
        try {
          setTimeout(() => {
            this.setStateMapValue({ field: "activeSnack", value: false });
          }, 500);
        } catch (error) {
          //todo error handler
        }
      }
    }
  }
};
</script>
<style>
.divMap {
  overflow: hidden;
}
.map {
  width: 102%;
  height: 91vh;
}
.mapboxgl-ctrl-logo {
  visibility: hidden;
}
</style>
