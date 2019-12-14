<template>
  <div v-if='getAllMapState.mapModel' class='divMap noselect' >
    <mapbox class='map'
      :access-token = getAllMapState.mapModel.accessToken
      :map-options ="{
        style : mapStyle,
        center : getAllMapState.mapModel.center,
        zoom : 15,
        attributionControl : false
      }"
      @map-init = 'setMapStart' 
      @map-render = 'setMapRendering'
      @map-click = 'setClick'
      @map-mouseup = 'setClick'
      @map-dblclick = 'setDblClick'
      @map-mousemove = 'setScaleLatLon' 
      @map-contextmenu = 'setContextMenu' 
    />
    
    <optionMap />    
    <objectsMapTable :tableName='"mapObjListTable"' />
    <navigationMap v-if='false' :navLonLat='lonLat' />

    <vueGallery
      :index ='getAllMapState.mediaIndex'
      :images='getAllMapState.mediaImageList'
      @close="setCurrentMapValue({ field : 'mediaIndex', value : null })" 
    />
  </div>
</template>

<script>
  import { mapActions, mapMutations, mapGetters } from 'vuex'
  import mapbox from 'mapbox-gl-vue'
  import vueGallery from 'vue-gallery'   
  import optionMap from 'components/Map/Options/OptionMap'
  import navigationMap from 'components/Map/Options/NavigationMap'
  import objectsMapTable from 'components/Map/Instruments/ObjectsMapTable'

  export default {
    components : { 
      mapbox, optionMap, navigationMap, vueGallery, objectsMapTable
    },
    data :() => ({
      lonLat : '',
      mapStyle : 'mapbox://styles/mapbox/emerald-v8',
    }),
    created() {
      this.setCurrentMapValue( { field : 'mapId', value : this.$route.params.Id } );
      this.setLoadMapData();
    },
    computed : {
      ...mapGetters([ 'getAllMapState', 'getModalData' ])
    },
    methods : {
      ...mapActions( [ 'setMapRendering', 'setActionClick', 'setActionDblClick', 'setLoadMapData' ] ),
      ...mapMutations( [ 'setMapStart', 'setCurrentMapValue' ] ),
      setScaleLatLon(map, e) {
        this.lonLat = `${e.lngLat.lat.toFixed(10)} ${e.lngLat.lng.toFixed(10)}`;
        this.setCloseNotify();
      },
      setClick(map, e) { 
        this.setActionClick(e);
      },
      setDblClick(map, e) {
        this.setActionDblClick(e);
      },
      setContextMenu(map, e) {
        this.setCurrentMapValue( { field : 'currentInstrument', value : 0 } );
      },
      setCloseNotify() {
        if( this.getModalData.activeSnack === true ) {
          try {
            setTimeout( ()=> {
              this.setCurrentMapValue( { field : 'activeSnack', value : false } );
            }, 500 );
          } catch (error) {
            //todo error handler
          }
        }
      },
    }
  };
</script>

<style>
  .divMap { 
    overflow : hidden;
  }
  .map {
    width : 102%;
    height : 91vh;
  }
  .mapboxgl-ctrl-logo { 
    visibility : hidden; 
  }
</style>