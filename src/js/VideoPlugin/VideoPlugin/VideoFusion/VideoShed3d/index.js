 import videoShed3dShader from "../glsl"
 import CoordinateTransform from "../CoordinateTransform"

 var VideoShed3d = function(viewer, options) {
     this.viewer = viewer;
     this.CT = new CoordinateTransform();
     this.options = options;

     let option = this.initCameraParam();
     this.near = option.near || 0.1;
     this.cameraPosition = option.cameraPosition;
     this.position = option.position;
     this.alpha = option.alpha || 1;
     this.video = options.video;

     this.debugFrustum = Cesium.defaultValue(option.debugFrustum, !0);
     this.aspectRatio = option.aspectRatio || 1;

     this.fov = option.fov || 40;
     if (!this.cameraPosition || !this.position) {
         console.log("位置坐标错误");
         return;
     }

     this.activeVideo();
     this.getOrientation();
     this.createShadowMap();
     this.addCameraFrustum();
     this.addPostProcess();
     this.viewer.scene.primitives.add(this);
 }

 VideoShed3d.prototype.getStyle = function() {
     return this.options;
 }

 VideoShed3d.prototype.updateStyle = function(options) {
     this.viewer.scene.primitives.remove(this.cameraFrustum);
     this.options = options;
     let option = this.initCameraParam();
     this.near = option.near || 0.1;
     this.cameraPosition = option.cameraPosition;
     this.position = option.position;
     this.alpha = option.alpha || 1;
     this.debugFrustum = Cesium.defaultValue(option.debugFrustum, !0);

     this.aspectRatio = options.aspectRatio || 1;
     this.fov = option.fov || 400;
     if (!this.cameraPosition || !this.position) {
         console.log("位置坐标错误");
         return;
     }
     this.getOrientation();
     this.createShadowMap();
     this.addCameraFrustum();
 }

 VideoShed3d.prototype.initCameraParam = function() {
     let viewPoint = this.CT.enu_to_ecef({
         longitude: this.options.position.x * 1,
         latitude: this.options.position.y * 1,
         altitude: this.options.position.z * 1
     }, {
         distance: this.options.far,
         azimuth: this.options.rotation.y * 1,
         elevation: this.options.rotation.x * 1
     });
     let position = Cesium.Cartesian3.fromDegrees(viewPoint.longitude, viewPoint.latitude, viewPoint.altitude);
     let cameraPosition = Cesium.Cartesian3.fromDegrees(this.options.position.x * 1, this.options.position.y * 1, this.options.position.z * 1);
     return {
         cameraPosition: cameraPosition,
         position: position,
         alpha: this.options.alpha,
         near: this.options.near,
         fov: this.options.fov,
         debugFrustum: this.options.debugFrustum
     }
 }

 //激活视频投射 
 VideoShed3d.prototype.activeVideo = function() {
     let video = this.video;
     let that = this;
     if (!video) return;
     this.activeVideoListener || (this.activeVideoListener = function() {
         that.videoTexture && that.videoTexture.destroy(),
             that.videoTexture = new Cesium.Texture({
                 context: that.viewer.scene.context,
                 source: video,
                 width: 1,
                 height: 1,
                 pixelFormat: Cesium.PixelFormat.RGBA,
                 pixelDatatype: Cesium.PixelDatatype.UNSIGNED_BYTE
             })
     });
     this.viewer.clock.onTick.addEventListener(this.activeVideoListener);
 }

 VideoShed3d.prototype.deActiveVideo = function() {
     if (!this.activeVideoListener) return;
     this.viewer.clock.onTick.removeEventListener(this.activeVideoListener);
     delete this.activeVideoListener;
 }

 VideoShed3d.prototype.update = function(e) {
     this.viewShadowMap && this.viewer.scene.frameState.shadowMaps.push(this.viewShadowMap) // *重点* 多投影
 }

 // 创建shadowmap
 VideoShed3d.prototype.createShadowMap = function() {
     let camera = new Cesium.Camera(this.viewer.scene);
     camera.position = this.cameraPosition;
     camera.direction = Cesium.Cartesian3.subtract(this.position, this.cameraPosition, new Cesium.Cartesian3(0, 0, 0)); //计算两个笛卡尔的组分差异。
     camera.up = Cesium.Cartesian3.normalize(this.cameraPosition, new Cesium.Cartesian3(0, 0, 0)); // 归一化
     let distance = Cesium.Cartesian3.distance(this.position, this.cameraPosition);

     camera.frustum = new Cesium.PerspectiveFrustum({
         fov: Cesium.Math.toRadians(this.fov),
         aspectRatio: this.aspectRatio, // 1, //this.aspectRatio,//纵横比例
         near: this.near,
         far: distance
     });
     this.viewShadowMap = new Cesium.ShadowMap({
         lightCamera: camera,
         enable: !1,
         darkness: 1,
         isPointLight: !1,
         isSpotLight: !0,
         cascadesEnabled: !1,
         context: this.viewer.scene.context,
         pointLightRadius: distance,
     })
 }

 // 获取shadowmap位置
 VideoShed3d.prototype.getOrientation = function() {
     let direction = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(this.position, this.cameraPosition, new Cesium.Cartesian3), new Cesium.Cartesian3);
     let up = Cesium.Cartesian3.normalize(this.cameraPosition, new Cesium.Cartesian3);
     let camera = new Cesium.Camera(this.viewer.scene);
     camera.position = this.cameraPosition;
     camera.direction = direction;
     camera.up = up;
     direction = camera.directionWC;
     up = camera.upWC;

     let rightWC = camera.rightWC;
     let cartesian3 = new Cesium.Cartesian3;
     let matrix3 = new Cesium.Matrix3;
     let quaternion = new Cesium.Quaternion;
     rightWC = Cesium.Cartesian3.negate(rightWC, cartesian3);

     Cesium.Matrix3.setColumn(matrix3, 0, rightWC, matrix3);
     Cesium.Matrix3.setColumn(matrix3, 1, up, matrix3);
     Cesium.Matrix3.setColumn(matrix3, 2, direction, matrix3);
     let orientation = Cesium.Quaternion.fromRotationMatrix(matrix3, quaternion);
     this.orientation = orientation;
     return orientation;
 }

 //创建视锥
 VideoShed3d.prototype.addCameraFrustum = function() {
     this.cameraFrustum = new Cesium.Primitive({
         geometryInstances: new Cesium.GeometryInstance({
             geometry: new Cesium.FrustumOutlineGeometry({
                 origin: this.cameraPosition,
                 orientation: this.orientation,
                 frustum: this.viewShadowMap._lightCamera.frustum,
                 _drawNearPlane: !0
             }),
             attributes: {
                 color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.YELLOW.withAlpha(0.5))
             }
         }),
         appearance: new Cesium.PerInstanceColorAppearance({
             translucent: !1,
             flat: !0
         }),
         asynchronous: !1,
         show: this.debugFrustum
     });
     this.viewer.scene.primitives.add(this.cameraFrustum);
 }

 //视椎体线是否可见
 VideoShed3d.prototype.setFrustumVisible = function(visible) {
     if (!this.cameraFrustum) return;
     this.debugFrustum = visible;
     this.cameraFrustum.show = this.debugFrustum;
 }

 //添加后处理程序
 VideoShed3d.prototype.addPostProcess = function() {
     let that = this;
     let bias = that.viewShadowMap._isPointLight ? that.viewShadowMap._pointBias : that.viewShadowMap._primitiveBias;
     this.postProcess = new Cesium.PostProcessStage({
         fragmentShader: videoShed3dShader,
         uniforms: {
             mixNum: function() {
                 return that.alpha;
             },
             stcshadow: function() {
                 return that.viewShadowMap._shadowMapTexture;
             },
             videoTexture: function() {
                 return that.videoTexture;
             },
             _shadowMap_matrix: function() {
                 return that.viewShadowMap._shadowMapMatrix;
             },
             shadowMap_lightPositionEC: function() {
                 return that.viewShadowMap._lightPositionEC;
             },
             shadowMap_texelSizeDepthBiasAndNormalShadingSmooth: function() {
                 let cartesian2 = new Cesium.Cartesian2;
                 cartesian2.x = 1 / that.viewShadowMap._textureSize.x;
                 cartesian2.y = 1 / that.viewShadowMap._textureSize.y;
                 return Cesium.Cartesian4.fromElements(cartesian2.x, cartesian2.y, bias.depthBias, bias.normalShadingSmooth, this.combinedUniforms1)
             },
             shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness: function() {
                 return Cesium.Cartesian4.fromElements(bias.normalOffsetScale, that.viewShadowMap._distance, that.viewShadowMap.maximumDistance, that.viewShadowMap._darkness, this.combinedUniforms2)
             }
         }
     });
     this.viewer.scene.postProcessStages.add(this.postProcess);
 }

 //资源销毁
 VideoShed3d.prototype.destroy = function() {
     this.viewer.scene.postProcessStages.remove(this.postProcess);
     this.viewer.scene.primitives.remove(this.cameraFrustum);
     this.activeVideoListener && this.viewer.clock.onTick.removeEventListener(this.activeVideoListener);
     this.activeVideoListener && delete this.activeVideoListener;
     delete this.postProcess;
     delete this.viewShadowMap;
     delete this.cameraPosition;
     delete this.position;
     delete this.alpha;
     delete this._camerafov;
     delete this._cameraPosition;
     delete this.videoTexture;
     delete this.cameraFrustum;
     delete this._debugFrustum;
     delete this._position;
     delete this._aspectRatio;
     delete this.url;
     delete this.orientation;
     this.viewer.scene.primitives.remove(this);
     delete this.viewer;
 }

 VideoShed3d.prototype.remove = function() {
     this.destroy();
 }
 export default VideoShed3d;