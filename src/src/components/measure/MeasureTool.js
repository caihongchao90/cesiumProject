/**
 * @Description: 测量工具类
 * @author xiaocai
 * @date 2023/05/26 
 */
import {helpers, area, random, bbox, tin} from '@turf/turf'
import booleanPointInPolygon from "@turf/boolean-point-in-polygon"

export default class MeasureTool {
    /**
     *
     * @param viewer
     */
    constructor(viewer) {
        this.viewer = viewer;
        this._distance_handler = null;
        //测线的变量
        this._lineParams = {
            lineDataSource: null,
            vertexCollection: [],//存储的折线顶点信息
            mousePos: null,
            lastLine: null,
            totalLength: 0,
        };
        this._area_handler = null;
        //测面的变量
        this._areaParams = {//测面的变量
            areaDataSource: null,
            vertexCollection: [],
            lastArea: null,
            mousePos: null,
        };
    }

    /**
     * 测距
     * @param type 0-空间 1 表面
     */
    distance(type) {
        //默认测空间
        type = type === undefined ? 0 : type;
        this._reset();
        this._lineParams.lineDataSource = new Cesium.CustomDataSource('lineDataSource');
        this.viewer.dataSources.add(this._lineParams.lineDataSource);
        this.viewer.scene.globe.depthTestAgainstTerrain = true;//开启深度测试
        this._distance_handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        //绑定鼠标左击事件
        //尝试过把下面的方法拿出来，但是总是找不到this对象。。。有缘人试试吧
        this._distance_handler.setInputAction((e) => {
            let pos = this.viewer.scene.pickPosition(e.position);//笛卡尔坐标
            if (pos) {
                this._lineParams.vertexCollection.push(pos);
            }
            //添加线
            let currentLine = this._lineParams.lineDataSource.entities.add({
                polyline: {
                    positions: new Cesium.CallbackProperty(() => {
                        let c = Array.from(this._lineParams.vertexCollection);
                        if (this._lineParams.mousePos) {
                            c.push(this._lineParams.mousePos);
                        }
                        return c
                    }, false),
                    clampToGround: true,//折线固定在地面
                    width: 3,
                    material: new Cesium.PolylineOutlineMaterialProperty({
                        color: new Cesium.Color(255 / 255, 118 / 255, 0 / 255, 1.0),
                        outlineColor: new Cesium.Color(255 / 255, 180 / 255, 115 / 255, 1.0),
                        outlineWidth: 2
                    })
                }
            })
            if (type == 0) {
                if (this._lineParams.vertexCollection.length >= 2) {
                    this._lineParams.totalLength += this._surfaceDistance(this._lineParams.vertexCollection[this._lineParams.vertexCollection.length - 2], pos);
                    this._lineParams.totalLength = parseFloat((this._lineParams.totalLength).toFixed(2));
                }
                this._addDistancePoint(pos, this._lineParams.totalLength)
            } else {
                if (this._lineParams.vertexCollection.length == 1) {
                    this._addDistancePoint(pos, this._lineParams.totalLength);
                } else {
                    let left = this._lineParams.vertexCollection[this._lineParams.vertexCollection.length - 2];
                    let right = pos;
                    //求两个顶点的直线距离，用于判断插值精度
                    let t = Cesium.Cartesian3.distance(left, right);
                    let vertexLength = this._terrianDistance(this._lineParams.vertexCollection[this._lineParams.vertexCollection.length - 2], pos, t);
                    this._lineParams.totalLength += vertexLength;
                    this._lineParams.totalLength = parseFloat((this._lineParams.totalLength).toFixed(2));
                    this._addDistancePoint(pos, this._lineParams.totalLength);
                }
            }
            if (this._lineParams.lastLine) {
                this._lineParams.lineDataSource.entities.remove(this._lineParams.lastLine)
            }
            this._lineParams.lastLine = currentLine;
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

        //鼠标移动事件
        this._distance_handler.setInputAction((e) => {
            let endPosition = e.endPosition;
            let endPos = this.viewer.scene.pickPosition(endPosition);
            if (endPos) {//鼠标移出地球,undifined
                this._lineParams.mousePos = endPos;
                //entity polyline 中使用了Cesium CallbackProperty 免去移动再画线
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

        //鼠标右键事件，右键取消不在添加点计算面积
        this._distance_handler.setInputAction((e) => {
            let endPostion = e.position;
            let endPos = this.viewer.scene.pickPosition(endPostion);
            if (endPos) {
                this.cancel();
                // vertexCollection.push(endPos);
                // if(type==0){
                //     totalLength+=this._surfaceDistance(vertexCollection[vertexCollection.length-2],endPos);
                //     this._addDistancePoint(endPos,totalLength);
                // }else{
                //     let left = vertexCollection[vertexCollection.length-2];
                //     let right = endPos;
                //     //求两个顶点的直线距离，用于判断插值精度
                //     let t = Cesium.Cartesian3.distance(left,right);
                //     let vertexLength = this._terrianDistance(vertexCollection[vertexCollection.length-2],endPos,t);
                //     totalLength+=vertexLength;
                //     this._addDistancePoint(endPos,totalLength);
                // }
                this._lineParams.lineDataSource.entities.add({
                    polyline: {
                        clampToGround: true,
                        positions: this._lineParams.vertexCollection,
                        width: 3,
                        material: new Cesium.PolylineOutlineMaterialProperty({
                            color: new Cesium.Color(255 / 255, 118 / 255, 0 / 255, 1.0),
                            outlineColor: new Cesium.Color(255 / 255, 180 / 255, 115 / 255, 1.0),
                            outlineWidth: 2
                        })
                    }
                })
                if (this._lineParams.lastLine) {
                    this._lineParams.lineDataSource.entities.remove(this._lineParams.lastLine);
                }
                this._lineParams.vertexCollection = [];
                this._lineParams.mousePos = null;
            }
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    }

    /**
     * 空间距离计算
     * @param start
     * @param end
     * @returns {number}
     * @private
     */
    _surfaceDistance(start, end) {//测地线（椭球上距离）
        let geodesic = new Cesium.EllipsoidGeodesic();
        let startGeodesic = Cesium.Cartographic.fromCartesian(start)//笛卡尔系转经纬度
        let endGeodesic = Cesium.Cartographic.fromCartesian(end)
        geodesic.setEndPoints(startGeodesic, endGeodesic)
        let lengthInMeters = (geodesic.surfaceDistance) / 1000;
        return parseFloat(lengthInMeters)
    }

    /**
     * 表面距离
     * @param start
     * @param end
     * @param t
     * @private
     */
    _terrianDistance(start, end, t) {
        let level = Math.ceil(Math.log10(t));
        let count = level * 5;
        let lerp = [];
        let vertexLength = 0;
        //两个端点加上count个插值点
        for (let i = 0; i <= count + 1; i++) {
            let pt = Cesium.Cartesian3.lerp(start, end, i / (count + 1), new Cesium.Cartesian3())//插值点
            let samplePt = this.viewer.scene.clampToHeight(pt)//高度采样点
            lerp.push(samplePt)
        }
        //计算折线长度
        for (let j = 1; j < lerp.length; j++) {
            let left = lerp[j - 1]
            let right = lerp[j]
            let length = Cesium.Cartesian3.distance(left, right)
            vertexLength += length
        }
        vertexLength = vertexLength / 1000;
        return vertexLength;
    }

    /**
     * 添加顶点长度信息等
     * @param pos
     * @param totalLength
     * @private
     */
    _addDistancePoint(pos, totalLength) {
        this._lineParams.lineDataSource.entities.add({
            position: pos,
            point: {
                color: new Cesium.Color(93 / 255, 200 / 255, 205 / 255, 1.0),
                pixelSize: 10,
                heightReference: Cesium.CLAMP_TO_GROUND,
                disableDepthTestDistance: 15000000
            },
            label: {
                text: totalLength + "千米",
                fillColor: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,
                pixelOffset: new Cesium.Cartesian2(10, -10),
                font: 'normal 16px',
                disableDepthTestDistance: 15000000
            }
        })
    }

    /**
     * 测面
     * @param type 0-空间 1 表面
     */
    area(type) {
        this._reset();
        //默认测空间
        type = type === undefined ? 0 : type;
        this._areaParams.areaDataSource = new Cesium.CustomDataSource('areaDataSource');
        this.viewer.dataSources.add(this._areaParams.areaDataSource);
        this.viewer.scene.globe.depthTestAgainstTerrain = true;
        this._area_handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        //鼠标左键点击事件
        this._area_handler.setInputAction((e) => {
            let pos = this.viewer.scene.pickPosition(e.position)
            let current;
            if (pos) {
                this._areaParams.vertexCollection.push(pos)
            }
            if (this._areaParams.vertexCollection.length == 1) {//一个顶点加上移动点
                current = this._areaParams.areaDataSource.entities.add({
                    polyline: {
                        clampToGround: true,
                        positions: new Cesium.CallbackProperty(() => {
                            let c = Array.from(this._areaParams.vertexCollection)
                            if (this._areaParams.mousePos) {
                                c.push(this._areaParams.mousePos)
                            }
                            return c
                        }, false),
                        width: 3,
                        material: new Cesium.PolylineOutlineMaterialProperty({
                            color: new Cesium.Color(255 / 255, 118 / 255, 0 / 255, 1.0),
                            outlineColor: new Cesium.Color(255 / 255, 180 / 255, 115 / 255, 1.0),
                            outlineWidth: 2
                        })
                    }
                })
            } else {//2个顶点加上移动点
                current = this._areaParams.areaDataSource.entities.add({
                    polygon: {
                        hierarchy: new Cesium.CallbackProperty(() => {
                            let positions = Array.from(this._areaParams.vertexCollection)
                            positions.push(this._areaParams.mousePos)
                            return new Cesium.PolygonHierarchy(positions)
                        }, false),
                        material: new Cesium.Color(255 / 255, 208 / 255, 115 / 255, 0.5),
                        extrudedHeightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                        outline: true,
                        outlineColor: new Cesium.Color(255 / 255, 180 / 255, 115 / 255, 1.0),
                        outlineWidth: 1
                    },
                    polyline: {
                        clampToGround: true,
                        positions: new Cesium.CallbackProperty(() => {
                            let c = Array.from(this._areaParams.vertexCollection)
                            if (this._areaParams.mousePos) {
                                c.push(this._areaParams.mousePos)
                            }
                            c.push(this._areaParams.vertexCollection[0])
                            return c
                        }, false),
                        width: 3,
                        material: new Cesium.PolylineOutlineMaterialProperty({
                            color: new Cesium.Color(255 / 255, 118 / 255, 0 / 255, 1.0),
                            outlineColor: new Cesium.Color(255 / 255, 180 / 255, 115 / 255, 1.0),
                            outlineWidth: 2
                        })
                    }
                })
            }
            if (this._areaParams.lastArea) {
                this._areaParams.areaDataSource.entities.remove(this._areaParams.lastArea)
            }
            this._areaParams.lastArea = current
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
        //鼠标移动事件
        this._area_handler.setInputAction((e) => {
            let endPosition = e.endPosition
            let endPos = this.viewer.scene.pickPosition(endPosition)
            if (endPos) {//鼠标移出地球,undifined
                this._areaParams.mousePos = endPos
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
        //鼠标右键事件
        this._area_handler.setInputAction((e) => {
            let endPosition = e.position;
            let endPos = this.viewer.scene.pickPosition(endPosition);
            if (endPos) {
                this.cancel();
                this._areaParams.vertexCollection.push(endPos);
                let area = this._surfaceArea(this._areaParams.vertexCollection);
                if (type == 0) {
                    this._addAreaPoint(endPos, area)
                } else {
                    this._terrianArea(this._areaParams.vertexCollection, area)
                }
            }
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    }

    /**
     * 椭球体空间面积
     * @param vertexCollection
     * @private
     */
    _surfaceArea(vertexCollection) {
        let rings = [];
        vertexCollection.map((vertex) => {
            //笛卡尔转弧度
            let carto_pt = Cesium.Cartographic.fromCartesian(vertex);
            //弧度转经纬度
            rings.push([Cesium.Math.toDegrees(carto_pt.longitude), Cesium.Math.toDegrees(carto_pt.latitude)]);
        })
        rings.push(rings[0]);
        //转成feature Polygon
        let polygon_json = helpers.polygon([rings]);
        //计算面积
        let surface = area(polygon_json);
        surface = parseFloat((surface / 1000000).toFixed(3))
        return surface;
    }

    /**
     * 添加面积标注
     * @param pos
     * @param area
     * @private
     */
    _addAreaPoint(pos, area) {
        this._areaParams.areaDataSource.entities.add({
            //顶点，以及长度信息
            position: pos,
            point: {
                color: new Cesium.Color(93 / 255, 200 / 255, 205 / 255, 1.0),
                pixelSize: 10,
                // heightReference:Cesium.HeightReference.RELATIVE_TO_GROUND
                heightReference: Cesium.CLAMP_TO_GROUND,
                disableDepthTestDistance: 15000000
            },
            label: {
                text: area + "平方千米",
                fillColor: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,
                pixelOffset: new Cesium.Cartesian2(10, -10),
                font: 'normal 16px',
                disableDepthTestDistance: 15000000
            }
        })
    }

    /**
     * 表面面积计算
     * @param vertexCollection
     * @param surface_area
     * @private
     */
    _terrianArea(vertexCollection, surface_area) {
        let rings = [];
        let totalArea = 0;
        let level = Math.ceil(Math.log10(surface_area));
        let count = 0;
        if (level < 1) {
            count = 10;
        } else {
            count = 10 * level;
        }
        let random_pt = {
            features: []
        }
        vertexCollection.map((vertex) => {
            //转弧度
            let carto_pt = Cesium.Cartographic.fromCartesian(vertex);
            //转经纬度
            rings.push([Cesium.Math.toDegrees(carto_pt.longitude), Cesium.Math.toDegrees(carto_pt.latitude)]);
        })
        rings.push(rings[0]);
        let polygon_json = helpers.polygon([rings]);
        //获取多边形外边界内的随机点
        let bbox_random_pt = random.randomPoint(count, {bbox: bbox(polygon_json)});
        bbox_random_pt.features.map((pt) => {
            //获取多边形内的随机点
            let coordinates = pt.geometry.coordinates;
            let turf_pt = helpers.point([coordinates[0], coordinates[1]]);
            if (booleanPointInPolygon(turf_pt, polygon_json)) {
                random_pt.features.push(pt)
            }
        })
        let random_tin = tin(random_pt);//生成三角网
        //进行高度采样，计算三角形面积
        random_tin.features.map((tin) => {
            let [point_1, point_2, point_3] = [tin.geometry.coordinates[0][0], tin.geometry.coordinates[0][1], tin.geometry.coordinates[0][2]];
            let sample_pt1 = this._sampleHeightFromCoordinate(point_1);
            let sample_pt2 = this._sampleHeightFromCoordinate(point_2);
            let sample_pt3 = this._sampleHeightFromCoordinate(point_3);
            let distance_1 = Cesium.Cartesian3.distance(sample_pt1, sample_pt2);
            let distance_2 = Cesium.Cartesian3.distance(sample_pt2, sample_pt3);
            let distance_3 = Cesium.Cartesian3.distance(sample_pt1, sample_pt3);
            let p = (distance_1 + distance_2 + distance_3) / 2;
            let tin_area = Math.sqrt(p * (p - distance_1) * (p - distance_2) * (p - distance_3));
            this._areaParams.areaDataSource.entities.add({
                polyline: {
                    clampToGround: true,
                    positions: [sample_pt1, sample_pt2, sample_pt3],
                    width: 3,
                    material: new Cesium.PolylineOutlineMaterialProperty({
                        color: new Cesium.Color(255 / 255, 118 / 255, 0 / 255, 1.0),
                        outlineColor: new Cesium.Color(255 / 255, 180 / 255, 115 / 255, 1.0),
                        outlineWidth: 2
                    })
                }
            })
            totalArea += tin_area;
        })
        totalArea = parseFloat((totalArea/1000000).toFixed(3))
        this._addAreaPoint(this.viewer.scene.clampToHeight(this._areaParams.vertexCollection[0]), totalArea);
    }

    /**
     * 三角形高度
     * @param coordinate
     * @returns {Cartesian3}
     * @private
     */
    _sampleHeightFromCoordinate(coordinate) {
        let c3_pt = Cesium.Cartesian3.fromDegrees(coordinate[0], coordinate[1]);
        let sample_pt = this.viewer.scene.clampToHeight(c3_pt);
        return sample_pt;
    }

    /**
     * 移除所有事件
     */
    cancel() {
        this._distance_handler && (
            this._distance_handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN),
                this._distance_handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE),
                this._distance_handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_DOWN),
        this._distance_handler.destroy(),
                this._distance_handler=null
    );
        this._area_handler && (
            this._area_handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN),
                this._area_handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE),
                this._area_handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_DOWN),
                this._area_handler.destroy(),
                this._area_handler=null
        );
    }

    /**
     * 重置
     * @private
     */
    _reset() {
        if (this._lineParams.lineDataSource != null) {
            this._lineParams.lineDataSource.entities.removeAll();
            this.viewer.dataSources.remove(this._lineParams.lineDataSource);
        }
        if (this._areaParams.areaDataSource != null) {
            this._areaParams.areaDataSource.entities.removeAll();
            this.viewer.dataSources.remove(this._areaParams.areaDataSource);
        }
        this._lineParams = {//测线的变量
            lineDataSource: null,
            vertexCollection: [],//存储的折线顶点信息
            mousePos: null,
            lastLine: null,
            totalLength: 0,
        }
        this._areaParams = {//测面的变量
            areaDataSource: null,
            vertexCollection: [],
            lastArea: null,
            mousePos: null,
        };
    }

    /**
     * 清除
     */
    clearAll(){
        this.cancel();
        this._reset()
    }
}
