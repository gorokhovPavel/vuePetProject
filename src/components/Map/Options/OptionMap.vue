<template>

  <div class='optionMap abs' >
      
    <!-- Отображение карточки опций -->
    <mButton 
        v-show='!getAllMapState.showOptionContent'
        @click="setShowMode('showOptionContent')" >
        <img class='imgInButton' :src="require('content/images/changelayer.png')" >
    </mButton>   
    
    <md-card md-with-hover class='optionMapDiv card-expansion' v-show='getAllMapState.showOptionContent' >
        
        <!-- Список кнопок с опциями для карты, список - MapStore.state.getAllMapState.listOfOptions -->
        <md-card-content>
            <mButton v-for='item in getAllMapState.listOfOptions' :key="item.objName"
                :class="getClassForBoard(item.objName)"
                @click="setOptionHead(item.objName)" >
                    <img class='imgInButton' :src="require(`content/images/${item.imgName}.png`)" >
            </mButton>
        </md-card-content>
        
        <md-card-content>
            <!-- Логотип основного слоя и его выпадающий список -->
            <span class="md-body-2">{{$lang.messages.mainLayerName}}</span>
            <selectItem :idChild="'mainLayer'" :listData='dateConfigList' :indexList='1' > </selectItem>
            
            <table class='fullSize' border='0' >
                <!-- Логотип доп слоя и кнопка смены слоев-->
                <tr>
                    <td>
                        <span class="md-body-2">{{$lang.messages.addLayerName}}</span>
                    </td>
                    <td align='right' >
                        <mButton
                            :class="getClassForBoard('showIsChangeMainAddLayer')"
                            md-alignment-left 
                            @click='setConverseOfLayout()' >
                                <img :src="require('content/images/change.png')" style="height: 25px; width: 16px">
                        </mButton>
                    </td>
                </tr>
                <!-- Выдающий список доп слоя -->
                <tr>
                   <td colspan='2'>
                        <selectItem :idChild="'addLayer'" :listData='dateConfigList' :indexList='2' > </selectItem>
                   </td>
                </tr>
                <!-- Слайдер смены слоев и шкала процентов-->
                <tr>
                    <td>
                        <input 
                            type="range" 
                            class='slider' 
                            v-model.number='ammountPerc' 
                            :input='setOpacityToLayer(ammountPerc)' >
                    </td>
                    <td align='right'>
                        {{ ammountPerc }}%
                    </td>
                </tr>
                <!-- Выгрузка отчета-->
                <tr>
                    <td colspan="2">
                        <pdf-button></pdf-button>
                    </td>
                </tr>
                <!-- Детектор изменений-->
                <tr>
                    <td>
                        {{$lang.messages.showChangesName}}
                    </td>
                    <td align='right' >
                        <md-checkbox 
                            class="md-primary" 
                            v-model='showChangesVal' 
                            @change='setShowChangeOfLayers(showChangesVal)' >
                        </md-checkbox>
                    </td>
                </tr>
                <!-- Шкала детектора изменений-->
                <tr>
                    <td colspan='2' v-show='getAllMapState.showColorScale' >
                        <colorScale />
                    </td>
                </tr>
            </table>
        </md-card-content>
    </md-card>

     <!-- 3д модель-->
    <frameLayer class='move frame3dPos' 
        :isExit = 'true'
        :inWidth='getFrameContentWidthPx(40)' 
        :inShowParam='getAllMapState.show3DFrame'
        :showName='"show3DFrame"' >
            <iframe 
                :src='getAllMapState.selected3dFrameSrc' 
                class='frame3dContent fullSize' >
            </iframe>
    </frameLayer>
  </div>
</template>

<script>
 
  import { mapMutations, mapGetters, mapActions } from 'vuex';

  import selectItem from './SelectItem'
  import frameLayer from 'components/Map/Options/FrameLayer'
  import mButton    from 'components/Additional/MButton'
  import colorScale from 'components/Map/Options/ColorScaleOfChanges'
  import pdfButton  from 'components/Pdf/PdfButton'

  export default {
    
    components : { selectItem, frameLayer, mButton, colorScale, pdfButton },

    data : ()=>({

        ammountPerc    : 100,
        showChangesVal : false, 
        hrefReport     : null,
        dateConfigList : null,
    }),

    computed : {

        ...mapGetters([ 'getAllMapState', 'getFrameContentWidthPx', 'getClassForBoard' ]),
    },

    created(){

        this.hrefReport = `src/content/documents/${this.getAllMapState.mapId}/report.pptx`;
        this.dateConfigList = this.getAllMapState.mapModel.mapDateConfigList;
    },

    methods : {

        ...mapActions([ 'setChangeDatesOfLayers', 'setShowChangeOfLayers', 'setRenderDefault' ]),
        ...mapMutations([ 'setShowMode', 'setPrevChangeOpacity' ]),
        
        setConverseOfLayout(){

            //Меняем даты на выпадающих списках у слоев и дергаем рендеринг
            this.setChangeDatesOfLayers();

            //Запуск рендеринга
            this.setRenderDefault(true);
        },

        setOptionHead(inObjName){

            this.setShowMode(inObjName);
            
            //Запуск рендеринга
            this.setRenderDefault(true);
        },

        setOpacityToLayer( inAmmountPerc ){

            this.setPrevChangeOpacity(inAmmountPerc);

            //Запуск рендеринга
            this.setRenderDefault(false);
        }
    }
  }
</script>

<style lang="scss" scoped>

    .optionMap {

	    top   : 11%;
        right : 1%;
    }

    .optionMapDiv {

        width : 100%;
    }

    .frame3dPos {

        top  : 20%;
        left : 30%;
    }

    .frame3dContent {
    
        height : calc(60vh);
    }

    .md-card {
        
        display        : inline-block;
        vertical-align : top;
    }

    .reportHref{
        font-size: 27px; 
        color: #4a10e4;
        margin-right: 5px;
    }

</style>