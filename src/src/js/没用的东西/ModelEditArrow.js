
export default class ModelEditArrow{

  constructor(viewer, tiles){
    const Cesium = window.Cesium
    this._viewer = viewer;
    this._tiles = tiles;
    this._defaultWidth = 25;
    this.arrows = null
  }
  //更新坐标系位置
  updateLineArrow() {
    this.removeCoordArrows()
    this._length = (this._tiles._root._boundingVolume._boundingSphere.radius) / 0.8
    this.originPos = this.returnTilesCentor(this._tiles)
    let targetPos = this.getTransPostion(this.originPos, this._length)
    this.initLineArrow(this.originPos, targetPos)
  }
  //添加立方体对角点
  addDiagPoint(){
    const frompoint_to_world_matrix = Cesium.Transforms.eastNorthUpToFixedFrame(this.originPos);
    const translation = new Cesium.Cartesian3(this._length, this._length, this._length); //单位为米
    const result = new Cesium.Cartesian3(0,0,0);
    Cesium.Matrix4.multiplyByPoint(frompoint_to_world_matrix, translation, result);
    let diagPoint = new Cesium.Entity({
      id:'diagPoint',
      position: result,
      point: {
        color: Cesium.Color.RED,
        pixelSize: 10
      }});
    this._viewer.entities.add(diagPoint);
    return diagPoint;
  }
  // 获取3dtiles的中心点
  returnTilesCentor(tiles){
    const center = tiles._root._boundingVolume._boundingSphere.center;
    return center;
  }
  //获取变换后各轴的位置
  getTransPostion(originPos, length){
    const frompoint_to_world_matrix = Cesium.Transforms.eastNorthUpToFixedFrame(originPos);
    const local_translation_x = new Cesium.Cartesian3(length, 0, 0); //单位为米
    const local_translation_y = new Cesium.Cartesian3(0, length, 0); //单位为米
    const local_translation_z = new Cesium.Cartesian3(0, 0, length); //单位为米
    const result_x = new Cesium.Cartesian3(0,0,0);
    const result_y = new Cesium.Cartesian3(0,0,0);
    const result_z = new Cesium.Cartesian3(0,0,0);
    Cesium.Matrix4.multiplyByPoint(frompoint_to_world_matrix, local_translation_x, result_x); // 转换矩阵左乘局部平移向量，结果存储在 result 中，结果是世界坐标下的平移终点向量
    Cesium.Matrix4.multiplyByPoint(frompoint_to_world_matrix, local_translation_y, result_y);
    Cesium.Matrix4.multiplyByPoint(frompoint_to_world_matrix, local_translation_z, result_z);

    return {targetX:result_x,targetY:result_y,targetZ:result_z};
  }

  initLineArrow(originDegree, targetPos) {
    this.arrows = new Cesium.PolylineCollection()
    const xPos = [new Cesium.Cartesian3(originDegree.x,originDegree.y,originDegree.z),
                  new Cesium.Cartesian3(targetPos.targetX.x,targetPos.targetX.y,targetPos.targetX.z)]
    const xArrow = this.darwArrow(
      this.arrows,
      'model_edit_xArrow',
      xPos,
      Cesium.Color.GREEN
    )
    const yPos = [new Cesium.Cartesian3(originDegree.x,originDegree.y,originDegree.z),
                  new Cesium.Cartesian3(targetPos.targetY.x,targetPos.targetY.y,targetPos.targetY.z)]
    const yArrow = this.darwArrow(
      this.arrows,
      'model_edit_yArrow',
      yPos,
      Cesium.Color.BLUE
    )
    const zPos = [new Cesium.Cartesian3(originDegree.x,originDegree.y,originDegree.z),
                  new Cesium.Cartesian3(targetPos.targetZ.x,targetPos.targetZ.y,targetPos.targetZ.z)]
    const zArrow = this.darwArrow(
      this.arrows,
      'model_edit_zArrow',
      zPos,
      Cesium.Color.RED
    )
    this._coordArrows = this._viewer.scene.primitives.add(this.arrows)
    this._coordArrows._name = 'CoordAxis'
  }

  darwArrow(arrows, name, positions, color) {
    const arrow = arrows.add({
      positions: positions,
      width: this._defaultWidth,
      material: Cesium.Material.fromType(Cesium.Material.PolylineArrowType, {
        color: color
      })
    })
    arrow._name = name
    return arrow;
  }

  removeCoordArrows(){
    if (this.arrows) {
      this.arrows.removeAll()
    }
  }
}