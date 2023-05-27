**MeasureTools说明**
==============================
该工具依赖turf库，需先安装后方可使用。
>### 功能：  
> 测量高差、面积、距离

![](./测量工具.gif) 

### 引入
```javascript
import MeasureTools from "./MeasureTools/index.js"
```

### 接口
- 实例化
```javascript
let mdTool = new MeasureTools.Distance(viewer,{
    startImgUrl:startImgUrl,
    endImgUrl:startImgUrl
});
let mhTool = new MeasureTools.Height(viewer);
let maTool = new MeasureTools.Area(viewer);
```
- 激活
```javascript
mdTool.activate()
mhTool.activate()
maTool.activate()
```
- 禁用
```javascript
mdTool.deactivate()
mhTool.deactivate()
maTool.deactivate()
```
- 清除绘制
```javascript
mdTool.clear()
mhTool.clear()
maTool.clear()
```