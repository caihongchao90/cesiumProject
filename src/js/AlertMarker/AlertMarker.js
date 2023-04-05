//作者：蔡宏超
//最后修改日期：2023.03.28
//功能：闪烁点

export default class AlertMarker {
  constructor(viewer, position, style={}) {
    this.viewer = viewer;
    let c = Cesium.Cartographic.fromDegrees(position[0],position[1],position[2]);
    this.lng = Cesium.Math.toDegrees(c.longitude);
    this.lat = Cesium.Math.toDegrees(c.latitude);
    this.height = c.height;

    this.color = style.color || Cesium.Color.RED;
    this.iconUrl = style.iconUrl || "./image/billboard.png";
    this.pixelSize = style.pixelSize || 10;
    this.pixelMax = style.pixelMax || 50;
    this.outWidth = style.outWidth || 20;
    this.markerEntity = undefined
    this.#createMarker();
  }

  #createMarker() {
    var markerOpacity = 1,
      a = true,
      pixelSize = this.pixelSize,
      n = true,
      outLineOpacity = .7,
      o = true,
      t = 0,
      pixelMax = this.pixelMax;
    this.markerEntity = this.viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(this.lng, this.lat, this.height)
    })
    this.markerEntity.point = {
      color: new Cesium.CallbackProperty(() => {
        return a ? (markerOpacity -= .03,
        markerOpacity <= 0 && (a = false)) : (markerOpacity = 1,
          a = true),
          this.color.withAlpha(markerOpacity)
      }, false),
      pixelSize: new Cesium.CallbackProperty((time, result) => {
        return n ? (pixelSize += 2,
        pixelSize >= pixelMax && (n = false)) : (pixelSize = 10,
          n = true),
          pixelSize
      }, false),
      outlineColor: new Cesium.CallbackProperty(() => {
        return o ? (outLineOpacity -= .035,
        outLineOpacity <= 0 && (o = false)) : (outLineOpacity = .7,
          o = true),
          this.color.withAlpha(outLineOpacity)
      }, false),
      outlineWidth: this.outWidth,
      scaleByDistance: new Cesium.NearFarScalar(1200, 1, 5200, 0.4),
    }

    if (this.iconUrl) {
      this.markerEntity.billboard = {
        image: this.iconUrl,
        scaleByDistance: new Cesium.NearFarScalar(1200, 1, 5200, 0.4), //设置随图缩放距离和比例
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 10000), //设置可见距离 10000米可见
      }
    }
  }
  flyTo(){
    this.viewer.flyTo(this.markerEntity,{
      duration:0,
    })
  }
  remove() {
    this.viewer.entities.remove(this.markerEntity);
    this.markerEntity = undefined;
  }
}