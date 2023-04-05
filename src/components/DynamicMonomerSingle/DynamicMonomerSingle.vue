<!--作者：蔡宏超-->
<!--时间：2023.03.07-->
<!--功能：单体化采集和查询-->
<template>
    <div id="cesiumContainer"></div>
    <div class="get-personInfo">
        <div class="getInfo-button">
            <button @click="getVertex">采集角点</button>
            <button @click="getFloorHeight">采集最低点</button>
            <button @click="getCeilHeight">采集最高点</button>
            <button @click="clearAllEntity">重新采集</button>
        </div>
        <div class="input-frame">
            <p>户主：</p>
            <input type="text" v-model="name">
            <p>地址：</p>
            <input type="text" v-model="address">
            <button @click="addInfo" style="margin-left: 5px;width: 50px ">添加</button>
            <button @click="savePersonInfo" style="margin-left: 10px;width: 50px ">导出</button>
            <button @click="load" style="margin-left: 10px;width: 50px ">导入</button>
            <button @click="load2" style="margin-left: 10px;width: 50px ">导入2</button>
        </div>
        <div class="table-div">
            <table border="1" cellspacing="0px" class="info-table">
            <tr>
                <td>户主</td>
                <td style="max-width: 200px">角点</td>
                <td>地板高</td>
                <td>天花板高</td>
                <td style="max-width: 50px;overflow: hidden">地址</td>
            </tr>
            <tr v-for="item in list">
                <td>{{item.name}}</td>
                <td>{{item.vertexs}}</td>
                <td>{{item.floor}}</td>
                <td>{{item.ceiling}}</td>
                <td>{{item.address}}</td>
            </tr>
        </table>
        </div>
    </div>
</template>

<script>

import MultiFieldAdaptWindow from "./MultiFieldAdaptWindow/index.js"
import DynamicMonomerSingle from "./DynamicMonomerSingle/index.js";
import DynamicWallMaterialProperty from './dynamicWallMaterialProperty.js'
let viewer
let vertexsEntities = [],floorEntity,ceilEntity
let id = 0
let handler,myWindow

