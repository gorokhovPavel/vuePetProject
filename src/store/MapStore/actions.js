import { privateActionsMap } from "./privateActions";
import { api } from "../../api";
import {
  addExtension,
  layer as Layer,
  instrumentsData as InstrumentsData
} from "../../utils";
import { lang } from "../../language";

const actions = {
  //Устанавливаем слои на нашу мини карту для отчета
  setReportLayer({ state, commit }, obj) {
    privateActionsMap._setReportLayer({ state, commit }, obj);
  },

  //Наполняем мини карту пользовательскими объектами для отчета
  setAdditionalPoints({ state }, map) {
    privateActionsMap._loadUserObjects({ state }, map);
  },

  //Обертка лоaдера над отчетом и вывод ошибок в консоль
  getActionReportWithLoader({ commit }, actionReport) {
    addExtension.setForAxiosWithState(commit, {
      letUrlAction: actionReport
    });
  },

  //Убираем или добавляем на карту возможность изменения структуры объектов
  setActionChangeDrawMode({ state, commit, getters }, inStateElem) {
    commit("setShowMode", inStateElem);
    getters.getInstrument.setToggleDrawObjFromMap(state[inStateElem]);
  },

  //Обработка модалок, точка входа
  setActionModal: ({ state, commit, dispatch }) => {
    const actionData = state.activeConfrmDialogAction;
    commit("setStateMapValue", { field: "activeModal", value: false });
    dispatch(actionData.nameAction, actionData.dataAction);
  },

  //Сохранение объекта, точка входа
  setStartSaveModal: ({ commit }) => {
    commit("setShowMode", "activeModalName");
  },

  //Собственно, сохранение конкретного объекта
  setActionSaveModal: ({ state, commit, getters }, nameObject) => {
    let indexOfMapObjList = -1;
    let localMapObjList = state.mapObjListServer;
    const currentObj = localMapObjList.find((x, index) => {
      if (x.id === state.instrumentCurrentId) {
        indexOfMapObjList = index;
        return x;
      }
    });

    const typeDraw = addExtension.getTypeObjForDraw(
      currentObj,
      state.listOfInstruments
    );
    const typeDrawId = typeDraw ? typeDraw.id : state.currentInstrument;
    let typeObjName = state.listOfInstruments[typeDrawId - 1].name;

    if (typeDrawId > 3 && typeDrawId !== 7) {
      //В случае высотной метки оставим тип Точка. в остальных - меняем на соответствующий тим маркера
      typeObjName =
        currentObj.measurItem === 0
          ? "point"
          : state.listOfInstruments[currentObj.measurItem - 1].name;
      //Проставляем маркерам их свойства
      currentObj.chartData = {
        name: state.nameObject,
        heightsData: state.commentObject,
        date: state.dateObject
      };
    }

    currentObj.properties = {
      type: typeObjName,
      name: nameObject,
      date: addExtension.getCurrentDate(),
      numColor: 3,
      isReport: true,
      id: currentObj.id
    };

    if (indexOfMapObjList !== -1) {
      localMapObjList[indexOfMapObjList] = currentObj;
    }
    localMapObjList = localMapObjList.filter(x => x.properties.id);

    new Promise(resolve => resolve(commit("setRefreshMapObjTable")))
      .then(() => {
        commit("setStateMapValue", {
          field: "mapObjListServer",
          value: localMapObjList
        });
      })
      .then(() => {
        commit("setStateMapValue", {
          field: "activeModalName",
          value: false
        });
        commit("setStateMapValue", { field: "showPhoto", value: false });
        commit("setStateMapValue", {
          field: "showGraphPlotChart",
          value: false
        });
        commit("setCleanObjectForm");
      })
      .then(() => {
        getters.getInstrument.setImagesForDrawObjects();
      });
  },

  //Запуск расчета профиля высот и объемов
  setActionMathCalc({ state, commit, getters }, inSelDraw) {
    //Прячем предварительно окна с графиками и маркерами
    commit("setStateMapValue", { field: "showGraphPlotChart", value: false });
    commit("setStateMapValue", { field: "showPhoto", value: false });
    commit("setStateMapValue", { field: "currentInstrument", value: 0 });

    //Запуск метода расчета высот по измерениям
    addExtension.setForAxiosWithState(commit, {
      letUrlAction: getters.getInstrument.setRequestActionInstr(inSelDraw),
      goodCallBack: () => {
        //Активация панели маркеров и графиков
        commit("setShowMarkerAndInstrumentsMode", {
          ins: state.currentInstrument,
          curDraw: inSelDraw
        });
      }
    });
  },

  //Удаление объекта с локальной таблицы
  setActionDelMapObj({ state, commit, getters }, inSelDraw) {
    //Копия для выборки
    let arrServerMapObj = state.mapObjListServer || [];
    arrServerMapObj = arrServerMapObj.filter(x => x.properties.id);

    commit("setRefreshMapObjTable");

    //Тайминг :\\
    setTimeout(() => {
      //Убиваем текущую измерялку
      state.mapObjListDraw.trash();
      commit("setStateMapValue", { field: "currentInstrument", value: 0 });
      if (inSelDraw) {
        //Сначала грохаем сам элемент с карты, если есть такой
        const elemDraw = state.mapObjListDraw
          .getAll()
          .features.find(x => x.id === inSelDraw.id);
        const finalElem = elemDraw || inSelDraw;
        //Потом с таблицы, если и там есть
        if (finalElem) {
          const elemDrawFeature = state.mapObjListDraw.add(finalElem);
          state.mapObjListDraw.delete(elemDrawFeature);
          //Ну а потом удаляем его из таблицы объектов
          const arrServerMapObjIdList = arrServerMapObj.map(x => x.id);
          const indexCurrElem = arrServerMapObjIdList.indexOf(finalElem.id);
          if (indexCurrElem !== -1) {
            arrServerMapObj.splice(indexCurrElem, 1);
          }
        }
      }
      //Перезаписываем
      commit("setStateMapValue", {
        field: "mapObjListServer",
        value: arrServerMapObj
      });
      getters.getInstrument.setImagesForDrawObjects();
    }, 100);
  },

  //Обертка над возвратом или сохранением схем
  setConfirmActionMapObj({ commit, dispatch }, inSaveAction) {
    let actionPromise = new Promise(resolve =>
      resolve(dispatch("setActionChangeColorAndReport", inSaveAction))
    );
    actionPromise.then(() => {
      if (inSaveAction) {
        commit("setStateMapValue", { field: "activeSnack", value: true });
        commit("setStateMapValue", {
          field: "activeSnackTitle",
          value: lang.getMessages("saveMapObjSuccess")
        });
      }
    });
  },

  //Собс-но, возврат или сохранение схем
  setActionChangeColorAndReport(
    { state, commit, getters, dispatch },
    typeAction
  ) {
    let tableItem = null;
    if (!typeAction) {
      privateActionsMap._setReloadMapObj({ state, commit, getters, dispatch });
    } else {
      const lastMapObjDrawUp = state.mapObjListServer.map(item => {
        tableItem = state.mapObjListTable.find(x => item.id === x.id);
        if (tableItem) {
          item.properties.numColor = tableItem.numColor;
          item.properties.isReport = tableItem.isReport;
        }
        return {
          id: item.id,
          type: item.type,
          geometry: item.geometry,
          properties: item.properties,
          measurItem: item.measurItem,
          chartData: item.chartData
        };
      });

      const lastMapObjDrawJson = JSON.stringify(lastMapObjDrawUp);
      const localObjMap = {
        MapId: state.mapId,
        MapObjListJson: lastMapObjDrawJson
      };
      addExtension.setForAxiosWithState(commit, {
        letUrlAction: api.postSaveObject(localObjMap)
      });
    }
  },

  //Стартовая загрузка данных для меню
  setLoadMenuData({ commit }) {
    commit("setStateMapValue", { field: "menuDataList", value: [] }),
      addExtension.setForAxiosWithState(commit, {
        letUrlAction: api.getMenuApi(),
        goodCallBack: response =>
          commit("setStateMapValue", {
            field: "menuDataList",
            value: response.data
          })
      });
  },

  //Стартовая загрузка данных для компонета карты
  setLoadMapData({ state, commit, dispatch }) {
    commit("setMapObjListDefault");
    commit("setStateMapValue", { field: "mapModel", value: null });
    addExtension.setForAxiosWithState(commit, {
      letUrlAction: api.getMapApi(state.mapId),
      goodCallBack: response => {
        commit("setModelMap", response.data);
        dispatch("setActionInitInstrumentData");
      }
    });
  },

  //Задаем параметры рендеринга
  setRenderDefault({ commit, dispatch }, isRunRender) {
    commit("setStateMapValue", { field: "currentInstrument", value: 0 });
    commit("setLayersRenderEnable");
    if (isRunRender) {
      dispatch("setMapRendering");
    }
  },

  setRenderLayers({ state, commit }) {
    //Eсли не заполнены основные свойства - выходим, нет смысла формировать объект Layer
    if (!privateActionsMap._getCheckMainMapProperty(state.curMap)) return;
    //Формируем 3д модель
    commit("set3dFrame", state.mapModel);
    //Формируем отснятые слои
    let layerItem = new Layer(
      state.curMap,
      state.mapModel,
      state.showColorLayer,
      state.currentMainIndex,
      state.currentAddIndex,
      state.opacityOfLayer
    );
    layerItem.setStartOptionsOfLayers();
    //Чистим ресурсы
    layerItem = null;
    commit("setLayersRenderDisable");
  },

  //Постоянный рендеринг карты, реагирующий на каждый чих
  setMapRendering({ state, commit, getters, dispatch }) {
    //Если не сформирован главный объект карты - выходим
    if (!state.curMap) return;
    //Рендеринг отснятых слоев
    if (state.isLayersRender) dispatch("setRenderLayers");
    //Рендеринг имеющихся маркеров и интсрументов измерения
    if (!state.mapObjListDraw) {
      privateActionsMap._setRenderDraw({ state, commit, getters, dispatch });
    }
  },

  //Присваиваем конструктуру сервиса InstrumentData объеты состояний
  setActionInitInstrumentData({ state, commit, dispatch }) {
    commit("setStateMapValue", {
      field: "instrumentData",
      value: new InstrumentsData(state, commit, dispatch)
    });
  },

  setShowObjectRecognized: ({ commit, state }, { data, colorArr, filter }) => {
    let layerItem = new Layer(state.curMap);
    if (filter) {
      layerItem.setDeleteLayerObject(true);
      layerItem.setRecognitionObject(data, colorArr);
    } else {
      commit("setShowMode", "showRecognizedObjects");
      if (state.showRecognizedObjects) {
        layerItem.setRecognitionObject(data, colorArr);
      } else {
        layerItem.setDeleteLayerObject(true);
      }
    }
    layerItem = null;
  },

  setChangeZoom: (commit, isUp) => {
    let elemZoom = isUp ? ".mapboxgl-ctrl-zoom-in" : ".mapboxgl-ctrl-zoom-out";
    document.querySelector(elemZoom).click();
  },

  setGoHomeLocation: ({ state }) => {
    const mapModel = state.mapModel.map;
    state.curMap.fitBounds(
      [
        [mapModel.minLon, mapModel.minLat],
        [mapModel.maxLon, mapModel.maxLat]
      ],
      { maxZoom: 15 }
    );
  },

  setActivateDrawAction: ({ commit, getters }, inTypeInstrumnet) => {
    commit("setLayersRenderDisable");
    commit("setStateMapValue", {
      field: "currentInstrument",
      value: inTypeInstrumnet
    });
    getters.getInstrument.setPropForMark(inTypeInstrumnet);
  },

  //Ведение мыши
  setActionMoveMouse({ getters }, event) {
    getters.getInstrument.setMouseMoveActivateOverObj(event);
  },

  setActionClick({ state, getters, commit }, event) {
    //Активация инструмента
    getters.getInstrument.setPreparePopupProp(event);
    //Активация панели маркеров и графиков для новых элеметнов
    commit("setShowMarkerAndInstrumentsMode", {
      ins: state.currentInstrument,
      curDraw: null
    });
  },

  setActionDblClick({ getters }, event) {
    event.preventDefault();
    getters.getInstrument.setActionInstrumnentGoMath();
  },

  //Дергаем апи для просмотра точек изменения и далнейшая их отрисовка
  setShowChangeOfLayers({ state, commit }, isShowMode) {
    commit("setStateMapValue", {
      field: "showPointsChangesCheck",
      value: isShowMode
    });
    commit("setStateMapValue", {
      field: "showColorScale",
      value: isShowMode
    });
    new Promise(resolve => {
      if (isShowMode) {
        addExtension.setForAxiosWithState(commit, {
          letUrlAction: api.getChangeResults(
            state.mainLayerId,
            state.addLayerId
          ),
          goodCallBack: response => {
            resolve(response.data);
          }
        });
      } else resolve(null);
    }).then(result =>
      privateActionsMap._setRenderPointsChange({ state, commit }, result)
    );
  },

  async setActionUploadMedia() {
    //inDropZone.processQueue();
  }
};

export default actions;
