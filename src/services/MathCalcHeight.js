import * as turf from '@turf/turf'
import geolib from 'geolib'
import lang from 'language/Translate'
import buildChart from 'services/BuildChart'
import ext from 'services/AddExtension'
import api from 'api/apiConfig'

export default class MathCalcHeight {

    constructor( inModelMap, inIndMain, inIndAdd, inSelectedDataCheckArr ) {
        this.dxVal = 0;
        this.mapModel = inModelMap;
        this.indMain = inIndMain; 
        this.indAdd = inIndAdd;
        this.selectedDataCheckArr = inSelectedDataCheckArr ;
    }

    async getHeightsLine( clickDraw, isReport, isMoreOneLayer = true ) {
        const lineWidth = this.getTotalDistanceStr( clickDraw, false );
        const lineStr = this.getTotalDistanceStr( clickDraw, true );
        return await this._lineHeights( clickDraw, lineWidth, lineStr, isReport, isMoreOneLayer );
    }

    async getVolume( inFeature, isReport = false, isMoreOneLayer = true, useThreeDCheck = true ) {
        //Площадь и периметр полигона
        let finalRes = null;
        const inArea = this.getTotalDistanceStr( inFeature, false ) * 1000;
        const perimetrAndSquare = this.getTotalDistanceStr( inFeature, true );
        const reportObject = isReport ? { id : inFeature.id, isReport } : null;

        //Генерим точность, исходя из площади объекта
        let volumeAccurMeter = Math.sqrt( inArea ) / 10;
        volumeAccurMeter = volumeAccurMeter < 0.5 ? 0.5 : volumeAccurMeter;

        //Получаем координаты граней многоугольника, удаляем одну лишнюю, что зачем-то создается в geometry
        let arrCoordPoint = inFeature.geometry.coordinates[0];
        arrCoordPoint.splice( 0, 1 );

        //Получаем все координаты для дальнейших расчетов, смотрим на все слои 
        const allPointsObj = this._getAllPoint( arrCoordPoint, volumeAccurMeter, useThreeDCheck );
        const allVolumeData = await this._getHeightsAllLayersVolume( allPointsObj, isMoreOneLayer, useThreeDCheck );

        if( useThreeDCheck ) {
            //Вытаскиваем периметр и площадь из входной строки
            const arrPS = perimetrAndSquare.split(';');
            const perimetrForDb = arrPS[0];
            const squareForDb = arrPS[1];
            
            let volumeNew = 0;
            let volumeOld = 0;
            let volumeStrNew = '';
            let volumeStrOld = '';
            let volumeDiff = 0;
            let polygonInfo = '';
            let arrHeightsFor3dAll = [];

            if( isMoreOneLayer && allVolumeData.length>1 ) {
                volumeNew = allVolumeData[1].volume;
                volumeOld = allVolumeData[0].volume;
                volumeStrNew = allVolumeData[1].volumeStr;
                volumeStrOld = allVolumeData[0].volumeStr;
                volumeDiff = this._setLineToStr((volumeNew - volumeOld), 1);

                //Общая информация об объекте
                polygonInfo = [
                    `${perimetrForDb}, ${squareForDb}`,
                    `${ !volumeStrNew ? "" : `${lang.getMessages('volumeMainLayer')} : ${volumeStrNew} <br/>` }
                     ${ !volumeStrOld ? "" : `${lang.getMessages('volumeAddLayer')}  : ${volumeStrOld} <br/>` }
                     ${ !volumeDiff ? "" : `${lang.getMessages('amountChangesVolumes')} : ${volumeDiff}` }`
                ];
            } else {
                volumeStrNew = allVolumeData[0].volumeStr;
                polygonInfo = [
                    `${perimetrForDb}, ${squareForDb}`,
                    `${ !volumeStrNew ? "" : `${lang.getMessages('volumeMainLayer')} : ${volumeStrNew} <br/>` }`
                ];
            }
            arrHeightsFor3dAll = allVolumeData.map(x=>x.arrHeightsFor3d);
            
            const heightsData = {
                inArr : arrHeightsFor3dAll, 
                inPolygonInfo : polygonInfo,
            }
            
            buildChart.addThreeDimGraph( heightsData, reportObject );
            finalRes = {
                perimetr : perimetrForDb,
                area : squareForDb,
                totalVolume : volumeNew > 1000000000 ? ( volumeNew / 1000000000 ).toFixed(0) : volumeNew.toFixed(0),
                averageVolume : (( volumeNew + volumeOld ) / 2).toFixed(0),
                heightsData : heightsData
            };
        } else {
            buildChart.addTwoDimVoluemGraph( allVolumeData, reportObject );
            finalRes = {
                heightsData : allVolumeData
            };
        }

        finalRes.useThreeDCheck = useThreeDCheck;
        return finalRes;
    }

