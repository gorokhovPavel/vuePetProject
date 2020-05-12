<template>
  <div class="optionMap abs">
    <!-- Отображение карточки опций -->
    <MButton
      v-show="!getShowingObjects.showOptionContent"
      @click="setOptionHead('showOptionContent')"
    >
      <img :src="require('@/content/images/changelayer.png')" />
    </MButton>
    <!-- Блок карточки опций -->
    <md-card class="optionMapMain" v-show="getShowingObjects.showOptionContent">
      <table>
        <!-- Список кнопок с опциями для карты -->
        <tr>
          <td colspan="2">
            <div class="optionMenuButtons">
              <MButton
                v-for="item in getAllMapState.listOfOptions"
                :key="item.objName"
                :class="getClassForBoard(item.objName)"
                @click="setOptionHead(item.objName)"
              >
                <img :src="require(`@/content/images/${item.imgName}.png`)" />
              </MButton>
            </div>
          </td>
        </tr>
        <!-- Логотип основного слоя и его выпадающий список, заодно и 2д-3д переключатель -->
        <tr>
          <td align="left">
            <span class="md-body-2">{{ $lang.messages.mainLayerName }}</span>
          </td>
          <td align="right">
            <span class="is3dSpan">
              3D
            </span>
            <a-switch
              v-model="getShowingObjects.is3dVolume"
              @change="setShowMode('is3dVolume')"
            >
            </a-switch>
          </td>
        </tr>
        <!-- Выпадающий список основного слоя-->
        <tr>
          <td colspan="2">
            <SelectItem
              :idChild="'mainLayer'"
              :listData="dateConfigList"
              :indexList="1"
            ></SelectItem>
          </td>
        </tr>
        <!-- Активация и скрытие дополнительного слоя-->
        <tr>
          <td align="left">
            <span>
              {{
                getShowingObjects.isActiveAddLayer
                  ? $lang.messages.addLayerName
                  : $lang.messages.addLayerNameDis
              }}
            </span>
          </td>
          <td align="right">
            <a-switch
              v-model="getShowingObjects.isActiveAddLayer"
              @change="setShowMode('isActiveAddLayer')"
            >
            </a-switch>
          </td>
        </tr>
        <!-- Выдающий список доп слоя -->
        <tr v-show="getShowingObjects.isActiveAddLayer">
          <td>
            <SelectItem
              :idChild="'addLayer'"
              :listData="dateConfigList"
              :indexList="2"
            ></SelectItem>
          </td>
          <td align="right">
            <a-switch
              v-model="getLayersIndexes.isAllLayers"
              @change="setAllLayers()"
            >
            </a-switch>
          </td>
        </tr>
        <!-- Слайдер смены слоев-->
        <tr v-show="getShowingObjects.isActiveAddLayer">
          <td colspan="2">
            <a-slider
              v-model.number="ammountPerc"
              @change="setOpacityToLayer(ammountPerc)"
            />
          </td>
        </tr>
        <!-- Детектор изменений, шкала детектора изменений -->
        <tr v-show="getShowingObjects.isActiveAddLayer">
          <td>
            {{ $lang.messages.showChangesName }}
          </td>
          <td align="right">
            <a-switch
              v-model="getShowingObjects.showPointsChangesCheck"
              @change="
                setShowChangeOfLayers(getShowingObjects.showPointsChangesCheck)
              "
            >
            </a-switch>
          </td>
        </tr>
        <tr>
          <td colspan="2" v-show="getAllMapState.showColorScale">
            <ColorScaleOfChanges />
          </td>
        </tr>
        <!-- Геоплан -->
        <tr>
          <td>
            {{ $lang.messages.showGeoPlan }}
          </td>
          <td align="right">
            <a-switch v-model="isShowGeoPlan" @change="setShowGeoPlan()">
            </a-switch>
          </td>
        </tr>
        <!-- Распознанные объекты и выгрузка отчета-->
        <tr>
          <td colspan="2">
            <RecognitePanel />
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <PdfButton />
          </td>
        </tr>
      </table>
    </md-card>
    <!-- 3д модель-->
    <FrameLayer
      class="move frame3dPos"
      :isExit="true"
      :inWidth="getFrameContentWidthPx(40)"
      :inShowParam="getAllMapState.show3DFrame"
      :showName="'show3DFrame'"
    >
      <iframe
        :src="getAllMapState.selected3dFrameSrc"
        :style="{
          height: getFrameContentWidthPx(33) + 'px'
        }"
        class="fullSize"
      >
      </iframe>
    </FrameLayer>
    <!-- Панель с набором инструментом -->
    <FrameLayer
      class="move listOfInstrumentsPos"
      :isExit="false"
      :inShowParam="getAllMapState.showInstrumentsList"
      :showName="'showInstrumentsList'"
    >
      <MButton
        v-for="item in getAllMapState.listOfInstruments"
        :key="item.Id"
        :class="{
          onBord: getAllMapState.currentInstrument === item.id,
          hideBord: getAllMapState.currentInstrument !== item.id
        }"
        @click="setActivateDrawAction(item.id)"
      >
        <img :src="require(`@/content/images/${item.name}.png`)" />
      </MButton>
    </FrameLayer>
    <!-- 2Д и 3Д графики-->
    <FrameLayer
      class="move measGraphMapPos"
      :isExit="true"
      :isEdit="true"
      :isSave="true"
      :inWidth="getFrameContentWidthPx(35)"
      :inShowParam="getAllMapState.showGraphPlotChart"
      :showName="'showGraphPlotChart'"
    >
      <MeasGraphMap />
    </FrameLayer>
    <!-- Медиа -->
    <FrameLayer
      class="move mediaPos"
      :isExit="true"
      :isSave="true"
      :inWidth="getFrameContentWidthPx(35)"
      :inShowParam="getAllMapState.showPhoto"
      :showName="'showPhoto'"
    >
      <MediaToMap />
    </FrameLayer>
  </div>
