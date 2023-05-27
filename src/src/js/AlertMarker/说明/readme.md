**AlertMarker类说明**
==============================
>### 功能：  
> 闪烁点 (包含图片iconUrl路径) 
>
![](闪烁点.gif)  
### 接口
- 实例化
```javascript
let alertMarker = new AlertMarker(viewer,[longitude,latitude,height], style={})
```
参数说明：  
>- **viewer 主视图**
>- **[longitude, latitude, height] 添加点的位置经纬度和高程**
>- **style 可选，配置弹跳参数(color、iconUrl、pixelSize、pixelMax、outWidth)**
```javascript
 style = {
   color: Cesium.Color.RED, //颜色
   iconUrl: "./image/billboard.png", //闪烁点中心的billboard
   pixelSize: 10, 
   pixelMax:50,
   outWidth:20
 };
 ```
- 聚焦
```javascript
alertMarker.flyTo()
```
- 销毁
```javascript
alertMarker.remove()
```