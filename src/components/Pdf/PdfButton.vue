<template>
  <div id="buttonPdf">
    <span class="headline">{{$lang.messages.reportName}}</span>
    <div class="reportButton">
      <button
        type="button"
        class="md-button minMdButton md-card md-with-hover hideBord md-theme-default"
        @click="getReportWithLoader"
      >
        <div class="md-ripple">
          <div class="md-button-content">
            <img align="right" :src="require('content/images/report.png')" class="imgInButton">
          </div>
        </div>
      </button>
    </div>
    <div id="mapSnapshot"></div>
    <div id="colorMapSnapshot"></div>
    <div id="graphs">
      <div v-for="(item, index) in reportObjects" :key="index">
        <div :id="'graphPlotChart_' + item.id"></div>
      </div>
    </div>
  </div>
</template>

<script>

import { mapGetters, mapActions } from 'vuex'

//Библиотека для формирования изображения из html элемента
//Нужно не забыть указать где-нибудь что мы ей пользуемся, согласно лицензии пользование бесплатно,
//но надо ссылочку на них дать.
import html2canvas from "html2canvas";
import mapboxDraw from "@mapbox/mapbox-gl-draw/js";

import MathCalcHeight from "services/MathCalcHeight";
import Instrument from "services/InstrumentsData";
import ext from "services/AddExtension";
import PageGenerator from "services/PageGenerator";

import api from "api/apiConfig";
import { EWOULDBLOCK } from "constants";

