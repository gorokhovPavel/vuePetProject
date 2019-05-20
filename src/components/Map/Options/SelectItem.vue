<template>
    <div class="md-layout-item">
        <md-field>
            <md-select 
                md-dense required 
                :id='idChild' 
                v-model='selectedValueInList' 
                @md-selected='setChangeSelectList($event, idChild)' >
                    <md-option v-for='(item, index) in listData' :key="index" :value='item' >
                        {{item}}
                    </md-option>
            </md-select>
        </md-field>
    </div>
</template>

<script>

    import { mapMutations, mapActions, mapGetters } from 'vuex';
    export default {

        props : [ 'listData', 'indexList', 'idChild' ],
        
        data :()=>({

            selectedValueInList : null,
        }),
        
        computed : {

            ...mapGetters(['getInstrument'])
        },

        created(){

            let outValue = this.listData.length - this.indexList;
            outValue = outValue < 0 ? 0 : outValue;
            this.selectedValueInList = this.listData[outValue];
        },

        methods : {
            
            ...mapMutations([ 'setPrevSelecting', 'setIndexOfLayer' ]),
            ...mapActions([ 'setRenderDefault' ]),

            setChangeSelectList(e, objId){
                
                //Обновляем состояние индексов
                this.setIndexOfLayer({ 
                    date  : e, 
                    idObj : objId 
                });
                
                //Обнуляем опции перед сменой слоя
                this.setPrevSelecting();
                
                //Запуск рендеринга
                this.setRenderDefault(true);

                //Перерисовываем метки
                this.getInstrument.setImagesForDrawObjects();
            }
        },
    }
</script>