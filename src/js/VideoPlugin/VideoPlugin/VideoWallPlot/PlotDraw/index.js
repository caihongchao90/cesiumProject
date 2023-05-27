import PlotFactory from '../PlotFactory';
import PlotDrawTip from "../../../PlotBase/PlotDrawTip"
import MousePoint from "../../../PlotBase/MousePoint"
import PlotTypes from "../PlotTypes"

import { getPlotCode } from "../../../PlotBase/PlotBaseUtils"
export default class PlotDraw {
    constructor(viewer) {
        this.viewer = viewer;
        this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        this.initEvents();
    }

    //激活
    activate(plotType) {
        this.deactivate();
        this.clear();
        this.plotType = plotType;
        this.positions = [];
        this.plotDrawTip = new PlotDrawTip(this.viewer);
        this.MousePoint = new MousePoint(this.viewer);
        this.registerEvents(); //注册鼠标事件 


        //设置鼠标状态 
        this.viewer.enableCursorStyle = false;
        this.viewer._element.style.cursor = 'default';
        this.initTip();
    }

    initTip() {
        switch (this.plotType) {
            case PlotTypes.WALL:
                this.plotDrawTip.setContent(["当前绘制类型：视频墙，需要2个点", "按下鼠标左键确定第1个点", "按下鼠标右键取消绘制"])
                break;
        }
    }

    //禁用
    deactivate() {
        this.unRegisterEvents();
        this.plotType = undefined;

        this.viewer._element.style.cursor = 'pointer';
        this.viewer.enableCursorStyle = true;

        if (!this.plotDrawTip) return;
        this.plotDrawTip.remove();
        this.MousePoint.remove();
        this.plotDrawTip = undefined;
        this.MousePoint = undefined;
    }

    //清空绘制
    clear() {
        if (this.plot) {
            this.plot.remove();
            this.plot = undefined;
        }
    }

    //添加第一个点后 构造一个标绘实体 
    generatePlot(positions) {
        const plotCode = getPlotCode();
        //根据标绘数据格式构建
        let geoFeature = this.generateGeoFeature(plotCode, positions);
        this.plot = PlotFactory.createPlot(this.viewer, this.plotType, geoFeature);
        this.plot.openEditMode(true);
    }

    generateGeoFeature(plotCode, positions) {
        //根据标绘数据格式构建
        let geometryType, coordinates;
        switch (this.plotType) {
            case PlotTypes.WALL:
                geometryType = "LineString";
                coordinates = this.getLineStringCoordinates(positions);
                break;
            case PlotTypes.POLYGON:
                geometryType = "Polygon";
                coordinates = this.getPolygonCoordinates(positions);
                break;
        }

        return {
            "type": "Feature",
            "properties": {
                "plotCode": plotCode,
                "style": undefined,
            },
            "geometry": {
                "type": geometryType,
                "coordinates": coordinates
            }
        }
    }



    //线的坐标
    getLineStringCoordinates(positions) {
        let coordinates = [];
        positions.forEach(item => {
            const c = Cesium.Cartographic.fromCartesian(item);
            const coordinate = [Cesium.Math.toDegrees(c.longitude), Cesium.Math.toDegrees(c.latitude), c.height];
            coordinates.push(coordinate);
        });
        return coordinates;
    }

    //面的坐标
    getPolygonCoordinates(positions) {
        let coordinates = [
            []
        ];
        positions.forEach(item => {
            const c = Cesium.Cartographic.fromCartesian(item);
            const coordinate = [Cesium.Math.toDegrees(c.longitude), Cesium.Math.toDegrees(c.latitude), c.height];
            coordinates[0].push(coordinate);
        });
        return coordinates;
    }


    initEvents() {
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.PlotDrawStartEvent = new Cesium.Event(); //开始绘制事件
        this.PlotDrawEndEvent = new Cesium.Event(); //结束绘制事件        
    }

    //注册鼠标事件
    registerEvents() {
        this.leftClickEvent();
        this.rightClickEvent();
        this.mouseMoveEvent();
    }

    leftClickEvent() {
        //单击鼠标左键画点
        this.handler.setInputAction(e => {
            this.viewer._element.style.cursor = 'default'; //由于鼠标移动时 Cesium会默认将鼠标样式修改为手柄 所以移动时手动设置回来

            let position = this.viewer.scene.pickPosition(e.position);
            if (!position) return;
            this.positions.push(position);

            if (this.positions.length == 1) { //绘制一个点后 才创建标绘对象 解决点类型标绘必须初始化时设置点
                this.generatePlot(this.positions);
            } else {
                this.plot.setPositions(this.positions);
            }

            this.setTipContent();

            if (this.plot.fixPositionCount == this.positions.length) {
                this.drawEnd();
                this.deactivate();
            }

        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    setTipContent() {
        switch (this.plotType) {
            case PlotTypes.WALL:
                this.plotDrawTip.setContent([
                    "当前绘制类型：视频墙，需要2个点。",
                    "已有" + this.positions.length + "个点，" + "按下鼠标左键确定第" + (this.positions.length + 1) + "个点",
                    this.positions.length < 2 ? "按下鼠标右键取消绘制" : "按下鼠标右键结束绘制"
                ])
                break;
        }
    }

    mouseMoveEvent() {
        this.handler.setInputAction(e => {
            this.viewer._element.style.cursor = 'default'; //由于鼠标移动时 Cesium会默认将鼠标样式修改为手柄 所以移动时手动设置回来
            let position = this.viewer.scene.pickPosition(e.endPosition);
            if (!position) return;
            this.plotDrawTip.updatePosition(position);
            this.MousePoint.updatePosition(position);
            if (!this.plot) return;
            const ps = this.positions.concat([position]);
            this.plot.setPositions(ps);
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    rightClickEvent() {
        //右键的时候 两种情况 一是取消操作（一个点都没有的情况下 是取消当前工具） 
        //有点的时候（没有限制点数）是结束绘制    
        this.handler.setInputAction(e => {
            if (this.positions.length == 0) { //右键结束时 如果一个点都么有 即取消操作
                this.deactivate();
                return;
            }

            if (!this.plot.fixPositionCount) { //如果有点 并且没有限制点数 判断是否满足最少点数 结束绘制
                if (this.positions.length >= this.plot.minPositionCount) {
                    this.plot.setPositions(this.positions);
                    this.drawEnd();
                    this.deactivate();
                } else { //当前点数不满足最少点数
                    this.deactivate();
                    this.clear();
                }
            } else { //如果有限定点 判断当前点是否满足限定点
                if (this.positions.length == this.plot.fixPositionCount) {
                    this.plot.setPositions(this.positions);
                    this.drawEnd();
                    this.deactivate();
                } else {
                    this.deactivate();
                    this.clear();
                }
            }
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }

    //解除鼠标事件
    unRegisterEvents() {
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    }

    //绘制结束 触发结束事件
    drawEnd() {
        //设置鼠标状态       
        this.plot.openEditMode(false);
        this.PlotDrawEndEvent.raiseEvent(this.plot, this.plotType);
    }
}