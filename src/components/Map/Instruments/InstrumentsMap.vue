<template>
    <table>
        <!-- Панель с набором инструментом-->
        <frameLayer 
            class='move listOfInstrumentsPos'
            :isExit = 'false'
            :inShowParam='getAllMapState.showInstrumentsList'
            :showName='"showInstrumentsList"' >

            <mButton v-for='item in getAllMapState.listOfInstruments' :key="item.Id" 
                :class="{ 
                    onBord   : getAllMapState.currentInstrument === item.id,
                    hideBord : getAllMapState.currentInstrument !== item.id
                }" 
                @click='setActivateDrawAction(item.id)' >
                <img class='imgInButton' :src="require(`content/images/${item.name}.png`)" >
            </mButton>   
        </frameLayer>

        <!-- 2Д и 3Д графики-->
        <frameLayer class='move measGraphMapPos' 
            :isExit = 'true'
            :isSave = 'true'
            :inWidth='getFrameContentWidthPx(35)'    
            :inShowParam='getAllMapState.showGraphPlotChart' 
            :showName='"showGraphPlotChart"' >
                <measGraphMap/>
        </frameLayer>

        <!-- Медиа -->
        <frameLayer class='move mediaPos'
            :isExit = 'true'
            :isSave = 'true'
            :inWidth='getFrameContentWidthPx(35)'    
            :inShowParam='getAllMapState.showPhoto' 
            :showName='"showPhoto"' >
                <mediaToMap />
        </frameLayer>
    </table>    
</template>

<script>
    
    import { mapActions, mapMutations, mapGetters } from 'vuex'

    import frameLayer    from 'components/Map/Options/FrameLayer'
    import measGraphMap  from 'components/Map/Instruments/MeasGraphMap'
    import mediaToMap    from 'components/Map/Instruments/MediaToMap'
    import mButton       from 'components/Additional/MButton'
    import ext           from 'services/AddExtension'

    export default {

        components : { frameLayer, measGraphMap, mediaToMap, mButton },

        created(){

            this.setCurrentMapValue({ field : 'mapObjListDraw', value : null });
            this.setCurrentMapValue({ field : 'flagOfMapObj', value : false });
            this.setCurrentMapValue({ field : 'activeModal', value : false });
        },

        computed : {

            ...mapGetters([ 'getAllMapState', 'getFrameContentWidthPx' ]),
        },
        
        methods : {

            ...mapActions( [ 'setActivateDrawAction', 'setMouseDownUpOnGraph' ] ),
            ...mapMutations( [ 'setCurrentMapValue' ] )
        }
    }
</script>

<style>

    .mapboxgl-ctrl-group {
    
        display : none;
    }

    .measGraphMapPos {

        top   : 25%;
        left  : 25%;
    }

    .mediaPos {

        top   : 30%;
        left  : 30%;
    }

    .listOfInstrumentsPos {

        top   : 11%;
        left  : 35%;
    }
</style>