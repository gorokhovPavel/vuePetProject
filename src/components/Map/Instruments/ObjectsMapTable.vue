<template>
    <div>
        <gridFilter v-show='getShowingObjects.showTableMap'
            :tableName='curTableName' 
            :tableRows='computedTableData'
            :tableCols='computedColumnsData'>
                <table class='fullSize' >
                    <tr>
                        <td align='left' >
                            <mButton @click='setActionMapObj(false)' > 
                                <img class='imgInButton' :src="require('content/images/cancel.png')" >
                            </mButton>
                        </td>
                        
                        <td align='center' >
                            
                            <!-- {{infoMapLayer}} -->
                            
                            <mButton @click='setChangeModeActiveMapObj("isMarkersActive")' :class='getClassForBoard("isMarkersActive")' > 
                                <img class='imgInButton' :src="require('content/images/point.png')" >
                            </mButton>

                            <mButton @click='setChangeModeActiveMapObj("isMeasureActive")' :class='getClassForBoard("isMeasureActive")' > 
                                <img class='imgInButton' :src="require('content/images/polygon.png')" >
                            </mButton>

                            <mButton @click='setActionChangeDrawMode("isDrawActive")' :class='getClassForBoard("isDrawActive")' v-show='getMapObjProperties.isDrawShow' > 
                                <img class='imgInButton' :src="require('content/images/drawMeasure.png')" >
                            </mButton>
                        </td>

                        <td align='right' >
                            <mButton @click='setActionMapObj(true)' > 
                                <img class='imgInButton' :src="require('content/images/save.png')" >
                            </mButton>
                        </td>
                    </tr>
                </table>
        </gridFilter>
    </div>
</template>

<script>
    
    import { mapGetters, mapMutations, mapActions } from 'vuex' 
    import gridFilter from 'components/Additional/Table/GridFilter'
    import mButton    from 'components/Additional/MButton'
import { log } from 'async';

    export default {

        components : { gridFilter, mButton },
        
        props : [ 'tableData', 'tableName' ],

        data :()=>({

            modalSureSaveName : '',
            curTableData : null,
            curTableName : null,
        }),

        created(){

            this.curTableData = this.tableData.map( x => x.properties );
            this.curTableName = this.tableName;
            this.getInstrument.setImagesForDrawObjects();
        },

        computed : {

            ...mapGetters([ 
                'getLayersIndexes', 
                'getShowingObjects', 
                'getLineOrPolygon', 
                'getLocalMap', 
                'getInstrument', 
                'getClassForBoard', 
                'getMapObjProperties' 
            ]),

            computedTableData(){

                return this.curTableData.map( x => {

                    let currType = x.typeView || x.type;
                    let currIsReport = this.getLineOrPolygon(currType) ? x.isReport : true;
                    let currNumColor = x.numColor || ( this.getLineOrPolygon(currType) ? 3 : 6  );
                    
                    return {
                        type     : currType,
                        name     : x.name,
                        date     : x.data,
                        numColor : currNumColor,     
                        isReport : currIsReport,
                        delete   : null,
                        id       : x.id
                    }
                });
            },
            
            computedColumnsData(){
                return [
                    { isOrder : true,  value : '' },
                    { isOrder : true,  value : this.$lang.messages.tableHeaderName },
                    { isOrder : true,  value : this.$lang.messages.tableHeaderDate },
                    { isOrder : true,  value : '' },
                    { isOrder : true,  value : '' },
                    { isOrder : false, value : '' },
                ]
            }
        },

        methods : {

            ...mapActions([ 'setActionChangeDrawMode' ]),
            ...mapMutations([ 'setCurrentMapValue', 'setShowMode' ]),

            setActionMapObj( isSaveAction ){
            
                this.modalSureSaveName = isSaveAction ? this.$lang.messages.sureSaveMapObj : this.$lang.messages.sureCancelMapObj;
        
                this.setCurrentMapValue({ field : 'activeModal',      value : true });
                this.setCurrentMapValue({ field : 'activeModalTitle', value : this.modalSureSaveName });
                
                this.setCurrentMapValue({ 
                    field : 'activeConfrmDialogAction', 
                    value : {
                        nameAction : 'setConfirmActionMapObj',
                        dataAction : isSaveAction
                    } 
                });
            },

            setChangeModeActiveMapObj(inStateElem){

                this.setShowMode(inStateElem);
                this.getInstrument.setImagesForDrawObjects();
            },
        }
    }
</script>