const state = {
  isRuLang: false,

  antVuex: {},

  curMap: null,
  mapId: null,
  menuDataList: null,
  mapModel: null,
  idNewObject: null,
  loading: false,
  zoomMap: 15,

  isExistColorCurrentLayer: null,
  selected3dFrameSrc: "",

  instrumentData: null,
  instrumentCurrentId: null,

  showRecognizedObjects: false,
  showPointsChangesCheck: false,
  showOptionContent: true,
  showInstrumentsList: true,
  showColorLayer: false,
  show3DFrame: false,
  show3DPanel: false,
  showGraphPlotChart: false,
  showTableMap: false,
  showPhoto: false,
  showScaleReady: false,

  infoCardIsWorkDoc: false,
  infoCardIsBuildDoc: false,
  infoCardIsSum: false,
  infoCardFinalReadyParam: null,

  is3dVolume: true,
  isActiveAddLayer: true,
  mainLayerId: 0,
  addLayerId: 0,
  currentMainIndex: 0,
  currentAddIndex: 0,
  opacityOfLayer: 1,
  isLayersRender: true,
  selectedDataCheckArr: [],
  isAllLayers: false,

  nameObject: "",
  dateObject: new Date(),
  commentObject: "",

  listOfInstruments: [
    { id: 1, name: "column-height", category: 1, type: "pointHeight" },
    { id: 2, name: "line", category: 1, type: "line" },
    { id: 3, name: "radar-chart", category: 1, type: "polygon" },
    { id: 4, name: "environment", category: 2, type: "point" },
    { id: 5, name: "camera", category: 2, type: "photo" },
    { id: 6, name: "video-camera", category: 2, type: "video" },
    { id: 7, name: "info", category: 2, type: "infoCard" },
    { id: 8, name: "warning", category: 2, type: "circle" }
  ],

  mapObjListDraw: null,
  mapObjListServer: null,
  mapObjListTable: null,

  isDrawShow: true,
  isDrawActive: false,
  isMarkersActive: true,
  isMeasureActive: true,
  isMenuInfoActive: false,

  menuInfoData: null,
  flagOfMapObj: false,

  activeModal: false,
  activeModalTitle: "",
  activeModalName: false,

  activeConfrmDialogAction: {
    nameAction: null,
    dataAction: null
  },

  currentInstrument: 0,
  isMedia: true,
  isPhotoMedia: true,
  mediaIndex: null,
  mediaVideo: "https://youtu.be/StPk8nYOdig",
  mediaImageList: null,
  //[
  // require('content/download/1.mp4'),
  // require('content/download/1.jpg'),
  // require('content/download/2.jpg'),
  // require('content/download/3.jpg'),
  // require('content/download/4.jpg'),
  // require('content/download/1.jpg'),
  // require('content/download/2.jpg'),
  // require('content/download/3.jpg'),
  // require('content/download/4.jpg'),
  // require('content/download/1.jpg'),
  // require('content/download/2.jpg'),
  // require('content/download/3.jpg'),
  // require('content/download/4.jpg'),
  //]

  antMessage: null
};

export default state;
