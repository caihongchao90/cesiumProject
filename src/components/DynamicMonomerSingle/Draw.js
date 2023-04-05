export default class Draw {

  constructor(viewer, config) {
    const Cesium = window.Cesium
    /**cesium实例对象 */
    this.viewer = viewer
    /**绘制要素的相关配置
     * 默认配置
     * {
            borderColor: Cesium.Color.BLUE,  边框颜色
            borderWidth: 2, 边框宽度
            material: Cesium.Color.GREEN.withAlpha(0.5),填充材质
        }
     */
    this.config = config || {
      borderColor: Cesium.Color.BLUE,
      borderWidth: 2,
      material: Cesium.Color.GREEN.withAlpha(0.5),
    }
    /**存贮绘制的数据 坐标 */
    this.infoDetail = { point: [], line: [], rectangle: [], circle: [], planeSelf: [] }
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas)
    console.log("创建类")
  }
  /*******
   * @function: function
   * @return {*}
   * @author: xk
   * @description: 绘制点数据
   */
  drawPoint() {
    this.handler.destroy()

    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas)
    this.handler.setInputAction((click) => {
      /**点击位置笛卡尔坐标 */
      let cartesian = this.viewer.camera.pickEllipsoid(click.position, this.viewer.scene.globe.ellipsoid)
      /**笛卡尔转弧度坐标 */
      let cartographic = Cesium.Cartographic.fromCartesian(cartesian, this.viewer.scene.globe.ellipsoid, new Cesium.Cartographic())
      /**点击位置经度 */
      let lng = Cesium.Math.toDegrees(cartographic.longitude)
      /**点击位置维度 */
      let lat = Cesium.Math.toDegrees(cartographic.latitude)
      /**实体的唯一标注 */
      let id = new Date().getTime()
      this.viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(lng, lat, 0),
        name: 'point',
        id: id,
        point: {
          color: this.config.material,
          pixelSize: 12,
          outlineColor: this.config.borderColor,
          outlineWidth: this.config.borderWidth
        }
      })
      this.infoDetail.point.push({ id: id, position: [lng, lat] })

    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    this.handler.setInputAction((click) => {
      this.handler.destroy();
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  }

  /*******
   * @function: function
   * @description: 绘制矩形区域
   * @return {*}
   * @author: xk
   */
  drawRectangle() {
    this.handler.destroy()
    /**
     * 矩形四点坐标
     */
    let westSouthEastNorth = []
    /**实体的唯一标注 */
    let id = null
    /**地图点击对象 */
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas)

    this.handler.setInputAction((click) => {
      /**点击位置笛卡尔坐标 */
      let cartesian = this.viewer.camera.pickEllipsoid(click.position, this.viewer.scene.globe.ellipsoid)
      /**笛卡尔转弧度坐标 */
      let cartographic = Cesium.Cartographic.fromCartesian(cartesian, this.viewer.scene.globe.ellipsoid, new Cesium.Cartographic())
      /**点击位置经度 */
      let lng1 = Cesium.Math.toDegrees(cartographic.longitude)
      /**点击位置维度 */
      let lat1 = Cesium.Math.toDegrees(cartographic.latitude)
      /**边框坐标 */
      westSouthEastNorth = [lng1, lat1]

      id = new Date().getTime()
      if (westSouthEastNorth) {
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
      }

      /**面实例对象 */
      let polygons = this.viewer.entities.add({
        name: 'rectangle',
        id: id,
        polygon: {
          hierarchy: new Cesium.CallbackProperty(function () {
            return {
              positions: Cesium.Cartesian3.fromDegreesArray(westSouthEastNorth)
            }
          }),
          height: 0,
          // 填充的颜色，withAlpha透明度
          material: this.config.material,
          // 是否被提供的材质填充
          fill: true,
          // 是否显示
          show: true,
        },
        polyline: {
          positions: new Cesium.CallbackProperty(function () { return Cesium.Cartesian3.fromDegreesArray(westSouthEastNorth) }),
          material: this.config.borderColor,
          width: this.config.borderWidth,
          zIndex: 1
        }
      })
      console.log("运行到此没问题",polygons)
      this.handler.setInputAction((move) => {
        let cartesian = this.viewer.camera.pickEllipsoid(move.endPosition, this.viewer.scene.globe.ellipsoid)
        let cartographic = Cesium.Cartographic.fromCartesian(cartesian, this.viewer.scene.globe.ellipsoid, new Cesium.Cartographic())
        let lng = Cesium.Math.toDegrees(cartographic.longitude)
        let lat = Cesium.Math.toDegrees(cartographic.latitude)

        westSouthEastNorth = [lng1, lat1, lng1, lat, lng, lat, lng, lat1, lng1, lat1]


      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)


    this.handler.setInputAction(() => {
      this.handler.destroy();
      this.infoDetail.rectangle.push({ id: id, position: westSouthEastNorth })
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  }
  /*******
   * @function: function
   * @description: 绘制圆形区域
   * @return {*}
   * @author: xk
   */
  drawCircle() {
    this.handler.destroy()
    /**实体的唯一标注 */
    let id = null

    /**圆半径 */
    let radius = 0
    /**圆心 */
    let lngLat = []
    /**鼠标事件 */
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas)
    this.handler.setInputAction((click) => {
      id = new Date().getTime()
      let cartesian = this.viewer.camera.pickEllipsoid(click.position, this.viewer.scene.globe.ellipsoid)
      let cartographic = Cesium.Cartographic.fromCartesian(cartesian, this.viewer.scene.globe.ellipsoid, new Cesium.Cartographic())
      let lng = Cesium.Math.toDegrees(cartographic.longitude)
      let lat = Cesium.Math.toDegrees(cartographic.latitude)
      lngLat = [lng, lat]
      let entity = this.viewer.entities.add({
        position: new Cesium.CallbackProperty(function () { return new Cesium.Cartesian3.fromDegrees(...lngLat, 0) }, false),
        name: 'circle',
        id: id,
        ellipse: {
          height: 0,
          outline: true,
          material: this.config.material,
          outlineColor: this.config.borderColor,
          outlineWidth: this.config.borderWidth
        }
      })
      entity.ellipse.semiMajorAxis = new Cesium.CallbackProperty(function () { return radius }, false)
      entity.ellipse.semiMinorAxis = new Cesium.CallbackProperty(function () { return radius }, false)

      if (lngLat) {
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
      }
      this.handler.setInputAction((move) => {
        let cartesian2 = this.viewer.camera.pickEllipsoid(move.endPosition, this.viewer.scene.globe.ellipsoid)
        radius = Cesium.Cartesian3.distance(cartesian, cartesian2)
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    this.handler.setInputAction(() => {

      this.infoDetail.circle.push({ id: id, center: lngLat, radius: radius })
      this.handler.destroy();
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)


  }
  /*******
   * @function: function
   * @description: 自定义区域绘制
   * @return {*}
   * @author: xk
   */
  drawPlane() {
    this.handler.destroy()
    /**实体的唯一标注 */
    let id = new Date().getTime()
    /**记录拐点坐标 */
    let positions = [],
      /**记录返回结果 */
      codeInfo = [],
      /**面的hierarchy属性 */
      polygon = new Cesium.PolygonHierarchy(),
      _polygonEntity = new Cesium.Entity(),
      /**面对象配置 */
      polyObj = null
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    // left
    this.handler.setInputAction((movement) => {
      let cartesian = this.viewer.camera.pickEllipsoid(movement.position, this.viewer.scene.globe.ellipsoid);
      let cartographic = Cesium.Cartographic.fromCartesian(cartesian, this.viewer.scene.globe.ellipsoid, new Cesium.Cartographic())
      let lng = Cesium.Math.toDegrees(cartographic.longitude)
      let lat = Cesium.Math.toDegrees(cartographic.latitude)


      if (cartesian && cartesian.x) {
        if (positions.length == 0) {
          positions.push(cartesian.clone());
        }
        codeInfo.push([lng, lat])
        positions.push(cartesian.clone());
        polygon.positions.push(cartesian.clone())
        if (!polyObj) {
          _polygonEntity.polyline = {
            width: this.config.borderWidth,
            material: this.config.borderColor,
            clampToGround: false
          }
          _polygonEntity.polyline.positions = new Cesium.CallbackProperty(function () {
            return positions
          }, false)

          _polygonEntity.polygon = {

            hierarchy: new Cesium.CallbackProperty(function () {
              return polygon
            }, false),

            material: this.config.material,
            clampToGround: false
          }
          _polygonEntity.name = 'planeSelf'

          _polygonEntity._id = id
          polyObj = this.viewer.entities.add(_polygonEntity)
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    // mouse
    this.handler.setInputAction((movement) => {
      let cartesian = this.viewer.camera.pickEllipsoid(movement.endPosition, this.viewer.scene.globe.ellipsoid);
      let cartographic = Cesium.Cartographic.fromCartesian(cartesian, this.viewer.scene.globe.ellipsoid, new Cesium.Cartographic())
      let lng = Cesium.Math.toDegrees(cartographic.longitude)
      let lat = Cesium.Math.toDegrees(cartographic.latitude)

      if (positions.length >= 0) {
        if (cartesian && cartesian.x) {
          positions.pop()
          positions.push(cartesian);
          polygon.positions.pop()
          polygon.positions.push(cartesian);
          codeInfo.pop()
          codeInfo.push([lng, lat]);
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    // right
    this.handler.setInputAction((movement) => {
      this.infoDetail.planeSelf.push({ id: id, positions: codeInfo })

      this.handler.destroy();
      positions.push(positions[0]);
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

  }

  /*******
   * @function: function
   * @return {*}
   * @author: xk
   * @description: 绘制线段
   */
  drawLine() {
    this.handler.destroy()
    /**实体的唯一标注 */
    let id = null
    /**记录拐点坐标 */
    let positions = [],
      /**记录返回结果 */
      codeInfo = [],
      /**面的hierarchy属性 */
      polygon = new Cesium.PolygonHierarchy(),
      _polygonEntity = new Cesium.Entity(),
      /**面对象配置 */
      polyObj = null
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    // left
    this.handler.setInputAction((movement) => {
      id = new Date().getTime()
      let cartesian = this.viewer.camera.pickEllipsoid(movement.position, this.viewer.scene.globe.ellipsoid);
      let cartographic = Cesium.Cartographic.fromCartesian(cartesian, this.viewer.scene.globe.ellipsoid, new Cesium.Cartographic())
      let lng = Cesium.Math.toDegrees(cartographic.longitude)
      let lat = Cesium.Math.toDegrees(cartographic.latitude)

      if (cartesian && cartesian.x) {
        if (positions.length == 0) {
          positions.push(cartesian.clone());
        }
        codeInfo.push([lng, lat])
        positions.push(cartesian.clone());
        polygon.positions.push(cartesian.clone())
        if (!polyObj) {
          _polygonEntity.polyline = {
            width: this.config.borderWidth,
            material: this.config.borderColor,
            clampToGround: false
          }
          _polygonEntity.polyline.positions = new Cesium.CallbackProperty(function () {
            return positions
          }, false)
          _polygonEntity.name = 'line'
          _polygonEntity._id = id

          polyObj = this.viewer.entities.add(_polygonEntity)
        }
      }

    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    // mouse
    this.handler.setInputAction((movement) => {
      let cartesian = this.viewer.camera.pickEllipsoid(movement.endPosition, this.viewer.scene.globe.ellipsoid);
      let cartographic = Cesium.Cartographic.fromCartesian(cartesian, this.viewer.scene.globe.ellipsoid, new Cesium.Cartographic())
      let lng = Cesium.Math.toDegrees(cartographic.longitude)
      let lat = Cesium.Math.toDegrees(cartographic.latitude)

      if (positions.length >= 0) {
        if (cartesian && cartesian.x) {
          positions.pop()
          positions.push(cartesian);
          codeInfo.pop()
          codeInfo.push([lng, lat]);
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    // right
    this.handler.setInputAction((movement) => {
      this.infoDetail.line.push({ id: id, positions: codeInfo })
      this.handler.destroy();
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  }
  /*******
   * @function: function
   * @description: 移除实体对象
   * @return {*}
   * @author: xk
   */
  removeEntity() {
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas)
    this.handler.setInputAction((move) => {
      /**实体对象信息  {id：entities，primitive：。。} */
      let pick = this.viewer.scene.pick(move.endPosition);

      if (pick && pick.id && pick.id.id) {
        document.body.style.cursor = "pointer";
        this.handler.setInputAction((click) => {
          let newPoint
          switch (pick.id.name) {

            case 'point':
              /**删除某一条数据 */
              newPoint = this.infoDetail.point.filter(item => item.id != pick.id._id)
              this.infoDetail.point = newPoint
              break
            case 'line':
              /**删除某一条数据 */
              newPoint = this.infoDetail.line.filter(item => item.id != pick.id._id)
              this.infoDetail.line = newPoint
              break
            case 'rectangle':
              /**删除某一条数据 */
              newPoint = this.infoDetail.rectangle.filter(item => item.id != pick.id._id)
              this.infoDetail.rectangle = newPoint
              break

            case 'planeSelf':
              /**删除某一条数据 */
              newPoint = this.infoDetail.planeSelf.filter(item => item.id != pick.id._id)
              this.infoDetail.planeSelf = newPoint
              break
            case 'circle':
              /**删除某一条数据 */
              newPoint = this.infoDetail.circle.filter(item => item.id != pick.id._id)
              this.infoDetail.circle = newPoint
              break
            default: break
          }
          this.viewer.entities.remove(pick.id)
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

      } else {

        document.body.style = "cursor: default;";

      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
  }
  /*******
   * @function: function
   * @return {*}
   * @author: xk
   * @description: 返回绘制数据
   */
  backInfoDetail() {
    return this.infoDetail
  }




}
