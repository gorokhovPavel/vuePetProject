import Vue from "vue";
import "@mapbox/mapbox-gl-draw/css";
import mapboxDraw from "@mapbox/mapbox-gl-draw/js";
import PopupContent from "../components/Map/Instruments/PopupContent";
import { lang } from "../language";

import {
  addExtension,
  buildChart,
  mathCalcHeight as MathCalcHeight,
  drawStyles
} from "../utils";

export default class Instrument {
  constructor(inStateObj, inCommitObj, inDispatchObj) {
    this.stateData = inStateObj;
    this.commitData = inCommitObj;
    this.dispatchData = inDispatchObj;
    this.mathCalcHeight = new MathCalcHeight();
    // eslint-disable-next-line no-undef
    this.popup = new mapboxgl.Popup();
    this.popupContent = Vue.extend(PopupContent);
  }

  //Выдаем коллекцию текущих объектов карты
  getFetureList(inElemId) {
    let [mapObjFinList, mapObjDrawItem, mapObjDrawlist] = [
      null,
      null,
      this.stateData.mapObjListDraw
    ];
    const mapObjServerList = this.stateData.mapObjListServer;

    try {
      mapObjDrawlist = mapObjDrawlist.getAll().features;
      mapObjFinList = mapObjServerList.map(item => {
        mapObjDrawItem = mapObjDrawlist.find(x => x.id === item.id);
        if (mapObjDrawItem) item.geometry = mapObjDrawItem.geometry;
        return item;
      });
    } catch (error) {
      mapObjFinList = mapObjServerList || [];
    }

    mapObjFinList = !inElemId
      ? mapObjFinList
      : mapObjFinList.filter(x => x.id === inElemId);
    return mapObjFinList;
  }

  //Объявление нового объекта с измерялками
  getMapBoxDraw() {
    return new mapboxDraw({
      displayControlsDefault: true,
      styles: drawStyles.styleMapBoxDrawList(),
      controls: {
        polygon: true,
        line_string: true,
        point: true,
        trash: true
      }
    });
  }

  //Акативация нового инструмента
  setPropForMark(inItem) {
    let drawTypeName = null;
    switch (inItem) {
      //Линия
      case 2:
        drawTypeName = ".mapbox-gl-draw_line";
        break;
      //Полигон
      case 3:
      case 7:
        drawTypeName = ".mapbox-gl-draw_polygon";
        break;
      //Точка
      case 1:
      case 4:
      case 5:
      case 6:
        drawTypeName = ".mapbox-gl-draw_point";
        break;
      //Корзина (удаление)
      case 0:
        drawTypeName = ".mapbox-gl-draw_trash";
        break;
    }
    const buttonDraw = document.querySelector(drawTypeName);
    if (buttonDraw) document.querySelector(drawTypeName).click();
  }

  //Вызов действия объекта карты ( или точка входа для обработчика двойного клика )
  async setActionInstrumnentGoMath(inSelObjDraw) {
    const [nameAction, sureMathCalcTitle] = [
      "setActionMathCalc",
      lang.getMessages("sureMathCalc")
    ];

    if (!inSelObjDraw) {
      inSelObjDraw = addExtension.getSelectDraw(this.stateData.mapObjListDraw);
      const mapObj = this.stateData.mapObjListServer.find(
        item => item.id === inSelObjDraw?.id
      );
      inSelObjDraw = mapObj || inSelObjDraw;
    }

    if (!inSelObjDraw) return;

    const isInfoMenu =
      this.stateData.menuInfoData || inSelObjDraw?.chartData?.isMenuInfo;

    //Если линия или полигон, если нет подгруженных свойств и если это форма меню
    if (
      (inSelObjDraw.geometry.type === "LineString" ||
        inSelObjDraw.geometry.type === "Polygon") &&
      !inSelObjDraw.properties.id &&
      !isInfoMenu
    ) {
      this.commitData("setStateMapValue", {
        field: "activeModal",
        value: true
      });
      this.commitData("setStateMapValue", {
        field: "activeModalTitle",
        value: sureMathCalcTitle
      });
      this.commitData("setStateMapValue", {
        field: "activeConfrmDialogAction",
        value: {
          nameAction: nameAction,
          dataAction: inSelObjDraw
        }
      });
    } else {
      this.dispatchData(nameAction, inSelObjDraw);
    }
  }

