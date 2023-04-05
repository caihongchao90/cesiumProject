
export default class ModelEditCircle{
  constructor(viewer,tiles) {
    const Cesium = window.Cesium
    this._viewer = viewer
    this._tiles = tiles
    this._coordCircle = []
    this.createCircle()
  }

  createCircle() {
    let CircleCenter = this.getCircleCenter()
    let lon = CircleCenter.longitude;
    let lat = CircleCenter.latitude;
    let height = CircleCenter.height;
    let radius = CircleCenter.radius;
    const position = []
    for (let i = 0; i <= 360; i += 3) {
      const sin = Math.sin(Cesium.Math.toRadians(i))
      const cos = Math.cos(Cesium.Math.toRadians(i))
      const x = radius * cos
      const y = radius * sin
      position.push(new Cesium.Cartesian3(x, y, 0))
    }
    const matrix = Cesium.Transforms.eastNorthUpToFixedFrame(
      new Cesium.Cartesian3.fromDegrees(lon, lat, height)
    )
    //绕Z轴
    let axisSphereZ = this.createAxisSphere(
      'model_edit_zCircle',
      position,
      matrix,
      Cesium.Color.RED
    )
    axisSphereZ = this._viewer.scene.primitives.add(axisSphereZ)
    //绕Y周
    let axisSphereY = this.createAxisSphere(
      'model_edit_yCircle',
      position,
      matrix,
      Cesium.Color.BLUE
    )
    axisSphereY = this._viewer.scene.primitives.add(axisSphereY)
    let my = Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(90))
    let rotationY = Cesium.Matrix4.fromRotationTranslation(my)
    Cesium.Matrix4.multiply(
      axisSphereY.geometryInstances.modelMatrix,
      rotationY,
      axisSphereY.geometryInstances.modelMatrix
    )
    //绕X周
    let axisSphereX = this.createAxisSphere(
      'model_edit_xCircle',
      position,
      matrix,
      Cesium.Color.GREEN
    )
    axisSphereX = this._viewer.scene.primitives.add(axisSphereX)
    let mx = Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(90))
    let rotationX = Cesium.Matrix4.fromRotationTranslation(mx)
    Cesium.Matrix4.multiply(
      axisSphereX.geometryInstances.modelMatrix,
      rotationX,
      axisSphereX.geometryInstances.modelMatrix
    )
    this._coordCircle.push(axisSphereX,axisSphereY,axisSphereZ)
  }
  //获取圆心坐标
  getCircleCenter(){
    const center = this._tiles._root._boundingVolume._boundingSphere.center;
    const radius = (this._tiles._root._boundingVolume._boundingSphere.radius) / 0.8
    let cartographic = Cesium.Cartographic.fromCartesian(center)
    let longitude = Cesium.Math.toDegrees(cartographic.longitude);
    let latitude = Cesium.Math.toDegrees(cartographic.latitude);
    let height = cartographic.height
    // console.log("cartographic.height,height",cartographic.height,height)
    return {longitude:longitude,latitude:latitude,height:height,radius:radius}
  }
  //创建轴，但是并未添加
  createAxisSphere(name, position, matrix, color) {
    let result = new Cesium.Primitive({
      geometryInstances: new Cesium.GeometryInstance({
        id: name,
        geometry: new Cesium.PolylineGeometry({
          positions: position,
          width: 5
        }),
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(color)
        }
      }),
      releaseGeometryInstances: false,
      appearance: new Cesium.PolylineColorAppearance({
        translucent: false
      }),
      modelMatrix: matrix
    })
    result._name = name
    return result
  }
  //移除旋转轴
  removeAxisSphere(){
    if (this._coordCircle.length != 0){
      for (let i = 0;i<this._coordCircle.length;i++){
        this._viewer.scene.primitives.remove(this._coordCircle[i])
      }
    }
  }
}