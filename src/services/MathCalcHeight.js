import * as turf    from '@turf/turf'
import geolib       from 'geolib'

import lang         from 'language/Translate'
import buildChart   from 'services/BuildChart'
import ext          from 'services/AddExtension'

import api          from 'api/apiConfig'

export default class MathCalcHeight{

    constructor( inModelMap, inIndMain, inIndAdd ){

        this.mapModel = inModelMap;
        this.dxVal    = 0;
        this.indMain  = inIndMain; 
        this.indAdd   = inIndAdd;
    }

    async getHeightsLine(clickDraw, isReport = false){

        const lineWidth  = this.getTotalDistanceStr( clickDraw, false );
        const lineStr    = this.getTotalDistanceStr( clickDraw, true );
       
        return await this._lineHeights( clickDraw, lineWidth, lineStr, isReport );
    }
      
    async getVolume(inFeature, isReport = false){

        //Площадь и периметр полигона
        let inArea            = this.getTotalDistanceStr(inFeature, false) * 1000;
        let perimetrAndSquare = this.getTotalDistanceStr(inFeature, true);

        //Генерим точность, исходя из площади объекта
        let volumeAccurMeter = Math.sqrt(inArea) / 10;
        volumeAccurMeter = volumeAccurMeter < 0.5 ? 0.5 : volumeAccurMeter;

        //Получаем координаты граней многоугольника, удаляем одну лишнюю, что зачем-то создается в geometry
        let arrCoordPoint = inFeature.geometry.coordinates[0];
        arrCoordPoint.splice(0, 1);

        let useThreeDCheck = true;

        //Получаем все координаты для дальнейших расчетов
        let allPointsObj   = this._getAllPoint(arrCoordPoint, volumeAccurMeter, useThreeDCheck);

        //Вычисление высот по координатам в старом и новом полигонах
        let arrHeightNew = await this._getHeights(allPointsObj.arrGlobalInterPoint, true,  'volume', allPointsObj.pointsPerLine);
        let arrHeightOld = await this._getHeights(allPointsObj.arrGlobalInterPoint, false, 'volume', allPointsObj.pointsPerLine);

        //Парсинг предыдущих двумерных массивов в одномерные для 3д
        let arrHeightsFor3dNew = this._getPartHeights(allPointsObj.partArrPoint, arrHeightNew);
        let arrHeightsFor3dOld = this._getPartHeights(allPointsObj.partArrPoint, arrHeightOld);

        //Тянем объем полигона старого и нового слоев, а также фирмируем строки с инфой и разницу объемов 
        let volumeNew = this._getNumericalIntVolume(this.dxVal, arrHeightsFor3dNew);
        let volumeOld = parseInt(this._getNumericalIntVolume(this.dxVal, arrHeightsFor3dOld), 0);

        let volumeStrNew = this._setLineToStr(volumeNew, 1);
        let volumeStrOld = this._setLineToStr(volumeOld, 1);

        let volumeD = this._setLineToStr((volumeNew - volumeOld), 1);

        //Вытаскиваем периметр и площадь из входной строки
        let perimetrForDb = '';
        let squareForDb = '';

        let arrPS     = perimetrAndSquare.split(';');
        perimetrForDb = arrPS[0];
        squareForDb   = arrPS[1];

        //Общая информация об объекте
        let polygonInfo = [

            `${perimetrForDb}, ${squareForDb}`,

            `${ !volumeStrNew ?  "" : `${lang.getMessages('volumeMainLayer')} : ${volumeStrNew} <br/>` }
             ${ !volumeStrOld ?  "" : `${lang.getMessages('volumeAddLayer')}  : ${volumeStrOld} <br/>` }
             ${ !volumeD ?       "" : `${lang.getMessages('amountChangesVolumes')} : ${volumeD}` }`
        ];

        let arrHeightsFor3dAll = null;
        if (useThreeDCheck)
            arrHeightsFor3dAll = [ arrHeightsFor3dNew, arrHeightsFor3dOld ];

        const reportObject = { id: inFeature.id, isReport };
        buildChart.addThreeDimGraph( arrHeightsFor3dAll, polygonInfo, reportObject );
      
        const averageVolume = (volumeNew + volumeOld) / 2;
      
        return { perimetr: this._getPerimetr(inFeature), 
                 area: this._getArea(inFeature), 
                 totalVolume: volumeNew > 1000000000 ? 
                              (volumeNew / 1000000000).toFixed(0) : volumeNew.toFixed(0),
                 averageVolume: averageVolume.toFixed(0) };
    }

