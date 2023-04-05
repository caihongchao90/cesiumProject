**PointCluster1类说明**
==============================
>### 功能：  
> 聚合点样式1
>
![](点聚合1.gif)  
### 接口
- 实例化
```javascript
let pointCluster1 = new PointCluster1(viewer, jsonpath, options);
```
参数说明：  
>- **viewer 主视图**
>- **jsonpath json文件路径**
>- **options 必选，内容包括以下(pixelRange,minimumClusterSize,billboardImg,clusterImage)**
```javascript
//options 参数参考
options = {
    pixelRange: 30, //聚合像素
    minimumClusterSize: 3, //最低聚合数
    billboardImg: "./image/marker/bluecamera.png", //单个点的图片
    clusterImage: "./image/pointcluster" //聚合图标路径
}

```
- 聚焦
```javascript
pointCluster1.flyTo()
```
- 移除 (未创建完成时移除，会抛出异常)
```javascript
pointCluster1.remove()
```