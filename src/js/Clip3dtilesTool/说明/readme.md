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
### 判断凹凸多边形方法
```javascript
//--------------判断是否是凸多边形函数-------------------------
// p：顶点数组(数组对象) n：顶点个数；1：凸集；-1：凹集；0：曲线不符合要求无法计算
convex(p,n) {
  var j,k,z;
  var flag = 0;
  if (n<3){
    console.log("不符合要求")
    return 0;
  }
  for (var i=0;i<n;i++) {
    j = (i + 1) % n;
    k = (i + 2) % n;
    z = (p[j][0] - p[i][0]) * (p[k][1] - p[j][1]);
    z -= (p[j][1] - p[i][1]) * (p[k][0] - p[j][0]);
    if (z < 0){
      flag |= 1;
    } else if (z > 0){
      flag |=  2;
    }
    if (flag == 3){
      console.log("凹多边形，不符合要求")
      return -1; //CONCAVE
    }
  }
  if (flag != 0){
    console.log("凸多边形")
    return 1; //CONVEX
  } else{
    return 0;
  }
}
//使用示例
let polygon = [
  [
    120.93770294839021,
    30.944409113550464
  ],
  [
    120.94412391411574,
    30.945469698162704
  ],
  [
    120.94425679285655,
    30.943722096232364
  ],
  [
    120.94410889332894,
    30.937019975123036
  ],
  [
    120.94347175150074,
    30.932161592194745
  ]
]
convex(polygon,polygon.length)
```