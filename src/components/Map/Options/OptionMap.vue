<template>
  <div class="optionMapAdp absolute">
    <!-- Набор движущихся окон -->
    <FrameList />
    <!-- Отображение опций -->
    <MButton
      v-show="!getShowingObjects.showOptionContent"
      @click="setOptionHead('showOptionContent')"
    >
      <img :src="require('@/content/images/changelayer.png')" />
    </MButton>
    <!-- Блок опций -->
    <a-menu
      v-show="getShowingObjects.showOptionContent"
      class="optionMapMenu radius border"
      mode="inline"
      theme="light"
      :default-open-keys="['sub0']"
    >
      <!-- Выбор даты съемки -->
      <a-sub-menu mode="vertical" key="sub0">
        <span slot="title">
          <a-icon type="database" />
          <span> {{ $lang.messages.dataSelection }}</span>
        </span>
        <a-menu-item class="flexBetween optionMenuItemMinHeight">
          <span>{{ $lang.messages.mainLayerName }}</span>
        </a-menu-item>
        <!-- Выпадающий список основного слоя-->
        <a-menu-item class="flexBetween">
          <SelectItem
            :idChild="'mainLayer'"
            :listData="dateConfigList"
            :indexList="1"
          ></SelectItem>
        </a-menu-item>
        <a-menu-item class="flexBetween">
          <!-- Активация и скрытие дополнительного слоя-->
          <span>
            {{
              getShowingObjects.isActiveAddLayer
                ? $lang.messages.addLayerName
                : $lang.messages.addLayerNameDis
            }}
          </span>
          <a-switch
            v-model="getShowingObjects.isActiveAddLayer"
            @change="setShowMode('isActiveAddLayer')"
          >
          </a-switch>
        </a-menu-item>
        <!-- Выдающий список доп слоя -->
        <a-menu-item
          v-show="getShowingObjects.isActiveAddLayer"
          class="flexBetween"
        >
          <SelectItem
            :idChild="'addLayer'"
            :listData="dateConfigList"
            :indexList="2"
          ></SelectItem>
          <a-switch
            class="leftMargin"
            v-model="getLayersIndexes.isAllLayers"
            @change="setAllLayers()"
          >
          </a-switch>
        </a-menu-item>
        <!-- Слайдер смены слоев-->
        <a-menu-item v-show="getShowingObjects.isActiveAddLayer">
          <a-slider
            class="sliderChangeLayers"
            v-model.number="ammountPerc"
            @change="setOpacityToLayer(ammountPerc)"
          />
        </a-menu-item>
      </a-sub-menu>
      <!-- Информационные слои -->
      <a-sub-menu mode="vertical">
        <span slot="title">
          <a-icon type="control" />
          <span> {{ $lang.messages.infoLayers }}</span>
        </span>
        <a-menu-item class="flexBetween optionMenuItemMinHeight">
          <span>
            {{ $lang.messages.showMapHeights }}
          </span>
          <a-switch
            class="leftMargin"
            v-model="getShowingObjects.showColorLayer"
            @change="setOptionHead('showColorLayer')"
          >
          </a-switch>
        </a-menu-item>
        <a-menu-item class="flexBetween">
          <span>
            {{ $lang.messages.show3dObject }}
          </span>
          <a-switch
            class="leftMargin"
            v-model="getShowingObjects.show3DFrame"
            @change="setOptionHead('show3DFrame')"
          >
          </a-switch>
        </a-menu-item>
        <a-menu-item class="flexBetween">
          <span>
            {{ $lang.messages.showChangesName }}
          </span>
          <a-switch
            class="leftMargin"
            v-model="getShowingObjects.showPointsChangesCheck"
            @change="
              setShowChangeOfLayers(getShowingObjects.showPointsChangesCheck)
            "
          >
          </a-switch>

          <ColorScaleOfChanges v-if="getAllMapState.showColorScale" />
        </a-menu-item>
        <a-menu-item class="flexBetween">
          <span>
            {{ $lang.messages.showGeoPlan }}
          </span>
          <a-switch
            class="leftMargin"
            v-model="isShowGeoPlan"
            @change="setShowGeoPlan()"
          >
          </a-switch>
        </a-menu-item>
        <a-menu-item>
          <RecognitePanel />
        </a-menu-item>
      </a-sub-menu>
      <!-- Добавление объектов -->
      <a-sub-menu mode="vertical">
        <span slot="title">
          <a-icon type="plus-square" />
          <span> {{ $lang.messages.addObjects }}</span>
        </span>
        <a-menu-item
          class="flexBetween"
          :class="{
            kpmgBack: getAllMapState.currentInstrument === item.id,
            whiteBack: getAllMapState.currentInstrument !== item.id
          }"
          v-for="item in getAllMapState.listOfInstruments"
          :key="item.Id"
        >
          <a-icon :type="item.name" />
          <span>
            {{ $lang.messages[item.type] }}
          </span>
          <a-button
            @click="setActivateDrawAction(item.id)"
            class="leftMargin addObjButon"
            icon="plus-square"
          ></a-button>
        </a-menu-item>
      </a-sub-menu>
      <!-- Детали объектов на карте -->
      <a-sub-menu mode="vertical">
        <span slot="title">
          <a-icon type="setting" />
          <span> {{ $lang.messages.detailsOfMapObjects }}</span>
        </span>
        <a-menu-item class="flexBetween">
          <span>
            {{ $lang.messages.build3dGraph }}
          </span>
          <a-switch
            class="leftMargin"
            v-model="getShowingObjects.is3dVolume"
            @change="setShowMode('is3dVolume')"
          >
          </a-switch>
        </a-menu-item>
        <a-menu-item class="flexBetween">
          <span>
            {{ $lang.messages.showMapObjTable }}
          </span>
          <a-switch
            class="leftMargin"
            v-model="getShowingObjects.showTableMap"
            @change="setShowMode('showTableMap')"
          >
          </a-switch>
        </a-menu-item>
        <a-menu-item class="flexBetween">
          <span>
            {{ $lang.messages.showGraphCard }}
          </span>
          <a-switch
            class="leftMargin"
            v-model="getShowingObjects.showGraphPlotChart"
            @change="setShowMode('showGraphPlotChart')"
          >
          </a-switch>
        </a-menu-item>
        <a-menu-item class="flexBetween">
          <span>
            {{ $lang.messages.showMapPoints }}
          </span>
          <a-switch
            class="leftMargin"
            v-model="getMapObjProperties.isMarkersActive"
            @change="setChangeModeActiveMapObj('isMarkersActive')"
          >
          </a-switch>
        </a-menu-item>
        <a-menu-item class="flexBetween">
          <span>
            {{ $lang.messages.showMapGeoObject }}
          </span>
          <a-switch
            class="leftMargin"
            v-model="getMapObjProperties.isMeasureActive"
            @change="setChangeModeActiveMapObj('isMeasureActive')"
          >
          </a-switch>
        </a-menu-item>
        <a-menu-item class="flexBetween">
          <span>
            {{ $lang.messages.setEditMapObjects }}
          </span>
          <a-switch
            class="leftMargin"
            v-model="getMapObjProperties.isDrawActive"
            @change="setActionChangeDrawMode('isDrawActive')"
          >
          </a-switch>
        </a-menu-item>
      </a-sub-menu>
      <!-- Детали объектов на карте -->
      <a-sub-menu mode="vertical">
        <span slot="title">
          <a-icon type="file" />
          <span> {{ $lang.messages.infoAboutReport }}</span>
        </span>
        <a-menu-item class="flexBetween">
          <PdfButton />
        </a-menu-item>
      </a-sub-menu>
    </a-menu>
  </div>