  //Удаление объекта
  setDeleteExistObject(inSelObjDraw) {
    const sureDelTitle = lang.getMessages("sureDelObj");
    const objectForDelete =
      inSelObjDraw || addExtension.getSelectDraw(this.stateData.mapObjListDraw);

    this.commitData("setStateMapValue", {
      field: "activeModal",
      value: true
    });
    this.commitData("setStateMapValue", {
      field: "activeModalTitle",
      value: sureDelTitle
    });
    this.commitData("setStateMapValue", {
      field: "activeConfrmDialogAction",
      value: {
        nameAction: "setActionDelMapObj",
        dataAction: objectForDelete
      }
    });
  }

  //Клик на карту - проходим по инструментам, смотрим, на какой нажали
  async setPreparePopupProp(inEvent) {
    let curDrawItem = null;
    let inInst = this.stateData.currentInstrument;
    let selectDrawItem = addExtension.getSelectDraw(
      this.stateData.mapObjListDraw
    );

    try {
      const dataDrawArr = this.stateData.mapObjListDraw.getAll().features;
      curDrawItem = dataDrawArr[dataDrawArr.length - 1];
    } catch (exc) {
      console.log(exc);
      curDrawItem = {};
    }

    const mathCalcHeightWithModel = new MathCalcHeight(
      this.stateData.mapModel,
      this.stateData.currentMainIndex,
      this.stateData.currentAddIndex,
      this.stateData.selectedDataCheckArr
    );

    //Выходим, если нет объекта в режиме редактирования
    if (!curDrawItem) return;

    //Если было произведено "отпускание" мыши - просто перерисывываем форму
    if (inEvent.type === "mouseup") {
      if (selectDrawItem) this.setImagesForDrawObjects(selectDrawItem.id);
    } else {
      //Ну а если был произведен клик - делаем расчеты или открываем всплывающее окно
      //Высотная метка
      if (inInst === 1) {
        let heightsData = 0;
        let heightsDataText = "";
        const mathData = await mathCalcHeightWithModel.getHeightsLine(
          curDrawItem,
          false,
          this.stateData.isActiveAddLayer
        );

        try {
          heightsData = +mathData.heightsData.inArr[0];
          heightsData = heightsData.toFixed(2);
          heightsDataText = `${lang.getMessages(
            "heightOnPoint"
          )} : ${heightsData}${lang.getMessages("meter")}`;
        } catch (error) {
          heightsData = -1;
        }

        this.setAddPopUp(
          curDrawItem,
          [inEvent.lngLat.lng, inEvent.lngLat.lat],
          heightsData
        );
        this.commitData("setStateMapValue", {
          field: "currentInstrument",
          value: 0
        });
        this.setDataHeightsToDraw(
          { heightsData: heightsDataText },
          curDrawItem
        );
        return;
      }
      //Обычные метки
      else if (inInst > 3 && inInst < 7) {
        this.commitData("setStateMapValue", {
          field: "currentInstrument",
          value: inInst
        });
        this.setDataHeightsToDraw({ heightsData: "" }, curDrawItem);
        return;
      }
      //Линия и Полигон
      else if (inInst === 2 || inInst === 3 || inInst === 7) {
        if (!curDrawItem.geometry) return;

        if (inInst === 2 && curDrawItem.geometry.coordinates.length >= 2) {
          this.setAddPopUp(curDrawItem, [
            inEvent.lngLat.lng,
            inEvent.lngLat.lat
          ]);
        } else if (
          (inInst === 3 || inInst === 7) &&
          curDrawItem.geometry.coordinates[0].length > 3
        ) {
          let coord = this.mathCalcHeight.getStartCoord(curDrawItem);
          this.setAddPopUp(curDrawItem, [coord[0], coord[1]]);
        }
        //Добавляем свойство в карточку меню
        if (inInst === 7) {
          const newMenuInfo = {
            ...this.stateData.menuInfoData,
            id: curDrawItem.id
          };
          this.commitData("setStateMapValue", {
            field: "menuInfoData",
            value: newMenuInfo
          });
        }
      }
      //Клик на имеющийся объект
      else if (selectDrawItem) {
        this.setImagesForDrawObjects(selectDrawItem.id);
        const curDrawList = this.getFetureList(selectDrawItem.id);
        curDrawItem =
          curDrawList.length > 0
            ? this.getFetureList(selectDrawItem.id)[0]
            : selectDrawItem;
        this.setAddPopUp(curDrawItem, [inEvent.lngLat.lng, inEvent.lngLat.lat]);
      }
    }
  }

