**WaterFace类说明**
==============================
>### 功能：  
>添加水面效果，为cesium自带的效果 (必须包含水面纹理图 normalMap，并在类中修改地址) 
>
![](水面.gif)  
### 接口
- 实例化
```javascript
let water = new WaterFace(viewer,waterFaceData,height,options={})
```

参数说明：  
>- viewer 主视图
>- waterFaceData 水面的经纬度数组数据(不含高度)
>- height 可选，水面的高度，默认为0
>- options 可选，配置水面参数(baseWaterColor、frequency、animationSpeed、amplitude、specularIntensity),下面为默认参数   
```javascript
//options 可选参数 默认参数值
options={
  baseWaterColor: new Cesium.Color(64/255.0, 157/255.0, 253/255.0, 0.5), // 水的基本颜色
  frequency: 1000.0,
  animationSpeed: 0.01, // 水的流速
  amplitude: 10, // 水波纹振幅
  specularIntensity: 0.5, // 镜面反射强度
}
```
```javascript
//waterFaceData 必选参数 传入参数值示例
var waterFaceData=[
  140.0, 20.1,
  140.1, 20.1,
  140.1, 20.0,
  140.0, 20.0];
```
- 聚焦
```javascript
water.flyTo()
```
- 销毁
```javascript
water.destroy()
```