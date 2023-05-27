//作者：蔡宏超
//最后修改日期：2023.03.14
//功能：加载json数据，并添加自定义的弹窗

import MultiFieldAdaptWindow from "./MultiFieldAdaptWindow/index.js";

export default class DynamicMonomerSingle{
  constructor(viewer) {
    this._viewer = viewer
    this._handle = undefined
  }
  loadJson(jsonData){
    var features = jsonData;
    for (let i=0;i < features.length;i++){
      let box = this._viewer.scene.primitives.add(
        new Cesium.ClassificationPrimitive({
          geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.PolygonGeometry({
              polygonHierarchy: new Cesium.PolygonHierarchy(
                Cesium.Cartesian3.fromDegreesArray(features[i].vertexs)
              ),
              height: features[i].low ? features[i].low : 0, //下顶点
              extrudedHeight: features[i].ceiling ? features[i].ceiling : 100, // 上顶点
              vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
            }),
            //顶点着色器
            attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                new Cesium.Color(0, 0, 0, 0.1)
              ),
              show: new Cesium.ShowGeometryInstanceAttribute(true), //显示几何实例
            },
            id: new Date().getTime() + Math.random().toString(36).substr(2),
          }),
          classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, //是否影响地形
        })
      )
      //json数据必须有的两个属性
      box.myProperties = features[i].properties //把属性添加到盒子上
      box.title = features[i].title
    }
    this.initEvent()
  }

  initEvent(){
    let currentObject = undefined;
    let selectObject = undefined;
    let lastTimeObject =undefined;
    let fields = []
    let value = []
    let myWindow = undefined

    this._handle = new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas);
    let viewer = this._viewer
    let that = this
    this._handle.setInputAction(function (movement) {
      const pickedObject = viewer.scene.pick(movement.endPosition);
      if (
        Cesium.defined(pickedObject) &&
        Cesium.defined(pickedObject.id) &&
        Cesium.defined(pickedObject.primitive.getGeometryInstanceAttributes)
      ) {
        currentObject = pickedObject;
        if (
          Cesium.defined(selectObject)&&
          (currentObject.id === selectObject.id)
        ) {
          return;
        }
        currentObject.primitive.getGeometryInstanceAttributes(currentObject.id).color = [255, 0, 0, 128];
      }
      else {
        if(Cesium.defined(currentObject)) {
          if (currentObject.primitive.getGeometryInstanceAttributes(currentObject.id).color[0] === 255) {
            currentObject.primitive.getGeometryInstanceAttributes(currentObject.id).color = [0, 0, 0, 0];
            currentObject = undefined;
          }
        }
      }
      that._handle.setInputAction(event=>{
        if (selectObject) {
          lastTimeObject = selectObject
        }
        selectObject = viewer.scene.pick(event.position);
        const position = viewer.scene.pickPosition(event.position)
        if (
          Cesium.defined(selectObject)&&
          Cesium.defined(selectObject.primitive.getGeometryInstanceAttributes)
        ){
          let properties = Object.entries(selectObject.primitive.myProperties)
          fields = []
          value = []
          for (let i=0;i<properties.length;i++){
            fields.push(properties[i][0])
            value.push(properties[i][1])
          }
          selectObject.primitive.getGeometryInstanceAttributes(selectObject.id).color = [0, 255, 0, 128];
          if (myWindow){
            myWindow.close()
            myWindow = undefined

          }
          myWindow = new MultiFieldAdaptWindow(viewer,position,selectObject.primitive.title,fields,value)
          if (
            Cesium.defined(lastTimeObject)&&
            Cesium.defined(lastTimeObject.primitive.getGeometryInstanceAttributes)
          ){
            lastTimeObject.primitive.getGeometryInstanceAttributes(lastTimeObject.id).color = [0, 0, 0, 0];
            selectObject.primitive.getGeometryInstanceAttributes(selectObject.id).color = [0,255,0,128];
          }
        }else {
          if (myWindow){
            myWindow.close()
            myWindow = undefined
          }
          if (
            Cesium.defined(lastTimeObject)&&
            Cesium.defined(lastTimeObject.primitive.getGeometryInstanceAttributes)
          ) {
            lastTimeObject.primitive.getGeometryInstanceAttributes(lastTimeObject.id).color = [0, 0, 0, 0]
            lastTimeObject = undefined
            selectObject = undefined
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
  }

  destroy(){
    if (this._handle){
      this._handle.destroy()
    }
    this._handle = undefined
    this._viewer = undefined
  }
}