  //Двойной клик на карту - смотрим, попали ли на какой-нибудь объект
  async setRequestActionInstr(inSelDraw) {
    //Перегружаем сервис вычислений
    let resMathData = null;
    const measurItem = this.stateData.currentInstrument;
    const mathCalcHeightWithModel = new MathCalcHeight(
      this.stateData.mapModel,
      this.stateData.currentMainIndex,
      this.stateData.currentAddIndex,
      this.stateData.selectedDataCheckArr
    );
    this.commitData("setStateMapValue", {
      field: "show3DPanel",
      value: false
    });

    //Если пусто - выходим
    if (!inSelDraw && measurItem === 0) return;

    const stateSelDraw = this.getFetureList(inSelDraw.id);
    const { isRecount } = inSelDraw;
    inSelDraw =
      stateSelDraw && stateSelDraw.length > 0 ? stateSelDraw[0] : inSelDraw;

    //Метки
    if (measurItem > 3 || inSelDraw.geometry.type === "Point") {
      if (inSelDraw.chartData) {
        const { chartData } = inSelDraw;
        this.commitData("setStateMapValue", {
          field: "nameObject",
          value: chartData.name
        });
        this.commitData("setStateMapValue", {
          field: "dateObject",
          value: chartData.date
        });
        this.commitData("setStateMapValue", {
          field: "commentObject",
          value: chartData.heightsData
        });
      }
    }
    //Линия
    if (measurItem === 2 || inSelDraw.geometry.type === "LineString") {
      if (inSelDraw.chartData && !isRecount) {
        buildChart.addTwoDimGraph(inSelDraw.chartData.heightsData, null);
      } else {
        resMathData = await mathCalcHeightWithModel.getHeightsLine(
          inSelDraw,
          false,
          this.stateData.isActiveAddLayer
        );
      }
    }
    //Полигон
    else if (inSelDraw.geometry.type === "Polygon") {
      //Вычисление объема
      if (!this.stateData.menuInfoData && !inSelDraw?.chartData?.isMenuInfo) {
        //Смотрим, есть ли уже в объекте загруженные данные
        if (inSelDraw.chartData && !isRecount) {
          if (inSelDraw.chartData.useThreeDCheck) {
            this.commitData("setStateMapValue", {
              field: "show3DPanel",
              value: true
            });
            buildChart.addThreeDimGraph(inSelDraw.chartData.heightsData, null);
          } else {
            buildChart.addTwoDimVoluemGraph(
              inSelDraw.chartData.heightsData,
              null
            );
          }
        } else {
          if (this.stateData.is3dVolume) {
            this.commitData("setStateMapValue", {
              field: "show3DPanel",
              value: true
            });
          }
          resMathData = await mathCalcHeightWithModel.getVolume(
            inSelDraw,
            false,
            this.stateData.isActiveAddLayer,
            this.stateData.is3dVolume
          );
        }
      } else {
        resMathData = { ...inSelDraw?.chartData, isMenuInfo: true };
        //Если объект уже создан, то подтягиваем его свойства
        if (inSelDraw?.chartData?.code) {
          this.commitData("setStateMapValue", {
            field: "menuInfoData",
            value: resMathData
          });
        }
      }
    }

    //Добавляем результат расчета к общей коллекции элементов
    this.setDataHeightsToDraw(resMathData, inSelDraw);
  }

  //Добавляем полученные данные к текущему объекту, обновляем общую коллекцию
  setDataHeightsToDraw(inResMathData, inDrawSel) {
    if (inResMathData) {
      let objListServer = this.stateData.mapObjListServer || [];
      inDrawSel.measurItem = this.stateData.currentInstrument;
      inDrawSel.chartData = inResMathData;

      const existElemIndex = objListServer.findIndex(
        item => item.id === inDrawSel.id
      );

      if (existElemIndex !== -1) {
        objListServer[existElemIndex] = inDrawSel;
      } else {
        objListServer = [...objListServer, inDrawSel];
      }

      this.commitData("setStateMapValue", {
        field: "mapObjListServer",
        value: objListServer
      });

      //Заносим в хранилище Id вызванного объекта
      this.commitData("setStateMapValue", {
        field: "instrumentCurrentId",
        value: inDrawSel.id
      });
    }
  }

