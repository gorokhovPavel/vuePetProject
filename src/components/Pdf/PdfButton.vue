<template>
  <div>
    <div class="flexBetween">
      <span>
        {{ $lang.messages.reportName }}
      </span>
      <a-button
        v-if="!this.isProccessing"
        icon="file-image"
        class="leftMargin buttonPdf"
        @click="getReportWithLoader"
      />
      <span v-else class="bold leftMargin kpmgMainTextColor"
        >{{ this.completed }}%</span
      >
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
// eslint-disable-next-line no-unused-vars
import mapboxDraw from "@mapbox/mapbox-gl-draw/js";
import html2canvas from "html2canvas";
import { mapGetters, mapActions } from "vuex";
import { pageGenerator } from "../../utils";
import { api } from "../../api";
//import kpmgFont from "../../../public/cdn/scripts/kpmgFont";

export default {
  data: () => ({
    surfaceProfile: "Профиль поверхности",
    reportObjects: [],
    mapName: "",
    mapFullName: "",
    controlObject: "",
    mapObjectEndTxt: "",
    layerChanges: "",
    threeDModel: "",
    titlePageBackgroundUrl: "",
    simplePageBackGroundUrl: "",
    lastPageBackGroundUrl: "",
    footPage: "",
    headPage: "",
    scaleLayerChanges: "",
    mainLayer: "",
    additionalLayer: "",
    isProccessing: false,
    completed: 0,
    cntOfPages: 0
  }),
  computed: {
    //Нам требуются данные по карте, обьекты, которые будут включены в отчет и обьект для построения графиков
    ...mapGetters([
      "getMapObjList",
      "getMathCalcHeight",
      "getAllMapState",
      "getInstrument"
    ])
    //start: async function() {}
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
        item => item.type === "introduction"
      ).text;

      //Титульник, обычный и последний лист
      this.titlePageBackgroundUrl = reportInfo.data.find(
        item => item.type === "titlePageBackground"
      ).text;

      this.simplePageBackGroundUrl = reportInfo.data.find(
        item => item.type === "simplePageBackGround"
      ).text;

      this.lastPageBackGroundUrl = reportInfo.data.find(
        item => item.type === "lastPageBackGround"
      ).text;

      this.footPage = reportInfo.data.find(item => item.type === "foot").text;

      this.headPage = reportInfo.data.find(item => item.type === "head").text;

      this.mapName = reportInfo.data.find(item => item.type === "mapName").text;

      this.mapFullName = reportInfo.data.find(
        item => item.type === "mapFullName"
      ).text;

      this.mapObjectEndTxt = reportInfo.data.find(
        item => item.type === "mapObject"
      ).text;

      this.layerChanges = reportInfo.data.find(
        item => item.type === "layerChanges"
      )
        ? reportInfo.data.find(item => item.type === "layerChanges").text
        : "";

      this.threeDModel = reportInfo.data.find(item => item.type === "3dModel")
        ? reportInfo.data.find(item => item.type === "3dModel").text
        : "";

      this.scaleLayerChanges = reportInfo.data.find(
        item => item.type === "scaleForLayerChanges"
      ).text;

      //Получаем информацию о слоях
      this.mainLayer = this.getAllMapState.mapModel.layers.find(
        item => item.id === this.getAllMapState.mainLayerId
      );

      this.additionalLayer = this.getAllMapState.mapModel.layers.find(
        item => item.id === this.getAllMapState.addLayerId
      );

      //Информаиця об обьектах, которые будут включены в отчет
      this.reportObjects = this.getMapObjList.mapObjListServer;
    },

    //Обертка над осн функцией по форм отчета
    async getReportWithLoader() {
      this.getActionReportWithLoader(
        new Promise(resolve => {
          resolve(this.getReport());
        })
      );
    },

    //Осн функция для формирования отчета
    getReport: async function() {
      let pdfMake = require("pdfmake/build/pdfmake.js");

      if (pdfMake.vfs === undefined) {
        //pdfMake.vfs = kpmgFont.data;
      }

      try {
        await this._getInfoForReport();

        const pages = new Array();

        this.completed = 3;
        this.isProccessing = true;

        const mainPage = [
          {
            text: this.mapFullName,
            style: "mainTitle"
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
            style: "mainDescr"
          }
        ];

        pages.push(mainPage);

        const firstPage = pageGenerator.firstPage(
          this.mapName,
          this.controlObject
        );
        pages.push(firstPage);

        this.completed = 17;

        /*

        // создаем карту, для получения страниц осн обьекта и карт для графиков.
        let snapshotMap = await this._generateMap({
          objectType: "polygon",
          isColor: false
        });

        let mainMap = await pageGenerator.getMainMapPage(
          snapshotMap,
          this.mapObjectEndTxt,
          mapboxDraw
        );
        pages.push(mainMap);

        document.querySelector("#mapSnapshot").innerHTML = "";

        // const geoPlan = await this._getGeoPlan(snapshotMap);
        // pages.(geoPlan);

        this.completed = 25;

        const dateBetweenObj = {
          mainDate: this.mainLayer.createDtStr,
          additionalDate: this.additionalLayer.createDtStr
        };

        const math = this.getMathCalcHeight;
        const polygons = this.reportObjects.filter(
          item => item.properties.type === "polygon"
        );
        const volumePage = await pageGenerator.volumePage(
          math,
          polygons,
          dateBetweenObj
        );

        pages.push(volumePage);

        this.completed = 45;

        snapshotMap = await this._generateMap({
          objectType: "line",
          isColor: false
        });

        const linesOfReport = this.reportObjects.filter(
          item =>
            item.properties.type === "line" && item.properties.isReport === true
        );

        snapshotMap = await this._generateMap({
          objectType: "line",
          isColor: false
        });

        for (let item of linesOfReport) {
          const mapObjListItem = this.getMapObjList.mapObjListTable.find(
            i => i.id === item.id
          );
          if (mapObjListItem.isReport) {
            const surfaceResult = await pageGenerator.surfacePage({
              snapshotMap: snapshotMap,
              instrument: this.getInstrument,
              lineItem: item,
              dateObj: dateBetweenObj
            });
            pages.push(surfaceResult);
          }
        }

        document.querySelector("#mapSnapshot").innerHTML = "";
        snapshotMap = null;
        this.reportObjects = [];

        this.completed = 75;

        if (this.getAllMapState.isExistColorCurrentLayer) {
          let snapshotColorMap = await this._generateMap({ isColor: true });
          const colorMap = await pageGenerator.getColorMapPage(
            snapshotColorMap
          );
          pages.push(colorMap);

          document.querySelector("#colorMapSnapshot").innerHTML = "";
          snapshotColorMap = null;
        }

        this.completed = 85;
        /**/

        if (this.layerChanges !== "") {
          // const changesPage = await pageGenerator.getChangesPage(
          //   this.layerChanges,
          //   this.scaleLayerChanges
          // );
          // pages.(changesPage);
        }

        if (this.threeDModel !== "") {
          // const threeDModelPage = await pageGenerator.get3DPage(
          //   this.threeDModel
          // );
          // pages.(threeDModelPage);
        }
        this.completed = 90;

        const titlePageBackground = await this._getMainImg(
          this.titlePageBackgroundUrl
        );
        const lastPageBackGroundUrl = this._getMainImg(
          this.lastPageBackGroundUrl
        );

        const footImg = this._getMainImg(this.footPage, {
          width: 90,
          height: 50
        });
        const headImg = this._getMainImg(this.headPage, {
          width: 150,
          height: 90
        });

        const imgLastBack = [
          {
            pageBreak: "before",
            image: lastPageBackGroundUrl,
            absolutePosition: { x: 0, y: 0 }
          }
        ];
        pages.push(imgLastBack);

        const docDefinition = {
          header: (currentPage, pageCount) => {
            const isSimplePage = currentPage !== 1 && currentPage !== pageCount;
            const finalObj = isSimplePage
              ? [{ image: headImg, margin: [590, 0] }]
              : "";
            return finalObj;
          },
          footer: (currentPage, pageCount) => {
            let finalObj = "";
            let footerPageArr = [];
            const isSimplePage = currentPage !== 1 && currentPage !== pageCount;

            if (isSimplePage) {
              const footerImg = [
                {
                  image: footImg,
                  style: "footerImg"
                }
              ];
              footerPageArr.push(footerImg);

              const textUp = `© 2020 АО "КПМГ", компания, зарегистрированная в соответствии с законодательством Российской Федерации, член совета сети независимых фирм КПМГ, входящих в ассоциации KPMG International Cooperative ("KPMG International"), зарегистрированную по законодательству Швейцарии. Все права защищены. `;
              const textDown = " Статус документа : Конфендициально.";
              const footerUp = [
                {
                  text: [textUp, { text: textDown, color: "#000" }],
                  style: "footerUp"
                }
              ];
              footerPageArr.push(footerUp);

              const numberOfPages = [
                {
                  text: currentPage,
                  style: "numberOfPage"
                }
              ];
              footerPageArr.push(numberOfPages);

              finalObj = footerPageArr;
            }
            return finalObj;
          },
          background: currentPage => {
            const finalObj =
              currentPage === 1 ? [{ image: titlePageBackground }] : "";
            return finalObj;
          },

          pageSize: {
            width: 720,
            height: 1040
          },

          content: [pages],

          styles: {
            mainTitle: {
              margin: [105, 200, 30, 10],
              fontSize: 50,
              bold: true,
              color: "#fff"
            },
            mainDescr: {
              margin: [105, 50, 30, 10],
              fontSize: 35,
              color: "#fff"
            },
            header: {
              fontSize: 30,
              margin: [70, 5, 30, 10],
              color: "#00338d"
            },
            subheader: {
              fontSize: 20,
              bold: true,
              margin: [80, 20, 30, 5],
              color: "#00338d"
            },
            section: {
              fontSize: 15,
              margin: [90, 15, 30, 5]
            },
            defaultStye: {
              fontSize: 11,
              fontfamily: "Arial",
              margin: [0, 5, 0, 5]
            },
            tableExample: {
              fontSize: 15,
              fillColor: "#fff",
              alignment: "center",
              margin: [85, -20, 85, 15]
            },
            tableHeader: {
              bold: true,
              color: "white",
              fillColor: "#00338d",
              margin: [5, 10, 5, 5]
            },
            tableLastHeader: {
              bold: true,
              color: "white",
              fillColor: "#0091da",
              margin: [5, 10, 5, 5]
            },
            blueText: {
              color: "#00338d"
            },
            positionChartSurface: {
              margin: [90, 30, 30, 0]
            },
            footerImg: {
              margin: [7, -10]
            },
            footerUp: {
              fontSize: 14,
              margin: [135, -35, 50, 0],
              color: "#888"
            },
            numberOfPage: {
              fontSize: 15,
              color: "#00338d",
              bold: true,
              margin: [680, -22, 0, 0]
            }
          }
        };

        pdfMake.createPdf(docDefinition).download("report.pdf");
      } catch (e) {
        console.log(e);
      } finally {
        this.isProccessing = false;
        pdfMake = null;
        // eslint-disable-next-line no-undef
        pages = null;
      }
    },

    // eslint-disable-next-line no-unused-vars
    async _getMainImg(inSrc, inSizeObj) {
      if (!inSrc) return;
      // eslint-disable-next-line no-async-promise-executor
      return await new Promise(resolve => {
        const image = new Image();
        image.onload = () => resolve(image);
        // resolve(canvas.toDataURL("image/png"))
        image.src = inSrc;
      });
      // .then(() => {
      //   const canvas = document.createElement("canvas");
      //   const { width, height } = inSizeObj || {
      //     width: 720,
      //     height: 1040
      //   };
      //   canvas.width = width;
      //   canvas.height = height;
      //   canvas.getContext("2d").drawImage(this, 0, 0);
      //   canvas.toDataURL("image/png");
      // });
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

      // eslint-disable-next-line no-unused-vars
      let index = 0;
      const math = this.getMathCalcHeight();
      this.reportObjects = this.getMapObjList.mapObjListServer;

      for (const item of this.reportObjects) {
        let coords = "";
        let heights = "";

        if (item.properties.type === "line") {
          coords = { type: "line", array: item.geometry.coordinates };
          heights = await math.getHeightsLine(item, true);
        }

        if (item.properties.type === "polygon") {
          coords = { type: "polygon", array: item.geometry.coordinates };
          await math.getVolume(item, true, true, true);
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

          if (heights !== "") {
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
      return new Promise(resolve => {
        // eslint-disable-next-line no-undef
        mapboxgl.accessToken = this.getAllMapState.mapModel.accessToken;

        const container = properties.isColor
          ? "colorMapSnapshot"
          : "mapSnapshot";

        // eslint-disable-next-line no-undef
        const snapshotMap = new mapboxgl.Map({
          zoom: 14.1,
          container: container,
          style: {
            version: 8,
            sources: {},
            layers: [
              {
                id: "background",
                type: "background",
                paint: {
                  "background-color": "white"
                }
              }
            ]
          },
          center: this.getAllMapState.mapModel.center
        });

        snapshotMap.on("load", () => {
          const obj = { snapshotMap, isColor: properties.isColor };
          this.setReportLayer(obj);
          if (!properties.isColor) {
            this.getInstrument.setImagesForDrawObjects(
              this.getMapObjList.mapObjListTable,
              snapshotMap
            );
          }
          resolve(snapshotMap);
        });

        //resolve(snapshotMap);
      });
    }
  }
};
</script>

<style>
.buttonPdf.buttonPdf {
  padding: 0 8px;
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