    //Общая формула для вычисления объема
    _getNumericalIntVolume(dx, array3D) {
        if (!array3D)
            return;

        //Здесь, в отличие от вышеуказанного вычисления интеграла,
        //разбиваем многоугольник на мини-квадраты и складываем V каждого
        dx *= dx;

        let resVolume = 0;
        array3D.forEach( arr => {
            arr.forEach( item => {
                resVolume += (dx * item);
            });
        });

        return resVolume;
    }

    //Преобразование одномерного массива в двумерный, разбитый по частям для 3д графика 
    _getPartHeights(partArr, allArrHeight) {
        if (!allArrHeight)
            return;

        let testHeights = [];
        let testHeightsIndex = 0;

        for (let i = 0; i < partArr.length; i++) {
            let partHeights = [];
            for (let j = 0; j < partArr[i].length; j++) {
                partHeights.push(allArrHeight[testHeightsIndex]);
                testHeightsIndex++;
            }

            testHeights.push(partHeights);
        }

        return testHeights;
    }

    getTotalDistanceStr(objLine, isTypeStr){
        
        let outStr = null;

        if (objLine.geometry.type == 'LineString') {
            
            let lineDistance = turf.lineDistance(objLine);
            
            if (isTypeStr)
                outStr = `${lang.getMessages('width')} : ${ this._setLineToStr(lineDistance, 2)}`;
            else
                outStr = lineDistance;
        }
        else {

            let perimetr = turf.lineDistance(turf.lineString(objLine.geometry.coordinates[0]));
            let strPerimetr = `${lang.getMessages('perimetr')} : ${ this._setLineToStr(perimetr, 2)} ;`;

            let area = turf.area(objLine) / 1000;
            let strArea = area != 0 ? `${lang.getMessages('square')} : ${ this._setLineToStr(area, 3)}<sup>2</sup>` : '';

            if (isTypeStr)
                outStr = strPerimetr + strArea;
            else
                outStr = area;
        }

        return outStr;
    }

    getStartCoord( thisDrawItem ){
        const resCoord = 
            (thisDrawItem.geometry.coordinates[0][0] != undefined && thisDrawItem.geometry.coordinates[0][0].length == 2) ?

                thisDrawItem.geometry.coordinates[0][0] :
                    (thisDrawItem.geometry.coordinates[0] != undefined && thisDrawItem.geometry.coordinates[0].length == 2) ?

                        thisDrawItem.geometry.coordinates[0] :
                        thisDrawItem.geometry.coordinates;
        
        return resCoord;
    } 

