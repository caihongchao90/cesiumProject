**PointCluster2类说明**
==============================
>### 功能：  
> 聚合点样式2
>
![](点聚合2.gif)  
### 接口
- 实例化
```javascript
let pointCluster2 = new PointCluster2(viewer, jsonpath, options);
```
参数说明：  
>- **viewer 主视图**
>- **jsonpath json文件路径**
>- **options 必选，内容包括以下(pixelRange,minimumClusterSize,billboardImg,colors)**
```javascript
//options 参数参考
let colors = [{
    value: 100, //聚合数大于等于100 红色
    color: "rgb(255,0,0)"
  }, {
    value: 50, //聚合数大于等于50 黄
    color: "rgb(255,255,0)"
  }, {
    value: 10, //聚合数大于等于10 蓝色
    color: "rgb(51, 133, 255)"
  }, {
    value: 1, //聚合数大于等于1 绿
    color: "rgb(0,255,0)"
  }];
options = {
    pixelRange: 100, //聚合像素
    minimumClusterSize: 3, //最低聚合数
    billboardImg: "./image/marker/bluecamera.png", //单个点的图片
    colors: colors 
}
```
- 聚焦
```javascript
pointCluster2.flyTo()
```
- 移除 (未创建完成时移除，会抛出异常)
```javascript
pointCluster2.remove()
```