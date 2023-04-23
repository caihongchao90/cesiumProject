/**
 * 根据多边形数组创建裁切面
 */
//判断顺时针逆时针
export default class Clip3dtilesTool{
  constructor(){
  }
  booleanClockwise(ploygon){
    let booleanClockwise,sum = 0
    for (let i =0;i<ploygon.length-1;i++){
      sum += ploygon[i][0]*ploygon[i+1][1] - ploygon[i][1]*ploygon[i+1][0]
    }
    if (sum>0){
      return false;
    }else {
      return true;
    }
  }
  //获得转换矩阵
  getInverseTransform (tileSet) {
    let transform
    let tmp = tileSet.root.transform
    if ((tmp && tmp.equals(Cesium.Matrix4.IDENTITY)) || !tmp) {
      // 如果root.transform不存在，则3DTiles的原点变成了boundingSphere.center
      transform = Cesium.Transforms.eastNorthUpToFixedFrame(tileSet.boundingSphere.center)
    } else {
      transform = Cesium.Matrix4.fromArray(tileSet.root.transform)
    }
    return Cesium.Matrix4.inverseTransformation(transform, new Cesium.Matrix4())
  }

  //通过转换矩阵，获取转换坐标系的坐标
  getOriginCoordinateSystemPoint (point, inverseTransform) {
    let val = Cesium.Cartesian3.fromDegrees(point[0], point[1])
    return Cesium.Matrix4.multiplyByPoint(inverseTransform, val, new Cesium.Cartesian3(0, 0, 0))
  }
  //获取裁剪面
  createPlane (p1, p2, inverseTransform) {
    // 将仅包含经纬度信息的p1,p2，转换为相应坐标系的cartesian3对象
    let p1C3 = this.getOriginCoordinateSystemPoint(p1, inverseTransform)
    let p2C3 = this.getOriginCoordinateSystemPoint(p2, inverseTransform)

    // 定义一个垂直向上的向量up
    let up = new Cesium.Cartesian3(0, 0, 10)
    //  right 实际上就是由p1指向p2的向量
    let right = Cesium.Cartesian3.subtract(p2C3, p1C3, new Cesium.Cartesian3())

    // 计算normal， right叉乘up，得到平面法向量，这个法向量指向right的右侧
    let normal = Cesium.Cartesian3.cross(right, up, new Cesium.Cartesian3())
    normal = Cesium.Cartesian3.normalize(normal, normal)

    //由于已经获得了法向量和过平面的一点，因此可以直接构造Plane,并进一步构造ClippingPlane
    let planeTmp = Cesium.Plane.fromPointNormal(p1C3, normal)
    return Cesium.ClippingPlane.fromPlane(planeTmp)
  }
  //获取裁剪面集合
  getclippingPlanes(currentModel,polygon,inner=true){
    let clippingPoints = polygon
    let transform = this.getInverseTransform(currentModel)
    clippingPoints.push(clippingPoints[0])
    // clippingPoints = clippingPoints.reverse()
    // 判断顺时针？
    let clockwise = this.booleanClockwise(clippingPoints)
    console.log("clockwise",clockwise)
    if (!clockwise){
      clippingPoints = clippingPoints.reverse()
    }
    inner?null:clippingPoints = clippingPoints.reverse();
    let planes = []
    for (let i =0;i<clippingPoints.length-1;i++){
      let plane = this.createPlane(clippingPoints[i],clippingPoints[i+1],transform)
      planes.push(plane)
    }
    let clippingPlanes = new Cesium.ClippingPlaneCollection({
      planes : planes,
      unionClippingRegions:inner
    });
    return clippingPlanes
  }
  clipping(currentModel,polygon,inner=true){
    let clippingPlanes = this.getclippingPlanes(currentModel,polygon,inner)
    currentModel.clippingPlanes = clippingPlanes
  }
}