</template>

<script>
import { mapMutations, mapGetters, mapActions } from "vuex";
import { layer as Layer } from "../../../utils";

import MediaToMap from "../Instruments/MediaToMap.vue";
import MeasGraphMap from "../Instruments/MeasGraphMap.vue";
import FrameLayer from "./FrameLayer.vue";
import PdfButton from "../../Pdf/PdfButton.vue";
import RecognitePanel from "./RecognitePanel.vue";
import ColorScaleOfChanges from "./ColorScaleOfChanges.vue";
import SelectItem from "./SelectItem.vue";
import MButton from "../../Additional/MButton.vue";

export default {
  components: {
    MButton,
    SelectItem,
    ColorScaleOfChanges,
    RecognitePanel,
    PdfButton,
    FrameLayer,
    MeasGraphMap,
    MediaToMap
  },
  data: () => ({
    ammountPerc: 100,
    showChangesVal: false,
    hrefReport: null,
    dateConfigList: null,
    isShowGeoPlan: false
  }),
  computed: {
    ...mapGetters([
      "getAllMapState",
      "getFrameContentWidthPx",
      "getClassForBoard",
      "getShowingObjects",
      "getLayersIndexes",
      "getLocalMap",
      "getMapModel"
    ])
  },
  created() {
    this.setStateMapValue({ field: "mapObjListDraw", value: null });
    this.setStateMapValue({ field: "flagOfMapObj", value: false });
    this.setStateMapValue({ field: "activeModal", value: false });
    this.showChangesVal = this.getShowingObjects.showPointsChangesCheck;
    this.hrefReport = `src/content/documents/${this.getAllMapState.mapId}/report.pptx`;
    this.dateConfigList = this.getAllMapState.mapModel.mapDateConfigList;
  },
  methods: {
    ...mapActions([
      "setShowChangeOfLayers",
      "setRenderDefault",
      "setRenderLayers",
      "setActivateDrawAction"
    ]),
    ...mapMutations([
      "setShowMode",
      "setPrevChangeOpacity",
      "setStateMapValue"
    ]),
    setAllLayers() {
      this.setShowMode("isAllLayers");
      const mainLayerIndex = this.getLayersIndexes.currentMainIndex;
      const addLayerIndex = this.getLayersIndexes.currentAddIndex;
      const checkAddLayersArr = this.getLayersIndexes.isAllLayers
        ? this.getLayersIndexes.selectedDataCheckArr.map(() => true)
        : this.getLayersIndexes.selectedDataCheckArr.map((item, index) =>
            index === addLayerIndex || index === mainLayerIndex ? true : false
          );
      this.setStateMapValue({
        field: "selectedDataCheckArr",
        value: checkAddLayersArr
      });
    },
    setOptionHead(inObjName) {
      //По умолчанию меняем видимость входного компонента
      this.setShowMode(inObjName);
      //Если нажали на кнопку и открытия/закрытия меню опций - то открываем и закрываем заодно лист с инструментами и таблицу
      if (inObjName === "showOptionContent") {
        const isShowOptions = this.getShowingObjects.showOptionContent;
        this.setStateMapValue({
          field: "showTableMap",
          value: isShowOptions
        });
        this.setStateMapValue({
          field: "showInstrumentsList",
          value: isShowOptions
        });
      }
      //Запуск рендеринга
      this.setRenderDefault(true);
    },
    setOpacityToLayer(inAmmountPerc) {
      this.setPrevChangeOpacity(inAmmountPerc);
      this.setRenderLayers();
    },
    setShowGeoPlan() {
      //Вычисляем данные по координатам и по адресу файла
      const currMap = this.getLocalMap;
      const {
        maxLat,
        maxLon,
        minLat,
        minLon,
        imgName
      } = this.getMapModel.layers[0];
      const isRasterLayer = maxLat && maxLon && minLat && minLon;
      const isExistLayer = isRasterLayer || imgName;

      if (isExistLayer) {
        let layerItem = new Layer(currMap);
        if (isRasterLayer) {
          const addressFile = require(`@/content/images/${imgName}`);
          const coordinate = [
            [minLon, maxLat],
            [maxLon, maxLat],
            [maxLon, minLat],
            [minLon, minLat]
          ];
          //Отображаем или скрываем растровый геоплан
          if (this.isShowGeoPlan) {
            layerItem.setAddGeoPlan(coordinate, addressFile);
          } else {
            layerItem.setDeleteLayerObject(false);
          }
        } else {
          //Отображаем или скрываем геотифный геоплан
          if (this.isShowGeoPlan) {
            layerItem.addTileset(imgName, imgName, false);
          } else {
            layerItem.deleteTileset(imgName);
          }
        }
        layerItem = null;
      }
    }
  }
};
</script>

<style>
.is3dSpan {
  vertical-align: 4px;
}
.optionMap {
  top: 11%;
  right: 1%;
}
.optionMap .md-field {
  width: 100%;
  min-height: 0px;
  margin: 0;
  padding-top: 0;
  display: -webkit-box;
  display: flex;
  font-family: inherit;
}
.optionMenuButtons {
  display: flex;
  justify-content: space-between;
}
.optionMapMain {
  padding: 5px 5px 15px 10px;
}
.optionMapMain td {
  padding: 10px 0;
  margin: 0;
}
.frame3dPos {
  top: 20%;
  left: 30%;
}
.md-card {
  display: inline-block;
  vertical-align: top;
}
.reportHref {
  font-size: 27px;
  color: #4a10e4;
  margin-right: 5px;
}
.mapboxgl-ctrl-group {
  display: none;
}
.measGraphMapPos {
  top: 25%;
  left: 25%;
}
.mediaPos {
  top: 30%;
  left: 30%;
}
.listOfInstrumentsPos {
  top: 11%;
  left: 35%;
}
</style>
