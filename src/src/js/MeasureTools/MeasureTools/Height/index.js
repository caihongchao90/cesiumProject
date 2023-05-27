import { getDistanceH, positionHeight, cartesian3Point3 } from "../Base"
//高度测量类
export default class MeasureHeight {
    constructor(viewer) {
        this.viewer = viewer;
        this.initEvents();
        this.positions = [];
        this.vertexEntities = [];
        this.labelEntity = undefined;
        this.measureHeight = 0; //测量结果
    }

    //初始化事件
    initEvents() {
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.MeasureStartEvent = new Cesium.Event(); //开始事件
        this.MeasureEndEvent = new Cesium.Event(); //结束事件        
    }

    //激活
    activate() {
        this.deactivate();
        this.registerEvents(); //注册鼠标事件  
        //设置鼠标状态 
        this.viewer.enableCursorStyle = false;
        this.viewer._element.style.cursor = 'default';
        this.isMeasure = true;
        this.circleRadius = 0.1;
        this.measureHeight = 0;
        this.positions = [];
    }

    //禁用
    deactivate() {
        if (!this.isMeasure) return;
        this.unRegisterEvents();
        this.viewer._element.style.cursor = 'pointer';
        this.viewer.enableCursorStyle = true;
        this.isMeasure = false;
    }

    //清空绘制
    clear() {
        //清除线对象
        this.viewer.entities.remove(this.lineEntity);
        this.lineEntity = undefined;

        //清除文本
        this.viewer.entities.remove(this.labelEntity);
        this.labelEntity = undefined;

        //移除圆
        this.removeCircleEntity();

        //清除节点
        this.vertexEntities.forEach(item => {
            this.viewer.entities.remove(item);
        });
        this.vertexEntities = [];
    }

    //创建线对象
    createLineEntity() {
        this.lineEntity = this.viewer.entities.add({
            polyline: {
                positions: new Cesium.CallbackProperty(e => {
                    return this.positions;
                }, false),
                width: 2,
                material: Cesium.Color.YELLOW,
                depthFailMaterial: new Cesium.PolylineDashMaterialProperty({
                    color: Cesium.Color.RED,
                }),
            }
        })
    }

    //创建结果文本标签
    createLabel() {
        this.labelEntity = this.viewer.entities.add({
            position: new Cesium.CallbackProperty(e => {
                return this.positions[this.positions.length - 1]; //返回最后一个点
            }, false),
            label: {
                text: "",
                scale: 0.5,
                font: 'normal 40px MicroSoft YaHei',
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5000),
                scaleByDistance: new Cesium.NearFarScalar(500, 1, 1500, 0.4),
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                pixelOffset: new Cesium.Cartesian2(0, -30),
                outlineWidth: 9,
                outlineColor: Cesium.Color.WHITE
            }
        })
    }

    //创建线节点
    createVertex(index) {
        let vertexEntity = this.viewer.entities.add({
            position: new Cesium.CallbackProperty(e => {
                return this.positions[index];
            }, false),
            type: "MeasureHeightVertex",
            point: {
                color: Cesium.Color.FUCHSIA,
                pixelSize: 6,
                // disableDepthTestDistance: 2000,
            },
        });
        this.vertexEntities.push(vertexEntity);
    }

    //创建圆 这样方便看出水平面的高低
    createCircleEntitiy() {
        this.circleEntity = this.viewer.entities.add({
            position: new Cesium.CallbackProperty(e => {
                return this.positions[this.positions.length - 1]; //返回最后一个点
            }, false),
            ellipse: {
                height: new Cesium.CallbackProperty(e => {
                    return positionHeight(this.positions[this.positions.length - 1]);
                }, false),
                semiMinorAxis: new Cesium.CallbackProperty(e => {
                    return this.circleRadius;
                }, false),
                semiMajorAxis: new Cesium.CallbackProperty(e => {
                    return this.circleRadius;
                }, false),
                material: Cesium.Color.YELLOW.withAlpha(0.5),
            },
        });
    }

    //删除圆
    removeCircleEntity() {
        this.viewer.entities.remove(this.circleEntity);
        this.circleEntity = undefined;
    }

    //注册鼠标事件
    registerEvents() {
        this.leftClickEvent();
        this.rightClickEvent();
        this.mouseMoveEvent();
    }

    //左键点击事件
    leftClickEvent() {
        //单击鼠标左键画点点击事件
        this.handler.setInputAction(e => {
            this.viewer._element.style.cursor = 'default';
            let position = this.viewer.scene.pickPosition(e.position);
            if (!position) {
                const ellipsoid = this.viewer.scene.globe.ellipsoid;
                position = this.viewer.scene.camera.pickEllipsoid(e.position, ellipsoid);
            }
            if (!position) return;

            if (this.positions.length == 0) { //首次点击
                this.positions.push(position);
                this.createVertex(0);
                this.createLineEntity();
                this.createCircleEntitiy();
                this.createLabel();
            } else { //第二次点击结束测量
                this.measureEnd();
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    //鼠标移动事件
    mouseMoveEvent() {
        this.handler.setInputAction(e => {
            if (!this.isMeasure) return;
            this.viewer._element.style.cursor = 'default';
            let position = this.viewer.scene.pickPosition(e.endPosition);
            if (!position) {
                position = this.viewer.scene.camera.pickEllipsoid(e.startPosition, this.viewer.scene.globe.ellipsoid);
            }
            if (!position) return;
            this.handleMoveEvent(position);
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    //处理鼠标移动
    handleMoveEvent(position) {
        if (this.positions.length < 1) return;
        let firstPoint = cartesian3Point3(this.positions[0]); //第一个点
        let movePoint = cartesian3Point3(position); //鼠标移动点
        const h = movePoint[2] - firstPoint[2];
        firstPoint[2] = movePoint[2];
        const twoPosition = Cesium.Cartesian3.fromDegrees(firstPoint[0], firstPoint[1], movePoint[2]);
        if (this.positions.length < 2) {
            this.positions.push(twoPosition);
            this.createVertex(1);
        } else {
            this.positions[1] = twoPosition;
            this.measureHeight = h.toFixed(3);
            this.labelEntity.label.text = "高度：" + this.measureHeight + " 米"
        }
        //计算圆的半径   
        this.circleRadius = getDistanceH(this.positions[0], position);
    }

    //右键事件
    rightClickEvent() {
        this.handler.setInputAction(e => {
            if (this.isMeasure) {
                this.deactivate();
                this.clear();
            }
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }

    //测量结束
    measureEnd() {
        this.deactivate();
        this.MeasureEndEvent.raiseEvent(this.measureHeight); //触发结束事件 传入结果
    }

    //解除鼠标事件
    unRegisterEvents() {
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
}