</template>

<script>
import MButton from "../../Additional/MButton.vue";
import { mapMutations, mapGetters, mapActions } from "vuex";
import { layer as Layer } from "../../../utils";
import PdfButton from "../../Pdf/PdfButton.vue";
import RecognitePanel from "./RecognitePanel.vue";
import ColorScaleOfChanges from "./ColorScaleOfChanges.vue";
import SelectItem from "./SelectItem.vue";
import FrameList from "./FrameList.vue";

export default {
  components: {
    MButton,
    SelectItem,
    ColorScaleOfChanges,
    RecognitePanel,
    FrameList,
    PdfButton
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
      "getShowingObjects",
      "getLayersIndexes",
      "getLocalMap",
      "getMapModel",
      "getInstrument",
      "getMapObjProperties"
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
      "setActivateDrawAction",
      "setActionChangeDrawMode"
    ]),
    ...mapMutations([
      "setShowMode",
      "setPrevChangeOpacity",
      "setStateMapValue"
    ]),
    setChangeModeActiveMapObj(inStateElem) {
      this.setShowMode(inStateElem);
      this.getInstrument.setImagesForDrawObjects();
    },
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
.optionMenuItemMinHeight.ant-menu-item {
  min-width: 300px;
}
.ant-menu-sub.ant-menu-sub.ant-menu-submenu-content {
  border: 1px solid var(--light-gray);
}
.sliderChangeLayers.sliderChangeLayers {
  margin-left: 0px;
}
.addObjButon {
  color: var(--kpmg);
}
.addObjButon > .anticon {
  padding: 9px 8px;
}
.reportHref {
  font-size: 27px;
  color: #4a10e4;
  margin-right: 5px;
}
</style>
