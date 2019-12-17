<template>
    <!-- typeTd - свойство, в зависимости от него будет отрисована определенная форма, подробности в computed -->
    <td v-if='( typeTd !== 0 )' :style='{ "text-align" : styleAlignTd }' @click='setSelectTr' >
        <mButton v-if='( typeTd === 1 )' @click='setActionMapObj' >
            <img class='imgInButton' v-if='( typeTd === 1 )' :src="require(`content/images/${row}.png`)" >
        </mButton>  
        <mButton v-if='( typeTd === 5 )' @click='setDeleteMapObj' >
            <img v-if='( typeTd === 5 )' class='imgInButton' :src="require(`content/images/delete.png`)" >
        </mButton> 
        <md-checkbox
            v-if='( typeTd === 3 )' v-show='isLineOrPolygon' 
            class='md-primary mapObjIncludeReport' 
            v-model='selectedItem' @change='setChangeTdOfMapObj(typeTd)' 
        />
        <div v-if='( typeTd === 4 )' v-show='isLineOrPolygon' >
            <select v-model='selectedItem' @change='setChangeTdOfMapObj(typeTd)' 
                :style="{ 'background-color' : selectedColor }" class='round point mapObjColor' >
                    <option
                        v-for='item in listOfColors' 
                        :style="{ 'background-color' : item.value }"
                        :key='item.id' 
                        :value='item.id' />               
            </select>
        </div>
        <p v-if='( typeTd === 6 )' > 
            {{row}} 
        </p>
    </td>
</template>
<script>
    import { mapMutations, mapGetters, mapActions } from 'vuex'
    import ext from 'services/AddExtension'
    import mButton from 'components/Additional/MButton'
    import Instrument from 'services/InstrumentsData'

    export default {
        components : { mButton },
        props : [ 'column', 'row', 'isLineOrPolygon', 'tableNameState', 'allObjTr' ],
        data :()=>({
            selectedItem : null,
            selectedColor : null,
            listOfColors : null,
            mapObjId : null,
            mapObjElem : null,
        }),
        computed : {
            ...mapGetters([ 'getAllMapState', 'getInstrument' ]),
            //Проставляем отпределенный коэффициент типу столбца
            typeTd() {
                let tdTypeInt = 0;
                switch( this.column ){
                    case 'id' : tdTypeInt = 0; break;
                    case 'type' : tdTypeInt = 1; break;
                    case 'isReport' : tdTypeInt = 3; break;
                    case 'numColor' : tdTypeInt = 4; break;
                    case 'delete' : tdTypeInt = 5; break;
                    default : tdTypeInt = 6;
                }
                return tdTypeInt;
            },
            styleAlignTd() {
                let _alignStyle = null;
                switch( this.typeTd ) {
                    case 1 : _alignStyle = 'left'; break;
                    case 5 : _alignStyle = 'right'; break;
                    default : _alignStyle = 'center';
                }
                return _alignStyle;
            }
        },
        created() {
            this.mapObjId = this.allObjTr.id;
            this.listOfColors = ext.getListColor();
            if( this.isLineOrPolygon ) {
                this.selectedItem = this.row;
            }
            if( this.typeTd === 4 ) {
                this.selectedColor = ext.getValueFromNum( this.listOfColors, this.row );   
            }
        },
        methods : {
            ...mapMutations(['setCurrentMapValue']),
            setSelectTr() {
                this.mapObjElem = this.getInstrument.getFetureList( this.mapObjId );
                if( !this.mapObjElem ) return;
                this.getInstrument.setImagesForDrawObjects( this.mapObjId );
                this.getInstrument.setAddPopUp( this.mapObjElem );
                //Проверяем на тип элемента
                if ( this.mapObjElem[0].geometry.type !== 'Point' ) {
                    this.getInstrument.setToggleDrawObjFromMap(true);
                    this.getAllMapState.mapObjListDraw.changeMode( 'direct_select', { featureId : this.mapObjId } );
                }
            },
            setChangeTdOfMapObj( inTypeTd ) {
                
                let arrObj = this.getAllMapState[this.tableNameState];
                let elemOfChangeArr = arrObj.find( x => x.id === this.mapObjId );
                let indexOfchangeArr = arrObj.indexOf( elemOfChangeArr );
                let colorNumber = elemOfChangeArr.numColor;
                let reportValue = elemOfChangeArr.isReport;
                let curDrawObj = this.getAllMapState.mapObjListDraw;
                let curMapObj = this.getAllMapState.curMap;

                //Формируем значение поля, или включение в отчет, или цвет элемента
                if( inTypeTd === 3 ) {
                    reportValue = this.selectedItem;
                } else {
                    this.selectedColor = ext.getValueFromNum( this.listOfColors, this.selectedItem );
                    colorNumber = this.selectedItem;
                }

                //Формируем полностью весь элемент для коллекции в таблицу объектов
                elemOfChangeArr = {
                    action : elemOfChangeArr.action,
                    numColor : colorNumber,
                    date : elemOfChangeArr.date,
                    id : elemOfChangeArr.id,
                    name : elemOfChangeArr.name,
                    isReport : reportValue,
                    type : elemOfChangeArr.type
                }
                //Меняем этот элемент 
                arrObj.splice( indexOfchangeArr, 1, elemOfChangeArr );
                //Записываем текущее состояние таблицы объектов в стейт
                this.setCurrentMapValue({
                    field : this.tableNameState,
                    value : arrObj
                });
                //И вызываем метод, что перерисовывает геометрические объекты на карте
                this.getInstrument.setImagesForDrawObjects( this.mapObjId );
            },
            setActionMapObj() {
                this.mapObjElem = this.getInstrument.getFetureList( this.mapObjId );
                this.getInstrument.setActionInstrumnentGoMath( this.mapObjElem[0] );
            },
            setDeleteMapObj() {
                this.mapObjElem = this.getInstrument.getFetureList( this.mapObjId );
                this.getInstrument.setDeleteExistObject( this.mapObjElem[0] );
            }
        }
    }
</script>
<style >
    .mapObjIncludeReport {
        margin : 5px;
    }
    .mapObjColor {
        opacity : .75;
    }
</style>