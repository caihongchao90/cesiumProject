
//CesiumFPSUtil类是用来动态更新帧率

function getTimestamp() {
  var getTime;
  if (
    typeof performance !== "undefined" &&
    typeof performance.now === "function" &&
    isFinite(performance.now())
  ) {
    getTime = function () {
      return performance.now();
    };
  } else {
    getTime = function () {
      return Date.now();
    };
  }
  return getTime();
}
class CesiumFPSUtil {
  constructor(viewer) {
    // if (!containerId) throw new Error('containerId is required!')
    if (!viewer) throw new Error('viewer is required!')
    this.viewer = viewer
    // this.id = containerId;
    this._handle = undefined
    this._info = {
      lon:0,
      lat:0,
      height:0,
      cameraHeight :0
    };
    this._lastFpsSampleTime = getTimestamp();
    this._lastMsSampleTime = getTimestamp();
    this._fpsFrameCount = 0;
    this._msFrameCount = 0;
    this.createDiv();
    this.viewer.cesiumWidget.container.appendChild(this.container)
    this.initEvent();
  }

  createDiv() {
    let parent = document.createElement("div");
    parent.id = 'fpslabel';
    // parent.style.background = '#000000';
    parent.style.width = '100%';
    parent.style.height= '30px';
    parent.style.left= '30px';
    parent.style.position= 'absolute';
    parent.style.bottom='0px';
    parent.style.fontSize = '14px'
    parent.style.zIndex = '9999';
    const fpsDiv = document.createElement("div");
    fpsDiv.className = "info-content";

    this._fpsText = document.createElement("span");
    this._msText = document.createElement("span");
    this._lon = document.createElement("span");
    this._lat = document.createElement("span");
    this._height = document.createElement("span");
    this._cameraHeight = document.createElement("span");
    fpsDiv.append(this._fpsText);
    fpsDiv.append(this._msText);
    fpsDiv.append(this._lon);
    fpsDiv.append(this._lat);
    fpsDiv.append(this._height);
    fpsDiv.append(this._cameraHeight);
    parent.append(fpsDiv);
    this.container = parent
  }
  initEvent(){
    let that = this;
    that._handle = new Cesium.ScreenSpaceEventHandler(that.viewer.scene.canvas);
    that._handle.setInputAction(function (movement) {
      let cartesian  = that.viewer.scene.pickPosition(movement.endPosition); //用来添加广告牌
      let pickedObject = that.viewer.scene.pick(movement.endPosition);
      if(cartesian){
        //将笛卡尔三维坐标转为地图坐标（弧度）
        let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        if (!pickedObject){
          that._info.height = 0.0000;
        }else{
          that._info.height = cartographic.height.toFixed(4);
        }
        //将地图坐标（弧度）转为十进制的度数
        that._info.lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(4);
        that._info.lon = Cesium.Math.toDegrees(cartographic.longitude).toFixed(4);
      }
    },Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    that.viewer.scene.postRender.addEventListener(this.update,this)
  }

  update() {
    let that = this
    let cameraHeight = that.viewer.camera.positionCartographic.height;
    that._info.cameraHeight = cameraHeight.toFixed(4)
    let time = getTimestamp();
    that._fpsFrameCount++;
    let updateDisplay = true;
    let fpsElapsedTime = time - that._lastFpsSampleTime;
    if (fpsElapsedTime > 1000) {
      var fps = "N/A";
      if (updateDisplay) {
        fps = ((that._fpsFrameCount * 1000) / fpsElapsedTime) | 0;
      }

      that._fpsText.innerText ="帧率:" + fps + " FPS" + " ";
      that._lastFpsSampleTime = time;
      that._fpsFrameCount = 0;
    }
    that._msFrameCount++;
    let msElapsedTime = time - that._lastMsSampleTime;
    if (msElapsedTime > 200) {
      let ms = "N/A";
      if (updateDisplay) {
        ms = (msElapsedTime / that._msFrameCount).toFixed(2);
      }
      that._lon.innerText = "经度:" + that._info.lon + " ° ";
      that._lat.innerText = "纬度:" + that._info.lat + " ° ";
      that._cameraHeight.innerText = "相机高度:" + that._info.cameraHeight + " 米 ";
      that._msText.innerText = "延迟:" + ms + " MS ";
      that._lastMsSampleTime = time;
      that._msFrameCount = 0;
    }
    that._height.innerText = "高度:" + that._info.height + " 米 ";
  }
  destroy(){
    if (this._handle){
      this._handle.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    }
    this.viewer.scene.postRender.removeEventListener(this.update, this); //移除事件监听
    this.container.remove(); //删除dom
  }

}
export default CesiumFPSUtil;