    //Получаем полный набор координат, находящийся внутри многоугольника.
    _getAllPoint(inArrCoordPoint, inVolumeAccurMeter, inUseThreeDCheck) {

        let startCoordInLineArr = [];
        let finCoordInLineArr = [];

        let extremData = this._getExtremCoordForVolume(inArrCoordPoint);

        //Узнаем длину квадрата, по точкам которого будет строиться 3д график
        let widthOfSquare = turf.lineDistance(turf.lineString([extremData[0], extremData[3]]));

        let isSquarePolygon = inUseThreeDCheck;
        startCoordInLineArr = this._getArrLinePoints([extremData[0], extremData[1]], inVolumeAccurMeter, widthOfSquare, isSquarePolygon);
        finCoordInLineArr   = this._getArrLinePoints([extremData[3], extremData[2]], inVolumeAccurMeter, widthOfSquare, isSquarePolygon);

        //Создаем и заполняем массивы, что подаем на выход 
        let arrPointsForVolume  = [];
        let arrPointsFor3d      = [];
        let arrLinePontsForTest = [];
        let arrInterPoint       = [];

        //Ищем точки пересечения, ч1 => Сперва берем все линии из входного многоугольника
        let arrTurfLs = this._getArrLineStrForTurfIntersect(inArrCoordPoint);

        for (let i = 0; i < startCoordInLineArr.length; i++) {
            //Точки границ по разрезам 3д-квадрата для тестовых линий
            arrLinePontsForTest.push(startCoordInLineArr[i], finCoordInLineArr[i]);

            //Текущая линия разреза по 3д квадрату, слева-направо
            let nextTurfLine = turf.lineString([startCoordInLineArr[i], finCoordInLineArr[i]]);
            let curCoordStEnd = [];

            //Ищем точки пересечения, ч2 => Находим точки пересечения со стороной 3д-квадрата
            arrTurfLs.forEach(startTurfLine => {

                let intersects = turf.lineIntersect(startTurfLine, nextTurfLine);
                if (intersects.features.length !== 0) {

                    let turfIntersectCoord = intersects.features[0].geometry.coordinates;
                    curCoordStEnd.push([turfIntersectCoord[0], turfIntersectCoord[1]]);
                }
            });

            //Смотрим - делается ли вычисление объема с учетом 3д графика, или нет. Если да - берем координаты по полному квадрату, что покрывает многоугольник
            if (inUseThreeDCheck) {
                curCoordStEnd = [startCoordInLineArr[i], finCoordInLineArr[i]];
                arrInterPoint = this._getArrLinePointsAll(curCoordStEnd, startCoordInLineArr.length - 1, i, isSquarePolygon);
            } else {
                //Если нет - смотрим на наличие пересекающихся точек, и исходя от них выбираем соответствующий массив
                if (curCoordStEnd.length) {
                    //Узнаем длину квадрата, по точкам которого будет строиться 3д график
                    widthOfSquare = turf.lineDistance(turf.lineString(curCoordStEnd));
                    let curCoordStEndLength = this._getArrLinePoints(curCoordStEnd, inVolumeAccurMeter, widthOfSquare, isSquarePolygon).length - 1;
                    arrInterPoint = this._getArrLinePointsAll(curCoordStEnd, curCoordStEndLength, i, isSquarePolygon);
                }
            }

            if (curCoordStEnd.length) {
                arrPointsFor3d.push(arrInterPoint);
                for (let j = 0; j < arrInterPoint.length; j++)
                    arrPointsForVolume.push(arrInterPoint[j]);
            }
        }

        //Создаем финальное дерево объектов, что имеет в себе эти массивы и подаем на выход
        let allPointsData = {

            partArrPoint: arrPointsFor3d,
            arrGlobalInterPoint: arrPointsForVolume,
            arrLine: arrLinePontsForTest,
            pointsPerLine: inUseThreeDCheck ? startCoordInLineArr.length : arrPointsFor3d.length
        };

        return allPointsData;
    }

    //Создаем массив из объектов turfLineStr по каждой стороне входного многоугольника
    _getArrLineStrForTurfIntersect(inArrCoordOfPolygon) {

        //Добавляем к входному набору точек еще и первую от этого самого набора, дабы замкнуть многоугольник
        let inArrCoordOfPolygonU = inArrCoordOfPolygon;
        inArrCoordOfPolygonU.push([inArrCoordOfPolygon[0][0], inArrCoordOfPolygon[0][1]]);
        let turfLsArr = [];

        for (let i = 0; i < inArrCoordOfPolygonU.length; i++) {

            if (inArrCoordOfPolygonU[i + 1]) {

                let turfLs = turf.lineString([inArrCoordOfPolygonU[i], inArrCoordOfPolygonU[i + 1]]);

                turfLsArr.push(turfLs);
            }
        }

        return turfLsArr;
    }

