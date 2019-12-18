<template>
    <div>
        <div id='graphPlotChart' 
            @mousedown='setMouseDownUpOnGraph(false)' 
            @mouseleave='setMouseDownUpOnGraph(true)'
            :style="{ 
                width : (getFrameContentWidthPx(35)-20)+'px', 
                height : (getFrameContentWidthPx(35)/2)+'px' 
            }">
        </div>   
        <table class='fullSize' border='0' v-show='getShowingObjects.show3DPanel' >
            <tr>
                <td colspan="2" align='center' >
                    <div id='graphChartInfo' ></div>
                </td>
            </tr>
            <tr>
                <td valign='bottom' align='left' width='50%' :v-if='false' >
                    <mButton @click='setVisible3d(true)' :class="{ onBord : isMainButActive, hideBord : !isMainButActive }" > 
                        {{$lang.messages.mainLayerName}}
                    </mButton> 
                </td>
                <td valign='bottom' align='right' width='50%' v-show='getShowingObjects.isActiveAddLayer' >
                    <mButton @click='setVisible3d(false)' :class="{ onBord : isAddButActive, hideBord : !isAddButActive }" > 
                        {{$lang.messages.addLayerName}}
                    </mButton> 
                </td>
            </tr>
        </table>
    </div>
</template>

<script>
    import { mapActions, mapGetters } from 'vuex'
    import buildChart from 'services/BuildChart'
    import mButton from 'components/Additional/MButton'
    export default {
        components : { mButton },
        data : ()=>({
            isMainButActive : true,
            isAddButActive : true
        }),
        computed : {
            ...mapGetters([ 'getFrameContentWidthPx', 'getShowingObjects' ]),
        },
        methods : {  
            setVisible3d( isMain ) {
                const myDivObj = document.querySelector('#graphPlotChart');
                const [ indexLayer, nameLayer ] = isMain ? [ 0, 'isMainButActive' ] : [ 1, 'isAddButActive' ];

                if( !myDivObj.data ) 
                    return;

                const visGraph = myDivObj.data[indexLayer].visible;
                [ myDivObj.data[indexLayer].visible, this[nameLayer] ] = 
                    ( !visGraph  || visGraph === 'visibility' ) ?  [ 'legendonly', false ] : [ 'visibility', true ];

                buildChart.setResstartChart(myDivObj);
            },
            setMouseDownUpOnGraph( isUp ) {
                const parentFrame = document.querySelector('.measGraphMapPos');
                if ( parentFrame.classList ) {
                    if ( isUp )
                        parentFrame.className = parentFrame.className + ' move';
                    else 
                        parentFrame.className = parentFrame.className.replace(/\bmove\b/g, '');
                }
            },
        }
    }
</script>