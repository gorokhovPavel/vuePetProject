<template>
    <div>
        <div id='graphPlotChart' 
            @mousedown='setMouseDownUpOnGraph(false)' 
            @mouseleave='setMouseDownUpOnGraph(true)'
            :style="{ 
                width  : (getFrameContentWidthPx(35)-20)+'px', 
                height : (getFrameContentWidthPx(35)/2)+'px' 
            }">
        </div>   
        
        <tbl2Buttons id='graphChartSet'
            :firButName='$lang.messages.mainLayerName'
            :secButName='$lang.messages.addLayerName'
            @firButClick='setVisible3d(true)'
            @secButClick='setVisible3d(false)'>
                <p id='graphChartInfo'></p>
        </tbl2Buttons>
    </div>
</template>

<script>

    import { mapActions, mapGetters } from 'vuex'
    import tbl2Buttons from 'components/Additional/BottomTable2Buttons'

    export default {

        components : { tbl2Buttons },

        computed : {

            ...mapGetters([ 'getFrameContentWidthPx', 'getMediaData' ]),
        },

        methods : {
            
            ...mapActions( [ 'setVisible3d', 'setMouseDownUpOnGraph' ] ),
        }
    }

</script>

<style>
    

</style>