    _getExtremCoordForVolume(inArrCoord) {

        //Вершины выделенного многоугольника
        //Требование клиента - убрать вершины
        //addPointsToMapForTestCoord(inArrCoord);

        let arrX = []; //longitude
        let arrY = []; //latitude

        for (let i = 0; i < inArrCoord.length; i++) {

            arrX.push(inArrCoord[i][0]);
            arrY.push(inArrCoord[i][1]);
        }

        arrX.sort();
        arrY.sort();

        //https://github.com/manuelbieh/Geolib
        let onseSideDistanse = geolib.getDistance(
            { latitude: arrY[0], longitude: arrX[0] },
            { latitude: arrY[arrY.length - 1], longitude: arrX[0] },
            1,
            3
        );
        let onseSideDistanse2 = geolib.getDistance(
            { latitude: arrY[0], longitude: arrX[0] },
            { latitude: arrY[0], longitude: arrX[arrX.length - 1] },
            1,
            3
        );
        let maxDist = onseSideDistanse;
        if (onseSideDistanse2 > maxDist) {
            maxDist = onseSideDistanse2;
        }

        let point1 = { latitude: arrY[0], longitude: arrX[0] };
        let point2 = geolib.computeDestinationPoint(point1, maxDist, 0);
        let point3 = geolib.computeDestinationPoint(point1, maxDist, 90);
        let point4 = geolib.computeDestinationPoint(point3, maxDist, 0);

        let finExtremData = [
              [point1.longitude, point1.latitude]
            , [point2.longitude, point2.latitude]
            , [point4.longitude, point4.latitude]
            , [point3.longitude, point3.latitude]
        ];

        //Вершины 3д-квадрата
        //addPointsToMapForTestCoord(finExtremData, "#0AA708"); //3

        return finExtremData;
    }

    //Здесь делаем разрез высот
    async _lineHeights(objPoints, widthLine, strLineWidth, isReport) {

        const arrCoordPoint = objPoints.geometry.coordinates;
        const arrPoint = this._getArrLinePoints(arrCoordPoint, null, widthLine, false);

        const arrHeightNew = await this._getHeights(arrPoint, true,  'line', arrPoint.length);
        const arrHeightOld = await this._getHeights(arrPoint, false, 'line', arrPoint.length);

        const arrHeight = [arrHeightNew, arrHeightOld];
        const reportObject = { id: objPoints.id, isReport };
    
        let upMathArrHeight = arrHeight.map( x => this._getMathDataFromArr(x));

        buildChart.addTwoDimGraph(arrHeight, strLineWidth, this.dxVal, reportObject);
        
        return upMathArrHeight;
    }

    _getMathDataFromArr(inArr){

        if( !inArr || inArr.length < 2 )
            return;
        
        let minInArr  = Math.min( ...inArr );
        let maxInArr  = Math.max( ...inArr );
        let averInArr = this._getAverageFromArr(inArr);

        let mathData = {

            min  :  minInArr.toFixed(2),
            max  :  maxInArr.toFixed(2),
            aver : averInArr.toFixed(2)
        }

        return mathData
    }

    _getAverageFromArr( inArrData ){

        let cntInArr = inArrData.length;
        let sumInArr = 0;
        let resAver  = 0;

        inArrData.forEach( x => sumInArr += x );
        resAver = sumInArr/cntInArr;

        return resAver;
    }

    _getArrLinePoints(arrInpCoord, inAccurMeter, distanseLine, squarePolygon) {

        let preciseCoeff = 3;
        
        if (!inAccurMeter)
            inAccurMeter = 0.5;
    
        distanseLine *= 1000;
        let stepCount = (distanseLine / inAccurMeter) * preciseCoeff;
        this.dxVal = distanseLine / stepCount;
        
        return this._getArrLinePointsAll(arrInpCoord, stepCount, null, squarePolygon);
    }

