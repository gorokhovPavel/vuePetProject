import Vue from "vue";
import "@mapbox/mapbox-gl-draw/css";
import MapboxDraw from "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw";
import {
  CircleMode,
  DragCircleMode,
  DirectMode,
  SimpleSelectMode
} from "mapbox-gl-draw-circle";
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
  setMapBoxDraw = () =>
    new Promise(resolve => {
      resolve(
        new MapboxDraw({
          userProperties: true,
          styles: drawStyles.styleMapBoxDrawList(),
          modes: {
            ...MapboxDraw.modes,
            draw_circle: CircleMode,
            drag_circle: DragCircleMode,
            direct_select: DirectMode,
            simple_select: SimpleSelectMode
          }
        })
      );
    }).then(result => {
      this.commitData("setStateMapValue", {
        field: "mapObjListDraw",
        value: result
      });
    });

  //Акативация нового инструмента
  getPropForMark(inItem) {
    let drawTypeName = null;
    const drawTypeProp = inItem === 8 ? { initialRadiusInKm: 0.02 } : {};

    switch (inItem) {
      //Линия
      case 2:
        drawTypeName = "draw_line_string";
        break;
      //Полигон
      case 3:
      case 7:
        drawTypeName = "draw_polygon";
        break;
      //Точка
      case 1:
      case 4:
      case 5:
      case 6:
      case 9:
        drawTypeName = "draw_point";
        break;
      case 8:
        drawTypeName = "draw_circle";
        break;
    }

    return { name: drawTypeName, prop: drawTypeProp };
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
      this.dispatchData("setActionModal", {
        titleAction: sureMathCalcTitle,
        nameAction: nameAction,
        dataAction: inSelObjDraw
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

    if (!objectForDelete) return;

    this.dispatchData("setActionModal", {
      titleAction: sureDelTitle,
      nameAction: "setActionDelMapObj",
      dataAction: objectForDelete
    });
  }

  //Выделяем объекты, на которые был наведен курсор
  setMouseMoveActivateOverObj(inEvent) {
    let layers = [];
    try {
      layers = this.stateData.curMap.getStyle().layers;
    } catch (error) {
      console.log("Minor error with this.stateData.curMap.getStyle().layers");
    } finally {
      //Ищем все объекты на карте с префиксом polygonObj
      const styleLayerArr = layers.filter(
        item => (item.source || []).indexOf("polygonObj") !== -1
      );

      //Собираем айдишники слоев
      let features = [];
      styleLayerArr.forEach(item => {
        const localFeatures = this.stateData.curMap.queryRenderedFeatures(
          inEvent.point,
          {
            layers: [item.id]
          }
        );
        if (localFeatures.length) {
          features = [...features, localFeatures];
        }
      });

      if (features.length !== 0) {
        this._deleteAllPopup();

        let featureId = features[0][0]?.layer?.id;
        featureId = featureId.replace("polygonObj", "");

        const mapObjElem = this.getFetureList(featureId);
        this.stateData.mapObjListDraw.changeMode("direct_select", {
          featureId: featureId
        });

        const { isMenuInfo } = mapObjElem[0]?.chartData;

        if (isMenuInfo) {
          this.setAddPopUp(mapObjElem);
        }
      }
    }
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
        // TODO убрать этот пиздец выше в условиях и прописать нормальную логику!
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
          curDrawItem.properties.isMenuInfoStartPopup = inInst === 7;
          let coord = this.mathCalcHeight.getStartCoord(curDrawItem);
          this.setAddPopUp(curDrawItem, [coord[0], coord[1]]);
        }
        //Инфокарточка
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
        //Инцидент
      } else if (inInst === 9) {
        this.commitData("setStateMapValue", {
          field: "isIncModalActive",
          value: true
        });

        this.commitData("setStateMapValue", {
          field: "incModalData",
          value: null
        });

        this.commitData("setStateMapValue", {
          field: "incObj",
          value: { id: curDrawItem.id }
        });
      }
      //Клик на имеющийся объект
      else if (selectDrawItem) {
        this.setImagesForDrawObjects(selectDrawItem.id);
        const curDrawList = this.getFetureList(selectDrawItem.id);

        //И снова, если инфокарта
        if (curDrawList[0]?.chartData?.isMenuInfo) {
          this.commitData("setStateMapValue", {
            field: "menuInfoData",
            value: { id: selectDrawItem.id }
          });
        }

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
    const measurItem =
      this.stateData.currentInstrument || inSelDraw?.measurItem;
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

    //Инциденты
    if (measurItem === 9) {
      this.commitData("setStateMapValue", {
        field: "isIncModalActive",
        value: true
      });

      this.commitData("setStateMapValue", {
        field: "incModalData",
        value: inSelDraw?.chartData
      });
    }

    //Метки
    if (
      (measurItem > 3 || inSelDraw.geometry.type === "Point") &&
      measurItem !== 9
    ) {
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
        //Инфокарточка
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
      inDrawSel.chartData = inResMathData;
      inDrawSel.measurItem = this.stateData.currentInstrument;
      let objListServer = this.stateData.mapObjListServer || [];

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

  //Перерисовка объектов карты с совместной перезагрузкой mapBoxDraw
  setMapBoxDrawOnCurrentObj() {
    this.stateData.mapObjListDraw.deleteAll();

    this.stateData.mapObjListDraw.add({
      type: "FeatureCollection",
      features: this.getFilteredMapObjectForDraw(null)
    });

    this.setImagesForDrawObjects(null);
  }

  //Вывод отфильтрованной коллекции объектов карты
  getFilteredMapObjectForDraw(inMapDrawObjId) {
    const {
      isMarkersActive,
      isMeasureActive,
      isInfoCardsActive
    } = this.stateData;

    const featureDrawList = this.getFetureList(inMapDrawObjId);

    return featureDrawList.filter(item => {
      const drawType = item?.geometry?.type;
      return (
        (drawType === "Point" && isMarkersActive) ||
        (drawType === "LineString" && isMeasureActive) ||
        (drawType === "Polygon" &&
          ((item?.chartData?.isMenuInfo && isInfoCardsActive) ||
            (!item?.chartData?.isMenuInfo && isMeasureActive)))
      );
    });
  }

  //Замена дефолтовых маркеров на более красивые
  setImagesForDrawObjects(inDrawId) {
    const inMapObj = this.stateData.curMap;
    if (!inMapObj) return;

    this._deleteSorceAndLayersFromMap(inDrawId, null);

    const inTblMapObj = this.stateData.mapObjListTable;
    const inListOfColors = addExtension.getListColor();
    const featureDrawListFiltered = this.getFilteredMapObjectForDraw(inDrawId);

    featureDrawListFiltered.forEach(item => {
      if (item || item?.geometry) {
        const drawType = item?.geometry?.type;
        const drawCoord = item?.geometry?.coordinates;
        let drawTypeView = item?.properties?.type || item?.geometry?.type;
        let imgForDraw = "";

        let isReport =
          item.properties?.isReport !== null
            ? item?.properties?.isReport
            : true;

        let inColor = addExtension.getValueFromNum(
          inListOfColors,
          item?.properties?.numColor
        );

        if (inTblMapObj) {
          const elemFromTblMapObj = inTblMapObj.find(x => x.id === item.id);
          //Первая установка цвета - смотрит на параметр, что установлен в таблице
          inColor = elemFromTblMapObj
            ? addExtension.getValueFromNum(
                inListOfColors,
                elemFromTblMapObj.numColor
              )
            : inListOfColors[0].value;
          isReport = elemFromTblMapObj ? elemFromTblMapObj.isReport : false;
        }

        //Ну и если это инфокарточка с установленным параметром готовности, снова меняем цвет
        inColor = addExtension.getColorFromIndicateInfoCard(
          inColor,
          item,
          this.stateData.infoCardFinalReadyParam
        );

        if (drawType === "Point" && drawTypeView) {
          drawTypeView = drawTypeView === "incident" ? "point" : drawTypeView;
          const drawPng = `${drawTypeView}Draw.png`.toLowerCase();
          imgForDraw = require(`@/content/images/${drawPng}`);
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
          if (isReport) {
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
            } else if (drawType === "Polygon") {
              //строим, если активный режим инфокарточек или простых объектов измерения
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

    //Удаляем все эти точки
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
        drawElem?.properties?.pointInfo !== undefined
          ? drawElem.properties.pointInfo
          : currentText;
    }

    //Если карточка меню
    let menuInfoData = drawElem?.chartData?.isMenuInfo
      ? { ...drawElem.chartData, date: drawElem?.properties?.date }
      : null;

    //Ecли инцидент
    if (drawElem?.measurItem === 9 && drawElem?.chartData) {
      mapPartInfo = drawElem?.chartData?.inc;
    }

    //Если карточка меню при первом появлении
    const isMenuInfoStartPopup = drawElem?.properties?.isMenuInfoStartPopup;

    this._deleteAllPopup();

    this.popup
      .setLngLat(xyCoord)
      .setHTML('<div id="vuePopupContent"></div>')
      .addTo(this.stateData.curMap);

    new this.popupContent({
      propsData: {
        isMenuStartPopup: isMenuInfoStartPopup,
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
