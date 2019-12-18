<template>
    <gridFilter v-show='getShowingObjects.showTableMap' :tableName='curTableName' >
        <table class='fullSize' >
            <tr>
                <td align='left' >
                    <mButton @click='setActionMapObj(false)' > 
                        <img class='imgInButton' :src="require('content/images/cancel.png')" >
                    </mButton>
                </td>
                <td align='center' >
                    <mButton @click='setActiveAllDraws()' :class='getClassForBoard("isMarkersActive")' > 
                        <img class='imgInButton' :src="require('content/images/alldraws.png')" >
                    </mButton>
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
</template>

<script>
    import { mapGetters, mapMutations, mapActions } from 'vuex';
    import gridFilter from 'components/Additional/Table/GridFilter';
    import mButton from 'components/Additional/MButton';
    export default {
        components : { gridFilter, mButton },
        props : [ 'tableName' ],
        data :()=>({
            modalSureSaveName : '',
        }),
        created() {
            this.curTableName = this.tableName;
        },
        computed : {
            ...mapGetters([ 
                'getShowingObjects', 
                'getInstrument', 
                'getClassForBoard', 
                'getMapObjProperties' 
            ]),
        },
        methods : {
            ...mapActions([ 'setActionChangeDrawMode' ]),
            ...mapMutations([ 'setCurrentMapValue', 'setShowMode' ]),
            setActionMapObj( isSaveAction ) {
                this.modalSureSaveName = isSaveAction ? this.$lang.messages.sureSaveMapObj : this.$lang.messages.sureCancelMapObj;
                this.setCurrentMapValue({ field : 'activeModal', value : true });
                this.setCurrentMapValue({ field : 'activeModalTitle', value : this.modalSureSaveName });  
                this.setCurrentMapValue({ 
                    field : 'activeConfrmDialogAction', 
                    value : {
                        nameAction : 'setConfirmActionMapObj',
                        dataAction : isSaveAction
                    } 
                });
            },
            setChangeModeActiveMapObj( inStateElem ) {
                this.setShowMode(inStateElem);
                this.getInstrument.setImagesForDrawObjects();
            },
            setActiveAllDraws() {
                this.setChangeModeActiveMapObj("isMarkersActive");
                this.setChangeModeActiveMapObj("isMeasureActive");
                this.setActionChangeDrawMode("isDrawActive");
            }
        }
    }
</script>