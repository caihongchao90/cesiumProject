//作者：蔡宏超
//最后修改日期：2023.03.28
//功能：添加弹跳点特效

export default class BounceMarker{
  constructor(viewer, position, style={}) {
    this.viewer = viewer;
    let c = Cesium.Cartographic.fromDegrees(position[0],position[1],position[2]);
    this.lng = Cesium.Math.toDegrees(c.longitude);
    this.lat = Cesium.Math.toDegrees(c.latitude);
    this.height = c.height;

    this.style = {
      image: "./image/billboard.png", //图标
      bounceHeight: 100, //高度
      increment: 0.05, //增量
    };
    style.image?this.style.image=style.image:this.style.image="./image/billboard.png"
    style.bounceHeight?this.style.bounceHeight=style.bounceHeight:this.style.bounceHeight=100
    style.increment?this.style.increment=style.increment:this.style.increment=0.05
    this.bounceMarker = undefined
    this.#add();
  }
  //加#为私有方法
  #add() {
    let h = this.height + this.style.bounceHeight;
    let t = 0;
    let cH = 0;
    this.bounceMarker = this.viewer.entities.add({
      position: new Cesium.CallbackProperty(e => {
        cH += this.style.increment;
        t = t + cH;
        if (t > this.style.bounceHeight) {
          t = this.style.bounceHeight;
          cH *= -1;
          cH *= 0.60;
        }
        return Cesium.Cartesian3.fromDegrees(this.lng, this.lat, h - t);
      }),
      billboard: {
        image: this.style.image,
      }
    });

    this.bounceMarker.bounce = e => {
      this.bounce();
    }
  }
  flyTo(){
    this.viewer.flyTo(this.bounceMarker,{
      duration:0,
    })
  }

  //弹跳 删掉重新创建
  bounce() {
    if (this.bounceMarker){
      this.viewer.entities.remove(this.bounceMarker);
    }
    this.#add();
  }

  destroy() {
    if (this.bounceMarker){
      this.viewer.entities.remove(this.bounceMarker);
      this.bounceMarker = null
    }
    this.viewer = null
    this.style = null

  }
}