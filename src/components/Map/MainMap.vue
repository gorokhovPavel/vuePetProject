<template>
  <div v-if='getAllMapState.mapModel' class='divMap' >

    <mapbox class='map'

      :access-token = getAllMapState.mapModel.accessToken

      :map-options ="{
        style  : mapStyle,
        center : getAllMapState.mapModel.center,
        zoom   : 15,
        attributionControl : false
      }"

      @map-init   = 'setMapStart' 
      @map-render = 'setMapRendering'
      @map-click  = 'setClick'
      @map-dblclick  = 'setDblClick'
      @map-mousemove = 'setScaleLatLon' 
      @map-contextmenu = 'setContextMenu' />
    
    <optionMap />    

    <instrumentsMap />
    
    <objectsMapTable 
      v-if='getListOfMapObj'
      :tableData='getListOfMapObj'
      :tableName='"mapObjListTable"' />

    <navigationMap 
      v-if='false'
      :navLonLat='lonLat' />
    
    <vueGallery
      :index ='getAllMapState.mediaIndex'
      :images='getAllMapState.mediaImageList'
      @close="setCurrentMapValue({ field : 'mediaIndex', value : null })" />

  </div>
</template>

<script>

  import { mapActions, mapMutations, mapGetters } from 'vuex'
  
  import mapbox          from 'mapbox-gl-vue'
  import vueGallery      from 'vue-gallery'   
  import optionMap       from 'components/Map/Options/OptionMap'
  import navigationMap   from 'components/Map/Options/NavigationMap'
  import instrumentsMap  from 'components/Map/Instruments/InstrumentsMap'
  import objectsMapTable from 'components/Map/Instruments/ObjectsMapTable'

  export default {

    components : { 
      mapbox, optionMap, navigationMap, instrumentsMap, vueGallery, objectsMapTable
    },

    data :() => ({

      mapStyle : 'mapbox://styles/mapbox/emerald-v8',
      lonLat   : ''
    }),

    created(){
      
      this.setCurrentMapValue( { field : 'mapId', value : this.$route.params.Id } );
      this.setLoadMapData();
    },

    computed: {
          
      ...mapGetters([ 'getAllMapState', 'getListOfMapObj', 'getModalData' ])
    },

    methods: {
      
      ...mapActions( [ 'setMapRendering', 'setActionClick', 'setActionDblClick', 'setLoadMapData' ] ),
      ...mapMutations( [ 'setMapStart', 'setCurrentMapValue' ] ),

      setScaleLatLon(map, e){

        this.lonLat = `${e.lngLat.lat.toFixed(6)} ${e.lngLat.lng.toFixed(6)}`;
        this.setCloseNotify();
      },

      setClick(map, e) { 
        
        this.setActionClick(e);
      },

      setDblClick(map, e){
        
        this.setActionDblClick(e);
      },

      setContextMenu(map, e){

        this.setCurrentMapValue( { field : 'currentInstrument', value : 0 } );
      },

      setCloseNotify(){

        if( this.getModalData.activeSnack === true ){
          
          try{

            setTimeout( ()=>{

              this.setCurrentMapValue( { field : 'activeSnack', value : false } );
            }, 500 );
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
    
    overflow : hidden;
  }

  .map {

    display        : flex;
    flex-direction : column;
    overflow       : hidden;
    width          : 102%;
    height         : calc(100vh - 73px);
  }

  .mapboxgl-ctrl-logo {
    
    visibility  : hidden; 
  }

</style>