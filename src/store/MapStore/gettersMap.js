import MathCalcHeight from 'services/MathCalcHeight'
//import Instrument     from 'services/InstrumentsData'

const getters = {

  getAllMapState: state => state,

  getLocalMap: state => state.curMap,

  getMenuList: state => state.menuDataList,

  getFrameContentWidthPx: () => inPerc =>
    !inPerc ? "auto" : `${ ( inPerc * +document.body.clientWidth ) / 100 }`,

  getClassForBoard: state => param => (state[param] ? "onBord" : "hideBord"),

  //Получаем выбранные пользователем обьекты
  getListOfMapObj: state => state.mapObjListServer,

  //Получаем MathCalcHeight
  getMathCalcHeight: state =>
    new MathCalcHeight(
      state.mapModel,
      state.currentMainIndex,
      state.currentAddIndex
    ),

  //Получаем тип объекта
  getLineOrPolygon: () => typeObj =>
    typeObj === "line" || typeObj === "polygon",

  //Получаем полный набор объект по текущим слоям с бэкенда
  getMapModel: state => state.mapModel,

  //Набор текущих индексов и id основного и доп слоя
  getLayersIndexes: state => {
    return {
      mainLayerId: state.mainLayerId,
      addLayerId: state.addLayerId,
      currentMainIndex: state.currentMainIndex,
      currentAddIndex: state.currentAddIndex
    };
  },

  //Набор объектов видимости
  getShowingObjects: state => {
    return {
      showColorLayer: state.showColorLayer,
      show3DFrame: state.show3DFrame,
      showOptionContent: state.showOptionContent,
      showInstrumentsList: state.showInstrumentsList,
      showGraphPlotChart: state.showGraphPlotChart,
      showIsChangeMainAddLayer: state.showIsChangeMainAddLayer,
      showTableMap: state.showTableMap,
      showPhoto: state.showPhoto,
      showColorScale: state.showColorScale
    };
  },

  getMapObjProperties : state => {
    return {
      isMarkersActive: state.isMarkersActive,
      isMeasureActive: state.isMeasureActive,
      isDrawShow: state.isDrawShow,
      isDrawActive: state.isDrawActive
    };
  },

  //Класс этого сервиса (не всегда нужно задавать параметры в конструктор) вызываем здесь
  //Если нужны параметры - вызываем напрямую, не через этот геттер
  getInstrument : state => state.instrumentData,

  //Текущие выбранные состояние медиа объектов
  getMediaData : state => {
    return {
      currentInstrument : state.currentInstrument,
      isMedia           : state.isMedia,
      isPhotoMedia      : state.isPhotoMedia,
      mediaIndex        : state.mediaIndex,
      mediaVideo        : state.mediaVideo,
      mediaImageList    : state.mediaImageList, 
    }
  },

  //Данные модалки
  getModalData : state => {
    return {
      activeModal      : state.activeModal,
      activeModalTitle : state.activeModalTitle,
      activeSnack      : state.activeSnack,
      activeSnackTitle : state.activeSnackTitle,
      activeSnackError : state.activeSnackError,
    }
  }

};

export default getters;
