**Clip3dtilesTool类说明**
==============================
>### 功能：  
>根据多边形对3dtiles模型进行裁剪
#### 已知问题：
1、只可以裁剪凸多边形。  
2、3dtiles模型裁剪只能裁剪一次，不能多裁剪
> 
![](模型裁剪.gif)  
### 接口
- 实例化
```javascript
//先把工具实例化出来一个
let clip3dtilesTool = new Clip3dtilesTool()
```
- 判断顺时针(返回值：true为顺时针，false为逆时针)
```javascript
clip3dtilesTool.booleanClockwise(ploygon)
```
参数说明：  
>- **ploygon 多边形边界角点数组(例如“[ [lon,lat], [lon,lat], [lon,lat]]”)**
- 裁剪模型
```javascript
clip3dtilesTool.getclippingPlanes(currentModel,polygon,inner)
clip3dtilesTool.clipping(currentModel,polygon,inner)
```
参数说明：  
>- **currentModel 欲裁剪的3dtiles模型**
>- **polygon 裁剪多边形(例如“[ [lon,lat], [lon,lat], [lon,lat]]”)**
>- **inner 保留多边形内部还是外部**
### 使用案例
```javascript
let polygon = [
  [120.9076894,30.8504938],
  [120.9106915,30.8506163],
  [120.9105601,30.8490538],
  [120.9076283,30.8489596]
]
let tileset = new Cesium.Cesium3DTileset({
  url: url,
})
tileset.readyPromise.then(currentModel=>{
  let clip3dtiles = new Clip3dtilesTool()
  clip3dtiles.clipping(currentModel,polygon,true)
})
```