  //Замена дефолтовых маркеров на более красивые
  setImagesForDrawObjects(inDrawId) {
    const inMapObj = this.stateData.curMap;
    this._deleteSorceAndLayersFromMap(inDrawId, null);
    const inIsMarkersActive = this.stateData.isMarkersActive;
    const inIsMeasureActive = this.stateData.isMeasureActive;
    const inTblMapObj = this.stateData.mapObjListTable;
    const inListOfColors = addExtension.getListColor();
    const featureDrawList = this.getFetureList(inDrawId);

    if (!featureDrawList || !inMapObj) return;

    featureDrawList.forEach(item => {
      if (item) {
        let imgForDraw = "";
        let drawType = item.geometry.type;
        let drawCoord = item.geometry.coordinates;
        let drawTypeView = item.properties.type;
        let inColor = addExtension.getValueFromNum(
          inListOfColors,
          item.properties.numColor
        );
        let isReport =
          item.properties.isReport !== null ? item.properties.isReport : true;

        if (inTblMapObj) {
          const elemFromTblMapObj = inTblMapObj.find(x => x.id === item.id);
          inColor = elemFromTblMapObj
            ? addExtension.getValueFromNum(
                inListOfColors,
                elemFromTblMapObj.numColor
              )
            : inListOfColors[0].value;
          isReport = elemFromTblMapObj ? elemFromTblMapObj.isReport : false;
        }

        if (
          drawType !== "LineString" &&
          drawType !== "Polygon" &&
          drawTypeView &&
          inIsMarkersActive
        ) {
          imgForDraw = require(`@/content/images/${drawTypeView}Draw.png`);
          inMapObj.loadImage(imgForDraw, (error, image) => {
            inMapObj.addImage(`imgDraw${item.id}`, image);
            inMapObj.addLayer({
              id: `points${item.id}`,
              type: "symbol",
              source: {
                type: "geojson",
                data: {
                  type: "FeatureCollection",
                  features: [
                    {
                      type: "Feature",
                      geometry: {
                        type: "Point",
                        coordinates: drawCoord
                      }
                    }
                  ]
                }
              },
              layout: {
                "icon-image": `imgDraw${item.id}`,
                "icon-size": 0.75
              }
            });
          });
        } else {
          if (isReport && inIsMeasureActive) {
            if (drawType === "LineString") {
              inMapObj.addLayer({
                id: `lineObj${item.id}`,
                type: "line",
                source: {
                  type: "geojson",
                  data: {
                    type: "Feature",
                    properties: {},
                    geometry: {
                      type: "LineString",
                      coordinates: item.geometry.coordinates
                    }
                  }
                },
                layout: {
                  "line-join": "round",
                  "line-cap": "round"
                },
                paint: {
                  "line-color": inColor,
                  "line-opacity": 0.5,
                  "line-width": 5
                }
              });
            } else {
              inMapObj.addLayer({
                id: `polygonObj${item.id}`,
                type: "fill",
                source: {
                  type: "geojson",
                  data: {
                    type: "Feature",
                    properties: {},
                    geometry: {
                      type: "Polygon",
                      coordinates: item.geometry.coordinates
                    }
                  }
                },
                layout: {},
                paint: {
                  "fill-color": inColor,
                  "fill-opacity": 0.35
                }
              });
            }
          }
        }
      }
    });
  }

  //Меняем видимость объектов класса mapBoxDraw на карте
  setToggleDrawObjFromMap(isShow) {
    this._deleteAllPopup();

    const inMapObj = this.stateData.curMap;
    const mapStyles = inMapObj.getStyle();
    const circleLayerArr = mapStyles.layers.filter(i => {
      if (i.source) {
        return i.source.match(/mapbox-gl-draw*/);
      } else {
        return null;
      }
    });

    if ((this.stateData.mapObjListServer || []).length > 0) {
      const firstDrawItem = this.stateData.mapObjListServer[0];
      // eslint-disable-next-line no-unused-vars
      const { measurItem } = firstDrawItem;
      //if( measurItem === 2 || measurItem === 3) {
      //this.stateData.mapObjListDraw.changeMode( 'direct_select', { featureId : firstDrawItem.id } );
      //}
    }

    circleLayerArr.forEach(x =>
      inMapObj.setLayoutProperty(
        x.id,
        "visibility",
        isShow ? "visible" : "none"
      )
    );
    this._deleteAllPopup();
  }

