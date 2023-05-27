 class VideoPlane {
     constructor(viewer, position, style) {
         this.viewer = viewer;
         this.position = position;
         this.videoElement = style.videoElement;

         this.rotation = style.rotation || {
             heading: 0.0,
             pitch: 0.0,
             roll: 0.0
         }

         this.fov = style.fov || 10.0;
         this.near = style.near || 0.1;
         this.far = style.far || 100;
         this.aspectRatio = style.aspectRatio || 1;
         this.debugFrustum = Cesium.defaultValue(style.debugFrustum, true);
         this.stRotation = style.stRotation || 0;
         this.createVideoFrustum(this.position, this.videoElement);
         this.createVideoPolygon();
     }

     createVideoFrustum(position) {
         let hpr = new Cesium.HeadingPitchRoll(
             Cesium.Math.toRadians(this.rotation.heading),
             Cesium.Math.toRadians(this.rotation.pitch),
             Cesium.Math.toRadians(this.rotation.roll)
         );

         //方向
         this.orientation = Cesium.Transforms.headingPitchRollQuaternion(
             position,
             hpr
         );

         //视椎体
         this.frustum = new Cesium.PerspectiveFrustum({
             fov: Cesium.Math.toRadians(this.fov),
             aspectRatio: this.aspectRatio,
             near: this.near,
             far: this.far
         })


         let frustumOutlineGeometry = this.createFrustumOutlineGeometry();
         this.outlineFrustum = this.addOutlineFrustum(frustumOutlineGeometry);
         if (this.debugFrustum) {
             this.viewer.scene.primitives.add(this.outlineFrustum);
         }

         let plane = new Float64Array(3 * 4 * 2);
         Cesium.FrustumGeometry._computeNearFarPlanes(frustumOutlineGeometry._origin, frustumOutlineGeometry._orientation, frustumOutlineGeometry._frustumType, frustumOutlineGeometry._frustum, plane);
         let hierarchy = [];
         for (let i = 12; i < 24; i += 3) {
             hierarchy.push(new Cesium.Cartesian3(plane[i], plane[i + 1], plane[i + 2]));
         }
         this.hierarchy = hierarchy;
     }

     createFrustumOutlineGeometry() {
         return new Cesium.FrustumOutlineGeometry({
             origin: this.position,
             orientation: this.orientation,
             frustum: this.frustum,
             _drawNearPlane: !0
         });
     }

     //边线
     addOutlineFrustum(geometry) {
         return new Cesium.Primitive({
             geometryInstances: new Cesium.GeometryInstance({
                 geometry: geometry,
                 attributes: {
                     color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.BLUE)
                 }
             }),
             appearance: new Cesium.PerInstanceColorAppearance({
                 translucent: true,
                 flat: !0
             }),
             asynchronous: !1,
             show: true
         });
     }

     getStyle() {
         return {
             fov: this.fov,
             near: this.near,
             far: this.far,
             aspectRatio: this.aspectRatio,
             rotation: this.rotation,
             debugFrustum: this.debugFrustum,
             stRotation: this.stRotation
         }
     }

     updateStyle(style) {
         this.rotation = style.rotation;
         this.fov = style.fov || 10.0;
         this.near = style.near || 0.1;
         this.far = style.far || 100;
         this.aspectRatio = style.aspectRatio || 1;
         this.debugFrustum = style.debugFrustum;
         this.stRotation = style.stRotation || 0;
         this.removeFrustunPrimitive();
         this.createVideoFrustum(this.position);
     }

     createVideoPolygon() {
         this.videoEntity = new Cesium.Entity({
             polygon: {
                 perPositionHeight: true,
                 hierarchy: new Cesium.CallbackProperty(e => {
                     return new Cesium.PolygonHierarchy(this.hierarchy);
                 }, false),
                 material: this.videoElement,
                 stRotation: new Cesium.CallbackProperty(e => {
                     return Cesium.Math.toRadians(this.stRotation);
                 }, false)
             }
         })

         this.viewer.entities.add(this.videoEntity);
     }

     removeFrustunPrimitive() {
         if (!this.outlineFrustum) return;
         this.viewer.scene.primitives.remove(this.outlineFrustum);
         this.outlineFrustum = undefined;
     }

     remove() {
         this.removeFrustunPrimitive();
         if (this.videoEntity) {
             this.viewer.entities.remove(this.videoEntity);
             this.videoEntity = undefined;
         }
     }
 }

 export default VideoPlane