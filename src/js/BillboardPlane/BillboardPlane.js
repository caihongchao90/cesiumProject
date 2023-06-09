export default class BillboardPlane{
  constructor(viewer, position, text) {

    this.viewer = viewer;
    this.position = Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2]);
    this.positionArry = position
    this.text = text || "";
    this.plane = undefined
    this.init();
  }

  init() {
    let imgWidth = 512;
    let imgHeight = 329;

    let img = new Image(imgWidth, imgHeight);

    img.crossOrigin = "Anonymous";
    img.src = "data:image/png;base64,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";
    let that = this;
    img.onload = () => {
      let canvas = that.createCanvas({ image: img, text: this.text, imgWidth, imgHeight });
      let newImg = new Image(canvas.width, canvas.height);
      newImg.src = canvas.toDataURL("image/png");

      // 存储原始图片 用于重绘
      that['origialImg'] = img;
      // 存储 this.canvas 用于重绘
      that['myCanvas'] = that.canvas;
      that.addBillboard(newImg);

    };
  }

  //添加billboard
  addBillboard(canvas) {
    this.plane = this.viewer.entities.add({
      position: this.position,
      billboard: {
        image: canvas,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        scaleByDistance: new Cesium.NearFarScalar(800, 0.4, 1200, 0.2),
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 10000),
        // height: 8,
        // width: 10,
        // sizeInMeters: true,
      }
    });
    console.log("add",this.plane)
  }

  //创建canvas
  createCanvas(param) {
    let canvas = param.canvas;
    let image = param.image;
    let text = param.text;
    if (!param.canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "BillboardPlane"
      canvas.width = param.imgWidth;
      canvas.height = param.imgHeight;
    }
    canvas.id = "BillboardPlane"
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);

    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.font = "80px sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillText('温度:', 50, canvas.height / 2);
    ctx.fillText(text, 230, canvas.height / 2);
    ctx.fillText('℃', 400, canvas.height / 2);
    console.log(canvas)
    return canvas;
  }

  //更新文字
  updateText(text) {
    let canvas = this.createCanvas({ image: this['origialImg'], text: text, canvas: this.myCanvas });
    let newImg = new Image(canvas.width, canvas.height);
    newImg.src = canvas.toDataURL("image/png");
    this.plane.billboard.image = newImg;
  }
  flyTo(){
    this.viewer.camera.flyTo({
      destination : Cesium.Cartesian3.fromDegrees(this.positionArry[0],this.positionArry[1],this.positionArry[2]+20),
      duration:1,
    });
  }
  remove() {

  }
}