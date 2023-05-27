**CesiumFPSUtil类说明**
==============================
>### 功能：
>实时显示经纬度高程等信息，仅需简单创建类即可
>效果图如下：
>![](帧率1.gif)

### 使用
>引入类文件，然后创建类即可
```javascript
const fpsInfo = new CesiumFPSUtil(viewer)
```
- 参数  
**viewer 主视图**
>销毁
```javascript
fpsInfo.destroy()
```