export default {
name: "DynamicMonomerSingle",
data (){
  return{
    name:"",
    vertexs:[],
    floor:0,
    ceiling:0,
    address:"",
    list:[
      {name: "胡英俊",vertexs:[123.125653,124.126534,1234.456556,5647.235628945,123.125653,124.126534,1234.456556,5647.235628945,123.125653,124.126534,1234.456556,5647.235628945,123.125653,124.126534,1234.456556,5647.235628945],floor:0,ceiling: 10,address: "翻斗大街翻斗花园二号楼1001室"},
      {name: "张美丽",vertexs:[123.123,124.1234,1234.456,5647.2345],floor:19,ceiling: 23,address: "翻斗大街翻斗花园七号楼6001室"},
    ],
  }
},
mounted() {
  viewer = new Cesium.Viewer("cesiumContainer", {
    shouldAnimate: false,
    animation: false, // 是否创建动画小器件，左下角仪表
    baseLayerPicker: false, // 是否显示图层选择器
    fullscreenButton: false, // 是否显示全屏按钮
    geocoder: false, // 是否显示geocoder小器件，右上角查询按钮
    homeButton: false, // 是否显示Home按钮
    infoBox: false, // 是否显示信息框
    sceneModePicker: false, // 是否显示3D/2D选择器
    selectionIndicator: false, // 是否显示选取指示器组件
    timeline: false, // 是否显示时间轴
    navigationHelpButton: false, // 是否显示右上角的帮助按钮
  });
  viewer._cesiumWidget._creditContainer.style.display = "none"; //去掉版权信息吧
  let tiles = viewer.scene.primitives.add(
    new Cesium.Cesium3DTileset({
      url: 'http://60.188.135.247:3000/cacheServer/http/172.22.155.194/3000/trainStation/newTrainStation/tileset.json',
      //控制切片视角显示的数量，可调整性能/src/assets/yaogansuo_3dtiles/tileset.json
    })
  )
  let pointData = [
    120.91426004602172,30.85191152311719,
    120.91485971473507,30.852108104265113,
    120.91478769439237,30.85239592595098,
    120.91410471919966,30.85219627428252,
    120.91426004602172,30.85191152311719
  ]
  let pointHeightData = [
    120.91426004602172,30.85191152311719,25,
    120.91485971473507,30.852108104265113,25,
    120.91478769439237,30.85239592595098,25,
    120.91410471919966,30.85219627428252,25,
    120.91426004602172,30.85191152311719,25,
  ]
  viewer.zoomTo(tiles);
  viewer.entities.add({
    name : 'polyline',
    wall : {
      positions : Cesium.Cartesian3.fromDegreesArray(pointData),
      maximumHeights: new Array(parseInt((pointData.length)/2)).fill(25),
      minimunHeights: new Array(parseInt((pointData.length)/2)).fill(24),
      material: //new Cesium.Color(1.0, 0.0, 0.0, 0.5),
        new Cesium.DynamicWallMaterialProperty({
          color: new Cesium.Color(1.0, 0.0, 0.0, 0.5),
          duration: 20000,
        }),
    },
    polyline : {
      positions : Cesium.Cartesian3.fromDegreesArrayHeights(pointHeightData),
      material: Cesium.Color.RED,
    }
  });
  const buildingHighlight = viewer.scene.primitives.add(
    new Cesium.ClassificationPrimitive({
    geometryInstances: new Cesium.GeometryInstance({
      geometry: new Cesium.PolygonGeometry({
        polygonHierarchy: new Cesium.PolygonHierarchy(
          Cesium.Cartesian3.fromDegreesArray([
            108.95929404260956,34.21966794989407,
            108.95955838438348,34.219668972015256,
            108.95956748285903,34.21992623900774,
            108.95928988115193,34.219923971988486
          ])
        ),
        height: 431, //下顶点
        extrudedHeight: 480, // 上顶点
        vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
      }),
      //顶点着色器
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
          new Cesium.Color(1, 0, 0, 0.5)
        ),
        show: new Cesium.ShowGeometryInstanceAttribute(true), //显示几何实例
      },
      id: "volue",
    }),
    classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, //是否影响地形
  })
  )

},
methods: {
  pickPosion(){
    var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function (event) {
      let position  = viewer.scene.pickPosition(event.position);
      if (!position) return;
      let cartographic = Cesium.Cartographic.fromCartesian(position);
      let lng = Cesium.Math.toDegrees(cartographic.longitude); // 经度
      let lat = Cesium.Math.toDegrees(cartographic.latitude); // 纬度
      let height = cartographic.height
      console.log("经度"+lng+"纬度"+lat,"高度"+height)
      viewer.entities.add({
        position: position,
        point: {
          pixelSize: 5,
          color: Cesium.Color.fromCssColorString('#ee0000'),
          outlineColor: Cesium.Color.fromCssColorString('#fff'),
          outlineWidth: 2,
          show: true
        }
      });
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  },
  getVertex(){
    let that = this
    if (vertexsEntities){
      for (let i=0;i<vertexsEntities.length;i++){
        viewer.entities.remove(vertexsEntities[i])
      }
    }
    that.vertexs = []
    that.clear()
    handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function (event) {
      let posion = that.getAddInfo(viewer,event,Cesium.Color.fromCssColorString('#86ea0f'))
      that.vertexs.push(posion.lng,posion.lat)
      vertexsEntities.push(posion.entity)
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  },
  getFloorHeight(){
    if (floorEntity) {
      viewer.entities.remove(floorEntity)
    }
    let that = this
    that.clear()
    handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function (event) {
      let posion = that.getAddInfo(viewer,event,Cesium.Color.fromCssColorString('#ee0000'))
      that.floor = posion.height.toFixed(3)
      floorEntity = posion.entity
      handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  },
  getCeilHeight(){
    if (ceilEntity) {
      viewer.entities.remove(ceilEntity)
    }
    let that = this
    that.clear()
    handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function (event) {
      let posion = that.getAddInfo(viewer,event,Cesium.Color.fromCssColorString('#0073ff'))
      that.ceiling = posion.height.toFixed(3)
      ceilEntity = posion.entity
      handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  },
  getAddInfo(viewer,event,color){

    let position  = viewer.scene.pickPosition(event.position);
    if (!position) return;
    let cartographic = Cesium.Cartographic.fromCartesian(position);
    let lng = Cesium.Math.toDegrees(cartographic.longitude); // 经度
    let lat = Cesium.Math.toDegrees(cartographic.latitude); // 纬度
    let height = cartographic.height
    let entity = viewer.entities.add({
      position: position,
      point: {
        pixelSize: 5,
        color: color, //Cesium.Color.fromCssColorString('#ee0000'),
        outlineColor: Cesium.Color.fromCssColorString('#fff'),
        outlineWidth: 2,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        show: true
      }
    });
    return {lng:lng,lat:lat,height:height,entity:entity}
  },
  addInfo(){
    this.clear()
    let personInfo = {
      id:id++,
      name:this.name,
      vertexs:this.vertexs,
      floor:this.floor,
      ceiling:this.ceiling,
      address:this.address
    }
    if (!this.name){
      console.log(this.name,this.vertexs,this.floor,this.ceiling)
      alert("请将必填信息填写完整")

      return;
    }
    this.list.push(personInfo)
  },
  //保存
  savePersonInfo() {
    var data = JSON.stringify(this.list);
    var blob = new Blob([data], { type: 'text/json' });
    var e = document.createEvent('MouseEvents');
    var a = document.createElement('a');
    a.download = new Date().getTime() + ".json";
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
    e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    a.dispatchEvent(e);
  },
  //加载
  load(){
    // // this.clear()
    // this.clearAllEntity()
    // let input = document.createElement('input');
    // input.value = '选择文件';
    // input.type = 'file';
    // input.accept=".json"
    // input.onchange = event => {
    //   let file = event.target.files[0];
    //   let file_reader = new FileReader();
    //   file_reader.onload = () => {
    //     let fc = file_reader.result;
    //     let data = JSON.parse(fc);
    //     console.log(typeof data); // 打印文件文本内容
    //     this.loadJson(data);
    //
    //     console.log("加载完成")
    //   };
    //   file_reader.readAsText(file, 'UTF-8');
    // };
    // input.click();

  },
  load2(){
    let input = document.createElement('input');
    input.value = '选择文件';
    input.type = 'file';
    input.accept=".json"
    input.onchange = event => {
      let file = event.target.files[0];
      let file_reader = new FileReader();
      file_reader.onload = () => {
        let fc = file_reader.result;
        let data = JSON.parse(fc);
        let dynamicMonomerSingle = new DynamicMonomerSingle(viewer)
        dynamicMonomerSingle.loadJson(data)
        // dynamicMonomerSingle.destroy()
      };
      file_reader.readAsText(file, 'UTF-8');
    };
    input.click();
    console.log("加载成功2")
    console.log("aaa",viewer)
    console.log("加载成功")
  },
  loadJson(jsonData){
    var features = jsonData;
    for (let i=0;i < features.length;i++){
      let box = viewer.scene.primitives.add(
        new Cesium.ClassificationPrimitive({
          geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.PolygonGeometry({
              polygonHierarchy: new Cesium.PolygonHierarchy(
                Cesium.Cartesian3.fromDegreesArray(features[i].vertexs)
              ),
              height: features[i].floor, //下顶点
              extrudedHeight: features[i].ceiling, // 上顶点
              vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
            }),
            //顶点着色器
            attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                new Cesium.Color(0, 0, 0, 0.1)
              ),
              show: new Cesium.ShowGeometryInstanceAttribute(true), //显示几何实例
            },
            id: features[i].id,
          }),
          classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, //是否影响地形
        })
      )
      box.name = features[i].name
      box.address = features[i].address
      console.log(box)
    }
  },
  clear(){
    if (handler){
      handler.destroy()
      handler = undefined
    }
  },
  clearAllEntity(){
    if (floorEntity) {
      viewer.entities.remove(floorEntity)
    }
    if (ceilEntity) {
      viewer.entities.remove(ceilEntity)
    }
    if (vertexsEntities){
      for (let i=0;i<vertexsEntities.length;i++){
        viewer.entities.remove(vertexsEntities[i])
      }
    }
    this.name = ""
    this.vertexs = []
    this.floor=0
    this.ceiling=0
    this.address=""
  },
},
}
</script>

<style lang="less" scoped>
.get-personInfo{
    /*display:none;*/
    position: absolute;
    overflow: auto;
    top:20px;
    left: 20px;
    border-radius:5px;
    background-color: white;
    /*margin: 10px;*/
    padding: 20px;
    margin-bottom: 10px;
    max-width: 55%;
    max-height: 300px;

}
.getInfo-button{
    position: relative;
    height: 50px;
    padding: 2px;
    vertical-align: center;
    button{
        vertical-align: middle;
        margin-left: 20px;
        padding: 2px;
    }
}
.input-frame{
    display: flex;
    max-height: 25px;
    p{
        font-weight: bold;
        text-align: center;
        min-width: 65px;
    }
    input{
        max-width: 100px;
        min-width: 50px;
        overflow: auto;
    }
}
.table-div{
    top: 8px;
    position: relative;

}
.info-table{


    tr{
        max-width: 90%;
        max-height: 100px;
        td{
            padding: 5px;
            text-align: center;
            min-width:65px;
            max-width: 400px;
        }
    }
}
</style>