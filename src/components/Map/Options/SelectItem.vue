<template>
    <div class='md-layout-item'>
       <md-field>
            <md-select class='fullSize'
                v-model='selectedValueInList'
                :id='idChild' md-dense required 
                @md-selected='setChangeSelectList($event, idChild, false)'>
                    <div v-for='(item, index) in listData' :key='index' >
                        <md-option :value='item' v-if='( indexList === 1 )' > 
                            {{item}} 
                        </md-option>
                        <table width='99%' v-else >
                            <tr>
                                <td align='left' width='90%' >
                                   <md-option :value='item' >  
                                        {{item}}
                                    </md-option>
                                </td>
                                <td align='right' >
                                    <md-checkbox 
                                        v-model='getLayersIndexes.selectedDataCheckArr[index]' 
                                        @change='setChangeSelect(index)'
                                        class="md-primary" >
                                    </md-checkbox>
                                </td>
                            </tr>
                        </table>
                    </div>
            </md-select>
        </md-field>
    </div>
</template>

<script>
    import { mapMutations, mapActions, mapGetters } from 'vuex';
import { log } from 'util';
    export default {
        props : [ 'listData', 'indexList', 'idChild' ],
        data :()=> ({
            localSelectedArr : [],
            selectedValueInList : null,
        }),
        computed : {
            ...mapGetters([ 'getInstrument', 'getLayersIndexes' ])
        },
        created() {
            let outValue = this.listData.length - this.indexList;
            outValue = outValue < 0 ? 0 : outValue;            
            this.selectedValueInList = this.listData[outValue];

            this.listData.forEach( (item, index)=> {
                const isCheckData = ( index === this.listData.length - 2 ) ? true : false;
                this.localSelectedArr.push(isCheckData);
            });

            this.setChangeSelectList( this.selectedValueInList, this.idChild, true );
            this.setCurrentMapValue( { field : 'selectedDataCheckArr', value : this.localSelectedArr } );
        },
        methods : {
            ...mapMutations([ 'setPrevSelecting', 'setIndexOfLayer', 'setCurrentMapValue' ]),
            ...mapActions([ 'setRenderDefault' ]),
            setChangeSelectList( e, objId, isFirstCall = false ) {
                //Обновляем состояние индексов
                this.setIndexOfLayer({ 
                    date : e, 
                    idObj : objId 
                });
                //Обнуляем опции перед сменой слоя
                this.setPrevSelecting();
                //Запуск рендеринга
                this.setRenderDefault(true);
                //Перерисовываем метки, если это не стартовый вызов
                if( !isFirstCall ) {
                    this.getInstrument.setImagesForDrawObjects();
                }
            },
            setChangeSelect( inIndex ) {
                //Не даем нажимать чекбокс у последнего элемента
                const maxSelected = this.localSelectedArr.length-1;
                if( inIndex === maxSelected )
                    this.localSelectedArr[inIndex] = !this.localSelectedArr[inIndex];
            }
        },
    }
</script>
<style >
    .md-layout-item {
        width : 97%;
    }
</style>