    //Общая формула для вычисления объема
    _getNumericalIntVolume( dx, array3D ) {

        if (!array3D)
            return -1;

        //Здесь, в отличие от вышеуказанного вычисления интеграла,
        //разбиваем многоугольник на мини-квадраты и складываем V каждого
        dx *= dx;

        let resVolume = 0;
        array3D.forEach( arr => {
            arr.forEach( item => {
                if( item )
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

        for ( let i = 0; i < partArr.length; i++ ) {
            let partHeights = [];
            for (let j = 0; j < partArr[i].length; j++) {
                partHeights.push(allArrHeight[testHeightsIndex]);
                testHeightsIndex++;
            }
            testHeights.push(partHeights);
        }

        return testHeights;
    }

    getTotalDistanceStr( objDraw, isTypeStr ) {
        
        let outStr = null;
        if ( objDraw.geometry.type === 'LineString' ) {
            let lineDistance = turf.lineDistance(objDraw);
            if (isTypeStr)
                outStr = `${lang.getMessages('width')} : ${ this._setLineToStr(lineDistance, 2)}`;
            else
                outStr = lineDistance;
        } else if ( objDraw.geometry.type === 'Polygon' ) {

            let perimetr = turf.lineDistance(turf.lineString(objDraw.geometry.coordinates[0]));
            let strPerimetr = `${lang.getMessages('perimetr')} : ${ this._setLineToStr(perimetr, 2)} ;`;

            let area = turf.area( objDraw ) / 1000;
            let strArea = area != 0 ? `${lang.getMessages('square')} : ${ this._setLineToStr(area, 3)}<sup>2</sup>` : '';

            if (isTypeStr)
                outStr = strPerimetr + strArea;
            else
                outStr = area;
        } else {
            outStr = '-1';
        }

        return outStr;
    }

    getStartCoord( thisDrawItem ) {
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
        let arrPointsFor3d = [];
        let arrLinePontsForTest = [];
        let arrInterPoint = [];

        //Ищем точки пересечения, ч1 => Сперва берем все линии из входного многоугольника
        let arrTurfLs = this._getArrLineStrForTurfIntersect(inArrCoordPoint);

        for ( let i = 0; i < startCoordInLineArr.length; i++ ) {

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
    _getArrLineStrForTurfIntersect( inArrCoordOfPolygon ) {

        //Добавляем к входному набору точек еще и первую от этого самого набора, дабы замкнуть многоугольник
        let inArrCoordOfPolygonU = inArrCoordOfPolygon;
        inArrCoordOfPolygonU.push([inArrCoordOfPolygon[0][0], inArrCoordOfPolygon[0][1]]);
        let turfLsArr = [];

        for ( let i = 0; i < inArrCoordOfPolygonU.length; i++ ) {
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
    async _lineHeights( objPoints, widthLine, strLineWidth, isReport, isMoreOneLayer ) {

        const finalRes = {};
        const arrCoordPoint = objPoints.geometry.coordinates;

        if( widthLine === '-1' ) {
            let currIndex = 0;
            const  upArrCoordPoint = [[ ...arrCoordPoint, null, 0 ]];
            this._getAllSelectedLayers( false, true ).forEach((x,index)=> { if( x ) currIndex = index; });
            const currHeights = await this._getHeights( upArrCoordPoint, currIndex, 'line', 0 );
            finalRes.heightsData = { 
                inArr : currHeights
            }
        } else {
            const arrPoint = this._getArrLinePoints( arrCoordPoint, null, widthLine, false );
            const arrHeight = await this._getHeightsAllLayersLine( arrPoint, isMoreOneLayer );
            const reportObject = isReport ? { id: objPoints.id, isReport } : null;
            const dxVal = this.dxVal;

            finalRes.heightsData = { 
                inArr : arrHeight, 
                distanseLine : strLineWidth, 
                stepLine : dxVal
            }
            
            buildChart.addTwoDimGraph( finalRes.heightsData, reportObject );
        }
        return finalRes;
    }

    //Смотрим на все слои и тянем высоты для линии
    _getAllSelectedLayers( inIsMoreOneLayer, inUseThreeDCheck ) {

        let startSelectedDataCheckArr = !inUseThreeDCheck ? 
            this.selectedDataCheckArr : 
            this.selectedDataCheckArr.map( ( item, index )=> ( index === this.indMain || index === this.indAdd ) );

        let checkLayersArr = inIsMoreOneLayer ? 
            startSelectedDataCheckArr :
            startSelectedDataCheckArr.map( ()=> false );

        checkLayersArr[this.indMain] = true;
        return checkLayersArr;
    }

    //Тянем данные по всем старым слоям (Линии)
    async _getHeightsAllLayersVolume( inArrPoint, inIsMoreOneLayer, inUseThreeDCheck ) {
        
        let arrAllVolume = [];
        const checkLayersArr = this._getAllSelectedLayers( inIsMoreOneLayer, inUseThreeDCheck );

        for ( let i = 0; i < checkLayersArr.length; i++ ) {
            if( checkLayersArr[i] ) {
                const arrHeightNew = await this._getHeights( inArrPoint.arrGlobalInterPoint, i, 'volume', inArrPoint.pointsPerLine );
                //Парсинг предыдущих двумерных массивов в одномерные для 3д
                const arrHeightsFor3dNew = this._getPartHeights( inArrPoint.partArrPoint, arrHeightNew );
                //Тянем объем полигона старого и нового слоев, а также формируем строки с инфой и разницу объемов 
                const volumeNew = this._getNumericalIntVolume( this.dxVal, arrHeightsFor3dNew );
                const volumeStrNew = this._setLineToStr( volumeNew, 1 );
                const nameDataVolume = this.mapModel.layers.find( ( elem, index )=> index === i ).createDtStr;

                const dataVolume = { 
                    volume : volumeNew,
                    volumeStr : volumeStrNew,
                    dataVolume : nameDataVolume,
                    arrHeightsFor3d : arrHeightsFor3dNew
                };

                arrAllVolume = [ ...arrAllVolume, dataVolume ];
            }
        }

        return arrAllVolume;
    }

    //Тянем данные по всем старым слоям (Полигоны)
    async _getHeightsAllLayersLine( inArrPoint, inIsMoreOneLayer ) { 

        let arrAllHeight = [];
        const checkLayersArr = this._getAllSelectedLayers( inIsMoreOneLayer, false );

        for ( let i = 0; i < checkLayersArr.length; i++ ) {
            if( checkLayersArr[i] ) {
                const arrHeight = await this._getHeights( inArrPoint, i, 'line', inArrPoint.length );
                if( arrHeight ) {
                    const nameHeight = this.mapModel.layers.find( ( elem, index )=> index === i ).createDtStr;
                    const dataHeight = { 
                        array : arrHeight, 
                        name : nameHeight 
                    };
                    arrAllHeight = [ ...arrAllHeight, dataHeight ];
                }
            }
        }
        return arrAllHeight;
    }

    _getMathDataFromArr( inArr ){

        if( !inArr || inArr.length < 2 )
            return;
        
        let minInArr = Math.min( ...inArr );
        let maxInArr = Math.max( ...inArr );
        let averInArr = this._getAverageFromArr( inArr );

        let mathData = {
            min : minInArr.toFixed(2),
            max : maxInArr.toFixed(2),
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

    _getArrLinePoints( arrInpCoord, inAccurMeter, distanseLine, squarePolygon ) {

        inAccurMeter = inAccurMeter || 0.5;
        distanseLine *= 1000;

        const preciseCoeff = 3;
        const stepCount = (distanseLine / inAccurMeter) * preciseCoeff;
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

    async _getHeights( arrInpPoint, indexForRequest, type, pointsPerLine ) {

        const failIndex = ( indexForRequest === undefined || indexForRequest === null );
        if( failIndex  || !arrInpPoint || !type )
            return;

        let zeroMark = 0;
        let skyHeightsIdDb = this.mapModel.layers[indexForRequest].id;
        let skyHeightsName = this.mapModel.heightsMapNameConfigList[indexForRequest];

        //для каждого массива координат необходимо создать полигон, вмещающий в себя все эти точки.
        //Полигон должен быть как можно меньше, чтобы sql работал быстрее (если он будет слишком большой, то он охватит слишком много точек, по которым надо будет искать высоты для массива координат)
        //если это 1. объемный полигон - он разбивается на строки, в пределах которой у координат одинаковая широта (или долгота). Поиск по каждой строке производится отдельно.
        //если это 2. линия, то она в любом случае разбивается не более чем 250 точек за раз, т.к. линия может идти наискось, и у всех точек будут разные "широта/долгота" и поиск сразу по всем точкам нагрузит базу.
        let pointsPerRequest;
        let pointCountToSmooth; //коэфф. сглаживания

        if ( type === 'volume' ) {
            if (pointsPerLine != null) {
                pointsPerRequest = pointsPerLine; //поиск сразу по всей колонке или строке
            } else {
                pointsPerRequest = 250;
            }
        } else if (type === 'line') {
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

        for ( let k = 0; k < data2.length; k++ ) {

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
                    layer : skyHeightsName,
                    layerId : skyHeightsIdDb,
                    fields : 'Height',
                    pointsArray : subDataArr[s],
                    pointCountToSmooth : pointCountToSmooth,
                    LongtitudeMin : longMinNew,
                    LongtitudeMax : longMaxNew,
                    LatitudeMin : latMinNew,
                    LatitudeMax : latMaxNew
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
                outHeightsArr2 = [];
            });
        }
        return outHeightsArr2;
    }
    
    _setLineToStr( inWidth, typeIzm ) {

        if ( !inWidth )
            return '0';
    
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