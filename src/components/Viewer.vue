<template>
    <div id="cesiumContainer"></div>
    <button @click="flyToModel()"  style="width: 120px;height: 40px; position: absolute;top:30px;left: 50px">FlyTo模型</button>
    <button @click="moveModel()"  style="width: 120px;height: 40px; position: absolute;top:80px;left: 50px">移动模型</button>
    <button @click="rotateModel()"  style="width: 120px;height: 40px; position: absolute;top:130px;left: 50px">旋转模型</button>
    <button @click="removeCoordinate()"  style="width: 120px;height: 40px; position: absolute;top:180px;left: 50px">取消编辑</button>
<!--    <div id="fpslabel"></div>-->
</template>

<script>


import EditB3DM from "../js/ModelEdit/EditB3DM.js";
import CesiumFPSUtil from "../js/CesiumFPSUtil/CesiumFPSUtil.js"
import WaterFace from "./DynamicMonomerSingle/WaterFace.js";
import BounceMarker from "./DynamicMonomerSingle/BounceMarker.js"
import AlertMarker from"./DynamicMonomerSingle/AlertMarker.js"
import ErectLable from "./DynamicMonomerSingle/ErectLabel/index.js"
import FloatMarker from "./DynamicMonomerSingle/FloatMarker.js";
import DynamicDivLabel from "./DynamicMonomerSingle/DynamicDivLabel/index.js"
import DivPoint from "./DynamicMonomerSingle/DivPoint/index.js"
import BillboardPlane from  "./DynamicMonomerSingle/BillboardPlane/index.js"
import GradientLabel from "./DynamicMonomerSingle/GradientLabel/index.js"
import HotSpotBoard from "./DynamicMonomerSingle/HotSpotBoard/index.js"
import PointCluster1 from "./DynamicMonomerSingle/PointCluster1/index.js"
let viewer,palaceTileset;
let editObj;
let pointCluster1
export default {
name: "Viewer",
data (){
  return{
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
  palaceTileset = new Cesium.Cesium3DTileset({
    url: 'http://211.149.185.229:8081/data/offset_3dtiles/tileset.json',
    //控制切片视角显示的数量，可调整性能/src/assets/yaogansuo_3dtiles/tileset.json
  });
  palaceTileset.readyPromise.then(function (palaceTileset) {
    //添加到场景
    viewer.scene.primitives.add(palaceTileset)
    //定义编辑对象
    editObj = new EditB3DM(viewer, palaceTileset, 1, 1)
  });
  // viewer.flyTo(palaceTileset)
  viewer._cesiumWidget._creditContainer.style.display = "none"; //去掉版权信息吧
  // this.drawWater()
  // let c = Cesium.Cartographic.fromDegrees(140,20,300);
  // let lng = Cesium.Math.toDegrees(c.longitude);
  // console.log(c,lng)
  // let bouncemarker = new BounceMarker(viewer,[32,40,0])

  // setInterval(()=>{
  //
  //   bouncemarker.bounce()
  //   // bouncemarker.flyTo()
  // },4000)
  // let alertMarker = new AlertMarker(viewer,[10,0,30],{})
  // alertMarker.flyTo()
  // alertMarker.remove()

  // let erectLable = new ErectLable(viewer,[33,40,0],"安禄山")
  // erectLable.flyTo()
  // erectLable.remove()

  // let floatMarker = new FloatMarker(viewer,[120.974,30.9256,0])
  // floatMarker.flyTo()
  // floatMarker.remove()

  // let dynamicDivLabel = new DynamicDivLabel(viewer,[120.974,30.9256,3],"安禄山")
  // dynamicDivLabel.flyTo()
  // dynamicDivLabel.remove()

  // let divPoint = new DivPoint(viewer,[120.974,30.9256,0],{title:"水泵信息",flow:30,stage:16,status:[{label:"磨损严重",state:0},{label:"运转正常",state:1}]})
  // divPoint.flyTo()
  // divPoint.remove()

  // let billboardPlane = new BillboardPlane(viewer,[120.974,30.9256,0],"40.3")
  // let i;
  // setInterval(()=>{
  //   i=(Math.random()*4+30).toFixed(1);
  //   billboardPlane.updateText(i)
  // },200)
  // billboardPlane.flyTo()
  // billboardPlane.remove()

  // let gradientLabel = new GradientLabel(viewer,[120.974,30.9256,0],"40.3")
  // gradientLabel.flyTo()
  // gradientLabel.remove()

  // let hotSpotBoard = new HotSpotBoard(viewer,[120.974,30.9256,0])
  // hotSpotBoard.flyTo()
  // hotSpotBoard.windowClose()

  pointCluster1 = new PointCluster1(viewer, "http://211.149.185.229:8081/data/cluserPoint.json", {
    pixelRange: 30, //聚合像素
    minimumClusterSize: 3, //最低聚合数
    billboardImg: "./image/marker/bluecamera.png", //单个点的图片
    clusterImage: "./image/pointcluster" //聚合图标路径
  });

  // 数据加载完成事件
  // pointCluster1.DataLoadedEvent.addEventListener(dataSource => {
  //   viewer.flyTo(dataSource.entities.values);
  // })
  pointCluster1.flyTo()

},
methods: {
  //绘制水面波浪效果
  drawWater(){
    // console.log("添加水面")
    // viewer.scene.globe.depthTestAgainstTerrain = false;
    var waterFace=[
      140.0, 20.1,
      140.1, 20.1,
      140.1, 20.0,
      140.0, 20.0];
    let water = new WaterFace(viewer,waterFace)
    water.flyTo()
    // water.destroy()

  },
  flyToModel(){

    viewer.zoomTo(palaceTileset);
  },
  moveModel(){
    if (!editObj){
      editObj = new EditB3DM(viewer, palaceTileset, 1, 1)
    }
    //平移
    editObj.editTranslation()
  },
  rotateModel(){
    if (!editObj){
      editObj = new EditB3DM(viewer, palaceTileset, 1, 1)
    }
    //旋转
    editObj.editRtation()
  },
  removeCoordinate (){
    //取消编辑
    pointCluster1.remove()
    // editObj.destroy()
    // editObj = undefined
  },
},
}
</script>

<style scoped>

</style>