    _getArrLinePointsAll(arrInpCoord, inStepCount, rowNumber, squarePolygon) {

        let x1 = parseFloat(arrInpCoord[0][0]);
        let y1 = parseFloat(arrInpCoord[0][1]);
        let x2 = parseFloat(arrInpCoord[1][0]);
        let y2 = parseFloat(arrInpCoord[1][1]);
    
        //если шагов меньше одного, берётся первая точка отрезка
        if (inStepCount < 1) 
            return [x1, y1]
    
        //if для квадратного полигона:
        //else для не квадратного полигона:
        if (squarePolygon) { 
            let arrAllIn = [];
            for (let j = 0; j <= inStepCount; j++) {
                let curX = x1 * (1 - (j / inStepCount)) + x2 * (j / inStepCount);
                let curY = y1 * (1 - (j / inStepCount)) + y2 * (j / inStepCount);
                arrAllIn.push([curX, curY, rowNumber, j]);
            }
            return arrAllIn;
        }
        else { 
            let arrAllIn = [];
            for (let j = 0; j < inStepCount; j++) {
                let curX = x1 * (1 - (j / inStepCount)) + x2 * (j / inStepCount);
                let curY = y1 * (1 - (j / inStepCount)) + y2 * (j / inStepCount);
                arrAllIn.push([curX, curY, rowNumber, j]);
            }
    
            arrAllIn.push([x2, y2, rowNumber, inStepCount]);
            return arrAllIn;
        }
    }

