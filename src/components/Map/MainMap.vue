<template>
  <div v-if="getMapModel" class="overHidden divMapAdp noselect">
    <mapbox
      class="map hideBord"
      v-if="getMapModel.accessToken"
      :access-token="getMapModel.accessToken"
      :map-options="{
        style: mapStyle,
        center: getMapModel.center,
        zoom: getZoomMap
      }"
      @map-render="setMapRendering"
      @map-init="setMapStart"
      @map-click="setClick"
      @map-mouseup="setClick"
      @map-dblclick="setDblClick"
      @map-mousemove="setScaleLatLon"
      @map-contextmenu="setContextMenu"
    />
    <OptionMap />
    <ObjectsMapTable :tableName="'mapObjListTable'" />
    <NavigationMap v-if="lonLat" :navLonLat="lonLat" />
    <vueGallery
      :index="getMediaData.mediaIndex"
      :images="getMediaData.mediaImageList"
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
    lonLat: null,
    mapStyle: "mapbox://styles/mapbox/emerald-v8"
  }),
  created() {
    this.setStateMapValue({ field: "mapId", value: this.$route.params.Id });
    this.setStateMapValue({ field: "isLayersRender", value: true });
    this.setLoadMapData();
  },
  computed: {
    ...mapGetters(["getModalData", "getMapModel", "getMediaData", "getZoomMap"])
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
    },
    setClick(map, e) {
      this.setActionClick(e);
    },
    setDblClick(map, e) {
      this.setActionDblClick(e);
    },
    setContextMenu() {
      this.setStateMapValue({ field: "currentInstrument", value: 0 });
    }
  }
};
</script>
<style>
.map {
  overflow: hidden;
  min-height: var(--contentHeight);
}
a.mapboxgl-ctrl-logo,
.mapboxgl-ctrl.mapboxgl-ctrl-attrib.mapboxgl-compact,
.mapboxgl-ctrl-top-right .mapboxgl-ctrl {
  display: none;
}
.mapboxgl-ctrl-attrib {
  display: none;
}
.mapboxgl-ctrl-bottom-left .mapboxgl-ctrl {
  margin: 0 0 15px 10px;
}
</style>