export default {

  data: () => ({

    reportObjects: [],
    mapName: "",
    mapFullName: "",
    controlObject: "",
    surfaceProfile: "Профиль поверхности", 
    mapObjectEndTxt: "",
    layerChanges: "",
    titlePageBackgroundUrl: "",
    scaleLayerChanges: "",
    mainLayer: "",
    additionalLayer: "",
  }),

  computed: {

    //Нам требуются данные по карте, обьекты, которые будут включены в отчет и обьект для построения графиков
    ...mapGetters([ 'getListOfMapObj', 'getMathCalcHeight', 'getAllMapState', 'getInstrument' ]),

    start : async function() {

    }
  },

  methods: {

    ...mapActions([
      "setAdditionalPoints",
      "setReportLayer",
      "setAdditionalPoints",
      "getActionReportWithLoader"
    ]),

    //собираем данные из бд для текущего отчета, плюс получаем пользовательские обьекты
    _getInfoForReport: async function() {

      const reportParams = {
        mapId: this.getAllMapState.mapId,
        oldLayerId: this.getAllMapState.addLayerId,
        newLayerId: this.getAllMapState.mainLayerId
      };

      //Подтягиваем данные из базы данных, которые нужны нам для отчета.
      const reportInfo = await api.getReportObjects(reportParams);

      this.controlObject = reportInfo.data.find(
        item => item.type == "introduction"
      ).text;
      this.titlePageBackgroundUrl = reportInfo.data.find(
        item => item.type == "titlePageBackground"
      ).text;
      this.mapName = reportInfo.data.find(item => item.type == "mapName").text;
      this.mapFullName = reportInfo.data.find(
        item => item.type == "mapFullName"
      ).text;
      this.mapObjectEndTxt = reportInfo.data.find(
        item => item.type == "mapObject"
      ).text;
      this.layerChanges = reportInfo.data.find(
        item => item.type == "layerChanges"
      )
        ? reportInfo.data.find(item => item.type == "layerChanges").text
        : "";
      this.scaleLayerChanges = reportInfo.data.find(
        item => item.type == "scaleForLayerChanges"
      ).text;

      //Получаем информацию о слоях
      this.mainLayer = this.getAllMapState.mapModel.layers.find(
        item => item.id == this.getAllMapState.mainLayerId
      );
      this.additionalLayer = this.getAllMapState.mapModel.layers.find(
        item => item.id == this.getAllMapState.addLayerId
      );

      //Информаиця об обьектах, которые будут включены в отчет
      this.reportObjects = this.getListOfMapObj;

      console.log(this.reportObjects);
    },

    //Обертка над осн функцией по форм отчета
    async getReportWithLoader (){

      let currContext = this;

      this.getActionReportWithLoader(
        new Promise( resolve => {
          resolve( currContext.getReport() )
        })
      );
    },

    //Осн функция для формирования отчета
    getReport : async function() {

      const pdfMake = require("pdfmake/build/pdfmake.js");

      if ( pdfMake.vfs === undefined ) {
        
        const pdfFonts = require("pdfmake/build/vfs_fonts.js");
        pdfMake.vfs = pdfFonts.pdfMake.vfs;
      }

      try {
        await this._getInfoForReport();

        let pages = new Array();
        const mainPage = [
          {
            text: this.mapFullName,
            margin: [30, 160, 20, 20],
            fontSize: 40,
            color: "#00338d"
          },
          {
            text:
              'Отчет по осуществлению контроля производства строительный работ на объекте "' +
              this.mapName +
              '" за период ' +
              this.additionalLayer.createDtStr +
              " - " +
              this.mainLayer.createDtStr,
            pageBreak: "after",
            margin: [30, 240, 0, 50],
            bold: true,
            color: "#00338d"
          }
        ];
        pages.push(mainPage);

        const firstPage = PageGenerator.firstPage(
          this.mapName,
          this.controlObject
        );
        pages.push(firstPage);

        // создаем карту, для получения страниц осн обьекта и карт для графиков.
        let snapshotMap = await this._generateMap({
          objectType: "polygon",
          isColor: false
        });
        let mainMap = await PageGenerator.getMainMapPage(
          snapshotMap,
          this.mapObjectEndTxt
        );
        pages.push(mainMap);

        document.querySelector("#mapSnapshot").innerHTML = "";

        // // const geoPlan = await this._getGeoPlan(snapshotMap);
        // // pages.push(geoPlan);

      const math = this.getMathCalcHeight;

        const volumePage = await PageGenerator.volumePage(
          math,
          this.reportObjects.filter(item => item.properties.type == "polygon")
        );
        pages.push(volumePage);

        snapshotMap = await this._generateMap({
          objectType: "line",
          isColor: false
        });

        const lines = this.reportObjects.filter(
          item => item.properties.type == "line"
        );

        for (const item of lines) {
          const surfacePage = await PageGenerator.surfacePage(
            snapshotMap,
            math,
            item,
            {
              mainDate: this.mainLayer.createDtStr,
              additionalDate: this.additionalLayer.createDtStr
            }
          );
          pages.push(surfacePage);
        }

        document.querySelector("#mapSnapshot").innerHTML = "";
        snapshotMap = null;
        this.reportObjects = [];

        if (this.getAllMapState.isExistColorCurrentLayer) {
          let snapshotColorMap = await this._generateMap({ isColor: true });
          const colorMap = await PageGenerator.getColorMapPage(
            snapshotColorMap
          );
          pages.push(colorMap);

          document.querySelector("#colorMapSnapshot").innerHTML = "";
          snapshotColorMap = null;
        }

        if (this.layerChanges != "") {
          const changesPage = await PageGenerator.getChangesPage(
            this.layerChanges,
            this.scaleLayerChanges
          );
          pages.push(changesPage);
        }

        const titlePageBackground = await this._getMainImg();
        const docDefinition = {
          background: function(currentPage, pageSize) {
            if (currentPage === 1) return [{ image: titlePageBackground }];

            return "";
          },
          content: [pages],
          styles: {
            header: {
              fontSize: 26,
              margin: [0, 0, 0, 10],
              color: "#00338d"
            },
            subheader: {
              fontSize: 11,
              bold: true,
              margin: [0, 10, 0, 5],
              color: "#00338d"
            },
            defaultStye: {
              fontSize: 11,
              fontfamily: "Arial",
              margin: [0, 5, 0, 5]
            },
            section: {
              fontSize: 11,
              margin: [0, 5, 0, 5]
            },
            tableExample: {
              fontSize: 12,
              fillColor: "#e7eef8",
              alignment: "center",
              margin: [0, 20, 0, 0]
            },
            tableHeader: {
              bold: true,
              color: "white",
              fillColor: "#0091da",
              margin: [0, 20, 0, 0]
            },
            tableLastHeader: {
              bold: true,
              color: "white",
              fillColor: "#0091da",
              margin: [5, 13, 5, 5]
            }
          }
        };

        pdfMake.createPdf(docDefinition).download("report.pdf");
      } catch (e) {alert("test")}
    },

    _getMainImg() {
      const current = this;
      return new Promise(async function(resolve) {
        var image = new Image(595, 842);
        image.onload = function() {
          var canvas = document.createElement("canvas");
          canvas.width = 595;
          canvas.height = 842;

          canvas.getContext("2d").drawImage(this, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        };

        image.src = current.titlePageBackgroundUrl;
      });
    },

    //Графики по обьектам, которые выбрал пользователь
    _graphPagesGenerate: async function(snapshotMap) {
      let pagesGraph = new Array();

      const header = [
        {
          pageBreak: "before",
          text: this.surfaceProfile,
          style: "header"
        }
      ];
      pagesGraph.push(header);

      let index = 0;
      const math = this.getMathCalcHeight();
      this.reportObjects = this.getListOfMapObj;

      for (const item of this.reportObjects) {
        let coords = "";
        let heights = "";

        if (item.properties.type == "line") {
          coords = { type: "line", array: item.geometry.coordinates };
          heights = await math.getHeightsLine(item, true);
        }

        if (item.properties.type == "polygon") {
          coords = { type: "polygon", array: item.geometry.coordinates };
          await math.getVolume(item, true);
        }

        const obj = { map: snapshotMap, coords };
        const img = await this._graphPageFlyToPromise(obj);
        pagesGraph.push(img);

        await html2canvas(
          document.querySelector("#graphPlotChart_" + item.id),
          { logging: false }
        ).then(canvas => {
          const pageHeader = [
            {
              text: item.properties.name + ": " + item.properties.data,
              style: "subheader"
            }
          ];
          pagesGraph.push(pageHeader);

          if (heights != "") {
            const pageValues = [
              {
                text:
                  "Старое значение: " +
                  heights.arrHeightNew +
                  " / новое значение:" +
                  heights.arrHeightOld
              }
            ];
            pagesGraph.push(pageValues);
          }

          const pageImg = [
            {
              image: canvas.toDataURL("image/png"),
              width: 480,
              height: 290,
              alignment: "center"
            }
          ];
          pagesGraph.push(pageImg);

          index++;
        });
      }

      this.reportObjects = [];
      return pagesGraph;
    },

    //создаем элемент карты с слоями: стандартный и обьекты на нем
    //выбранные пользователем (isColor = false)
    //либо спектральный слой высот (isColor = true)
    _generateMap: async function(properties) {

      const currVuex = this;

      return new Promise(function(resolve, reject) {

        mapboxgl.accessToken = currVuex.getAllMapState.mapModel.accessToken;
        let container = "mapSnapshot";
        if (properties.isColor) container = "colorMapSnapshot";

        let snapshotMap = new mapboxgl.Map({
          container: container,
          zoom: 14.1,
          style: {
            version: 8,
            sources: {},
            layers: [
              {
                id    : "background",
                type  : "background",
                paint : {
                  "background-color" : "white"
                }
              }
            ]
          },
          center: currVuex.getAllMapState.mapModel.center
        });

        snapshotMap.on("load", function() {

          const obj = { snapshotMap, isColor: properties.isColor };
          
          currVuex.setReportLayer(obj);

          if (!properties.isColor)
            currVuex.getInstrument.setImagesForDrawObjects();
        });

        resolve(snapshotMap);
      });
    }
  }
};
</script>

<style>
#buttonPdf {
  display: grid;
  grid-template-columns: 2fr 1fr;
  cursor: auto;
}

.headline {
  display: flex;
  align-items: center;
}

.reportButton {
  display: flex;
  justify-content: flex-end;
}

/*Так как нам бы не хотелось чтобы пользователь видел как формируется обьекты для отчета,
    то мы их скрываем при помощи opacity. Display: none и visibility: hidden 
    не подходят для данного случая, так как html2canvas не может с ними работать*/
#graphs {
  position: absolute;
  opacity: 0;
}

#changeLayers {
  position: absolute;
}

/* Раскомментировать, если хотим посомтреть как формируются обьекты карты */
/* #mapSnapshot {
  width: 370px;
  height: 370px;
} */
</style>