    async _getHeights( arrInpPoint, isNewHeights, type, pointsPerLine, isOnlyOnePoint ) {

        let zeroMark = 0;
        let indexForRequest = isNewHeights ? this.indMain : this.indAdd;
        let skyHeightsIdDb = this.mapModel.layers[indexForRequest].id;
        let skyHeightsId   = this.mapModel.heightsMapIdConfigList[indexForRequest];
        let skyHeightsName = this.mapModel.heightsMapNameConfigList[indexForRequest];
        
        let useMapbox = false;

        if ( useMapbox ){

            //высоты по координатам берутся из mapbox
            let limitMapBoxService = 200;
            let arrPointStr = [];
            let outHeightsArr = [];
    
            //разбивает на массивы "по порядку"
            let data = ext.getChunksArray(arrInpPoint.slice(0), limitMapBoxService);
            for (let ii = 0; ii < data.length; ii++) {
                let pointStrTemp = '';
                for (let jj = 0; jj < data[ii].length; jj++) 
                    pointStrTemp += data[ii][jj][1] + ',' + data[ii][jj][0] + ';';

                // delete last ';'
                pointStrTemp = pointStrTemp.substring(0, pointStrTemp.length - 1); 
                arrPointStr.push(pointStrTemp);
            }
             
            for (let i = 0; i < arrPointStr.length; i++) {
                let url = 
                    `https://api.mapbox.com/v4/${skyHeightsId}/tilequery/${arrPointStr[i]}.json?radius=3&access_token=${this.mapModel.accessToken}`;

                await api.getDataFromMapBox(url)
                    .then( res => {
                        let outParseData = ext.setParseJsonToData(res.data, zeroMark);
                        outHeightsArr = outHeightsArr.concat(outParseData);
                    })
                    .catch( 
                        error => console.log(error)
                    );
            }
     
            return outHeightsArr;
        } else {
            //для каждого массива координат необходимо создать полигон, вмещающий в себя все эти точки.
            //Полигон должен быть как можно меньше, чтобы sql работал быстрее (если он будет слишком большой, то он охватит слишком много точек, по которым надо будет искать высоты для массива координат)
            //если это 1. объемный полигон - он разбивается на строки, в пределах которой у координат одинаковая широта (или долгота). Поиск по каждой строке производится отдельно.
            //если это 2. линия, то она в любом случае разбивается не более чем 250 точек за раз, т.к. линия может идти наискось, и у всех точек будут разные "широта/долгота" и поиск сразу по всем точкам нагрузит базу.
            let pointsPerRequest;
            let pointCountToSmooth; //коэфф. сглаживания
    
            if (type == 'volume') {
                if (pointsPerLine != null) {
                    pointsPerRequest = pointsPerLine; //поиск сразу по всей колонке или строке
                } else {
                    pointsPerRequest = 250;
                }
            } else if (type == 'line') {
                pointCountToSmooth = 2; //document.getElementById('IdSmoothLineCoeff').value;
                if (pointCountToSmooth < 0) {
    
                    alert(getMessages('ruleSmothMin'));
                    pointCountToSmooth = 0
                }
                if (pointCountToSmooth > 1000) {
    
                    alert(getMessages('ruleSmothMax'));
                    pointCountToSmooth = 1000
                }
    
                pointsPerRequest = 250;
            }
    
            let subRequests = [];
            let data2 = ext.getChunksArray(arrInpPoint.slice(0), pointsPerRequest);
    
            for (let k = 0; k < data2.length; k++) {
                //если в пределах строки объемного полигона точек более чем 1000, то они также разбиваются на части
                let subDataArr;
                if (data2[k].length > 1000) 
                    subDataArr = ext.getChunksArray(data2[k].slice(0), 1000);
                else 
                    subDataArr = [data2[k]];
    
                for ( let s = 0; s < subDataArr.length; s++ ) {
                    let latMax = subDataArr[s][0][1];
                    let latMin = subDataArr[s][0][1];
                    let longMax = subDataArr[s][0][0];
                    let longMin = subDataArr[s][0][0];
    
                    for (let ii = 0; ii < subDataArr[s].length; ii++) {
                        if (subDataArr[s][ii][1] > latMax) {
                            latMax = subDataArr[s][ii][1];
                        }
                        if (subDataArr[s][ii][1] < latMin) {
                            latMin = subDataArr[s][ii][1];
                        }
                        if (subDataArr[s][ii][0] > longMax) {
                            longMax = subDataArr[s][ii][0];
                        }
                        if (subDataArr[s][ii][0] < longMin) {
                            longMin = subDataArr[s][ii][0];
                        }
                    }
    
                    //здесь вычисляются точки полигона, по которому будет производиться поиск, путем прибавления 5 см (этого достаточно) ко всем сторонам
                    let addMeters = 0.05;
                    let rangePoints = [];
    
                    rangePoints.push(geolib.computeDestinationPoint({ latitude: latMax, longitude: longMax }, addMeters, 0));
                    rangePoints.push(geolib.computeDestinationPoint({ latitude: latMax, longitude: longMax }, addMeters, 90));
                    rangePoints.push(geolib.computeDestinationPoint({ latitude: latMax, longitude: longMax }, addMeters, 180));
                    rangePoints.push(geolib.computeDestinationPoint({ latitude: latMax, longitude: longMax }, addMeters, 270));
                    
                    rangePoints.push(geolib.computeDestinationPoint({ latitude: latMax, longitude: longMin }, addMeters, 0));
                    rangePoints.push(geolib.computeDestinationPoint({ latitude: latMax, longitude: longMin }, addMeters, 90));
                    rangePoints.push(geolib.computeDestinationPoint({ latitude: latMax, longitude: longMin }, addMeters, 180));
                    rangePoints.push(geolib.computeDestinationPoint({ latitude: latMax, longitude: longMin }, addMeters, 270));
    
                    rangePoints.push(geolib.computeDestinationPoint({ latitude: latMin, longitude: longMin }, addMeters, 0));
                    rangePoints.push(geolib.computeDestinationPoint({ latitude: latMin, longitude: longMin }, addMeters, 90));
                    rangePoints.push(geolib.computeDestinationPoint({ latitude: latMin, longitude: longMin }, addMeters, 180));
                    rangePoints.push(geolib.computeDestinationPoint({ latitude: latMin, longitude: longMin }, addMeters, 270));
    
                    rangePoints.push(geolib.computeDestinationPoint({ latitude: latMin, longitude: longMax }, addMeters, 0));
                    rangePoints.push(geolib.computeDestinationPoint({ latitude: latMin, longitude: longMax }, addMeters, 90));
                    rangePoints.push(geolib.computeDestinationPoint({ latitude: latMin, longitude: longMax }, addMeters, 180));
                    rangePoints.push(geolib.computeDestinationPoint({ latitude: latMin, longitude: longMax }, addMeters, 270));
    
                    let latMaxNew = rangePoints[0].latitude;
                    let latMinNew = rangePoints[0].latitude;
                    let longMaxNew = rangePoints[0].longitude;
                    let longMinNew = rangePoints[0].longitude;
    
                    for ( let m = 0; m < rangePoints.length; m++ ) {
                        if (rangePoints[m].latitude > latMaxNew) {
                            latMaxNew = rangePoints[m].latitude;
                        }
                        if (rangePoints[m].latitude < latMinNew) {
                            latMinNew = rangePoints[m].latitude;
                        }
                        if (rangePoints[m].longitude > longMaxNew) {
                            longMaxNew = rangePoints[m].longitude;
                        }
                        if (rangePoints[m].longitude < longMinNew) {
                            longMinNew = rangePoints[m].longitude;
                        }
                    }
    
                    let reqObj = {
                        layer              : skyHeightsName,
                        layerId            : skyHeightsIdDb,
                        fields             : 'Height',
                        pointsArray        : subDataArr[s],
                        pointCountToSmooth : pointCountToSmooth,
                        LongtitudeMin      : longMinNew,
                        LongtitudeMax      : longMaxNew,
                        LatitudeMin        : latMinNew,
                        LatitudeMax        : latMaxNew
                    };
                    subRequests.push(reqObj);
                }
            }
    
            let itemsPerRequest = 20; //по сколько объектов запросить за один HTTP: запрос
            let dataPerRequest = ext.getChunksArray( subRequests.slice(0), itemsPerRequest );

            let outHeightsArr2 = [];
            for ( let m = 0; m < dataPerRequest.length; m++ ) {
                await api.postLayerPoints({ 
                    Arr : dataPerRequest[m] 
                }).then(response=>{
                    const localRes = ext.setParseJsonToData(response.data, zeroMark);
                    outHeightsArr2 = outHeightsArr2.concat(localRes);
                }).catch(err=>{
                    console.log(err);
                });
            }

            return outHeightsArr2;
        }
    }
    