  //Удаление всех нарисованных меток
  _deleteSorceAndLayersFromMap(inElemId, inMapObj) {
    let circleLayerArr = [];
    const mapObj = inMapObj || this.stateData.curMap;

    if (!mapObj) return;

    const mapStyles = mapObj.getStyle();

    if (!mapStyles) return;

    //Находим все слои, что означают точки, линии и полигоны
    if (!inElemId) {
      circleLayerArr = mapStyles.layers.filter(
        x =>
          x.type === "symbol" ||
          x.id.match(/lineObj.*/) ||
          x.id.match(/polygonObj*/)
      );
    } else {
      circleLayerArr = mapStyles.layers.filter(
        x => x.id.indexOf(inElemId) !== -1
      );
    }

    //Удаляем все эти точки`
    circleLayerArr.forEach(x => {
      mapObj.removeLayer(x.id);
      mapObj.removeSource(x.source);
    });

    //И закрываем поповеры
    this._deleteAllPopup();
  }

  setImagesForReportDrawObjects(inMapObj, featureDrawItem) {
    if (featureDrawItem) {
      const defColor = "#00ff00";
      const color =
        addExtension.getValueFromNum(
          addExtension.getListColor(),
          featureDrawItem.properties.numColor
        ) || defColor;
      const type = featureDrawItem.geometry.type;
      const objLayerName = `lineObj${featureDrawItem.id}`;

      //Находим все слои, что означают текущий нарисованный объект
      const finderObj = inMapObj
        .getStyle()
        .layers.filter(x => x.id.match(objLayerName));

      if (finderObj.length > 0) return;

      if (type === "LineString") {
        this._deleteSorceAndLayersFromMap(null, inMapObj);

        inMapObj.addLayer({
          id: objLayerName,
          type: "line",
          source: {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: featureDrawItem.geometry.coordinates
              }
            }
          },
          layout: {
            "line-join": "round",
            "line-cap": "round"
          },
          paint: {
            "line-color": color,
            "line-width": 10
          }
        });
      } else {
        inMapObj.addLayer({
          id: `polygonObj${1}`,
          type: "fill",
          source: {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: {
                type: "Polygon",
                coordinates: featureDrawItem.geometry.coordinates
              }
            }
          },
          layout: {},
          paint: {
            "fill-color": color,
            "fill-opacity": 0.5
          }
        });
      }
    }
  }

  //Активация поповера
  setAddPopUp(drawItem, xyCoord, textPopUp) {
    if (!drawItem) return;

    let mapPartInfo = "";
    const drawElem = Array.isArray(drawItem) ? drawItem[0] : drawItem;

    if (!drawElem.geometry) return;

    textPopUp = textPopUp || (drawElem.chartData && drawElem.chartData.name);
    const currentText = textPopUp || lang.getMessages("noComment");

    if (!xyCoord) {
      switch (drawElem.geometry.type) {
        case "Polygon":
          xyCoord = drawElem.geometry.coordinates[0][0];
          break;
        case "LineString":
          xyCoord = drawElem.geometry.coordinates[0];
          break;
        default:
          xyCoord = drawElem.geometry.coordinates;
      }
    }

    if (drawElem.geometry.type !== "Point") {
      mapPartInfo = this.mathCalcHeight.getTotalDistanceStr(drawElem, true);
    } else {
      mapPartInfo =
        drawElem.properties.pointInfo !== undefined
          ? drawElem.properties.pointInfo
          : currentText;
    }

    //Если карточка меню
    const menuInfoData = drawElem?.chartData?.isMenuInfo
      ? drawElem.chartData
      : null;

    this._deleteAllPopup();

    this.popup
      .setLngLat(xyCoord)
      .setHTML('<div id="vuePopupContent"></div>')
      .addTo(this.stateData.curMap);

    new this.popupContent({
      propsData: {
        mainInfo: mapPartInfo,
        menuInfo: menuInfoData,
        drawData: drawElem,
        lang: lang,
        setDelete: this.setDeleteExistObject.bind(this),
        setAction: this.setActionInstrumnentGoMath.bind(this)
      }
    }).$mount("#vuePopupContent");
  }

  //Закрываем все поповеры
  _deleteAllPopup() {
    this.popup.remove();
  }
}
