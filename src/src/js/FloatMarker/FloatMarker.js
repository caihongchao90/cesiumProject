//作者：蔡宏超
//最后修改日期：2023.03.29
//功能：浮动点

export default class FloatMarker {
  constructor(viewer, position, style={}) {
    this.viewer = viewer;
    this.positionArry = position
    //坐标
    this.lng = position[0];
    this.lat = position[1];
    this.height = position[2];
    this.style = style
    this.style.image = style.image || "./image/float.png";
    this.style.lineHeight = style.lineHeight || 16;
    this.style.bounceHeight = style.bounceHeight || 0.5;
    this.style.increment = style.increment || 0.008;
    this.#add();
  }

  //添加图标点
  #add() {
    let mMinH = this.height + this.style.lineHeight; //marker的最小高度
    let mH = mMinH; //当前高度
    let i = true; //增减
    let mMaxH = mMinH + this.style.bounceHeight; //最大高度

    this.floatMarker = this.viewer.entities.add({
      position: new Cesium.CallbackProperty(e => {
        if (i) {
          mH += this.style.increment;
          if (mH > mMaxH) i = false;
        } else {
          mH -= this.style.increment;
          if (mH < mMinH) i = true;
        }
        return Cesium.Cartesian3.fromDegrees(this.lng, this.lat, mH);
      }),
      billboard: {
        image: this.style.image,
        height: 78,
        width: 42,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 2000),
      },
    });

    //线
    this.line = this.viewer.entities.add({
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights([
          this.lng, this.lat, this.height,
          this.lng, this.lat, mMinH
        ]),
        //  material: Cesium.Color.AQUA.withAlpha(0.8),
        material: new Cesium.PolylineDashMaterialProperty({ color: Cesium.Color.AQUA }),
        width: 2,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 2000),
      },
    });
  }
  flyTo(){
    this.viewer.camera.flyTo({
      destination : Cesium.Cartesian3.fromDegrees(this.positionArry[0],this.positionArry[1]-0.0002,this.style.lineHeight+20),
      duration:1,
      orientation:{
        // heading : Cesium.Math.toRadians(-175.0),
        pitch : Cesium.Math.toRadians(-50.0),
        roll : 0.0
      }
    });
  }
  remove() {
    this.viewer.entities.remove(this.floatMarker);
    this.viewer.entities.remove(this.line);
  }
}