    _setLineToStr(inWidth, typeIzm) {
        if (!inWidth)
            return;
    
        if (typeIzm == 1) { //расчет объемов
            return inWidth > 1000000000 ?
    
                (inWidth / 1000000000).toFixed(2) + lang.getMessages('cubokilometer') :
                inWidth.toFixed(2) + lang.getMessages('cubometer');
        }
        else if (typeIzm == 2) { //расчет отрезка и периметра
            return inWidth < 1 ?
                   (inWidth * 1000).toFixed(2) + lang.getMessages('meter') :
                   inWidth.toFixed(2) + lang.getMessages('kilometer');
        }
        else { //расчет площадей и всего остального
    
            return inWidth/1000 > 1 ?
                    (inWidth / 1000000).toFixed(2) + lang.getMessages('kilometer') :
                    (inWidth*1000).toFixed(2) + lang.getMessages('meter');
        }
    }

    _getPerimetr(obj){
        const perimetr = turf.lineDistance(turf.lineString(obj.geometry.coordinates[0]));
        return perimetr < 1 ? (perimetr * 1000).toFixed(0) : perimetr.toFixed(0);
    }

    _getArea(obj){
        const area = turf.area(obj) / 1000;
        return area / 1000 > 1 ? (area / 1000000).toFixed(0) : (area * 1000).toFixed(0);
    }
}