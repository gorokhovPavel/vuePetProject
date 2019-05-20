const state = {

    isRuLang : false,
    
    curMap       : null,
    mapId        : null,
    menuDataList : null,
    mapModel     : null,
    idNewObject  : null,
    loading      : false,

    isExistColorCurrentLayer : null,
    selected3dFrameSrc       : '',

    instrumentData : null,

    showOptionContent        : true,
    showInstrumentsList      : true,    
    showColorLayer           : false,
    show3DFrame              : false,
    showGraphPlotChart       : false,
    showIsChangeMainAddLayer : false,
    showTableMap             : false,
    showPhoto                : false,
    showColorScale           : false,

    mainLayerId       : 0,
    addLayerId        : 0,
    currentMainIndex  : 0,
    currentAddIndex   : 0,
    opacityOfLayer    : 1,
    isLayersRender    : true,

    nameObject : '',
    dateObject : new Date(),
    commentObject : '',  

    listOfInstruments : [
        { id : 1, name : 'height',  category : 1 },
        { id : 2, name : 'line',    category : 1 },
        { id : 3, name : 'polygon', category : 1 },
        { id : 4, name : 'point',   category : 2 },
        { id : 5, name : 'photo',   category : 2 },
        { id : 6, name : 'video',   category : 2 },
    ],

    listOfOptions : [
        { objName : 'showTableMap',        imgName : 'table' },
        { objName : 'showInstrumentsList', imgName : 'instrument' },
        { objName : 'showColorLayer',      imgName : 'colormap' },
        { objName : 'show3DFrame',         imgName : 'threed' },
        { objName : 'showGraphPlotChart',  imgName : 'analitics' },
        { objName : 'showPhoto',           imgName : 'photo' },
        { objName : 'showOptionContent',   imgName : 'changelayer' },
    ],

    mapObjListDraw   : null,
    mapObjListServer : null,
    mapObjListTable  : null,

    isMarkersActive : true,
    isMeasureActive : true,
    isDrawShow      : false,
    isDrawActive    : true,

    flagOfMapObj    : false,

    activeModal      : false,
    activeModalTitle : '',
    activeSnack      : false,
    activeSnackTitle : '',
    activeSnackError : false,

    activeConfrmDialogAction : {
        nameAction : null,
        dataAction : null
    },

    currentInstrument : 0,
    isMedia           : true,
    isPhotoMedia      : true,
    mediaIndex        : null,
    mediaVideo        : null,
        //require('content/download/1.mp4'),
    mediaImageList    : null, 
    // [
    //     require('content/download/1.jpg'),
    //     require('content/download/2.jpg'),
    //     require('content/download/3.jpg'),
    //     require('content/download/4.jpg'),
    //     require('content/download/1.jpg'),
    //     require('content/download/2.jpg'),
    //     require('content/download/3.jpg'),
    //     require('content/download/4.jpg'),
    //     require('content/download/1.jpg'),
    //     require('content/download/2.jpg'),
    //     require('content/download/3.jpg'),
    //     require('content/download/4.jpg'),
    // ],

    pointsOfChanges    : null,
}

export default state;