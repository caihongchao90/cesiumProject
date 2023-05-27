//作者：蔡宏超
//最后修改日期：2023.03.28
//功能：添加水面，cesium自带效果，并不是很好


export default class WaterFace{
  constructor(viewer,waterFaceData,height=0,options={}) {
    if (!viewer||!waterFaceData){
      throw new Error('WaterFace Parameter is missing!')
    }
    this._viewer = viewer
    this.height = height
    this.waterFaceData = waterFaceData
    this.waterPrimitive = undefined
    this.options={
      baseWaterColor: new Cesium.Color(64 / 255.0, 157 / 255.0, 253 / 255.0, 0.5), // 水的基本颜色
      frequency: 1000.0,
      animationSpeed: 0.01, // 水的流速
      amplitude: 10, // 水波纹振幅
      specularIntensity: 0.5, // 镜面反射强度
    }
    options.baseWaterColor?this.options.baseWaterColor=options.baseWaterColor:this.options.baseWaterColor=new Cesium.Color(64 / 255.0, 157 / 255.0, 253 / 255.0, 0.5)
    options.frequency?this.options.frequency=options.frequency:this.options.frequency=1000.0
    options.animationSpeed?this.options.animationSpeed=options.animationSpeed:this.options.animationSpeed=0.01
    options.amplitude?this.options.amplitude=options.amplitude:this.options.amplitude=10
    options.specularIntensity?this.options.specularIntensity=options.specularIntensity:this.options.specularIntensity=0.5
    // this.options = options
    console.log(this.options)
    this.drawWater()
  }
  drawWater() {
    this._viewer.scene.globe.depthTestAgainstTerrain = false;
    let waterPrimitive = new Cesium.Primitive({
      show: true,// 默认隐藏
      allowPicking: false,
      geometryInstances: new Cesium.GeometryInstance({
        geometry: new Cesium.PolygonGeometry({
          polygonHierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(this.waterFaceData)),
          height:this.height,
        })
      }),
      // 可以设置内置的水面shader
      appearance: new Cesium.EllipsoidSurfaceAppearance({
        material: new Cesium.Material({
          fabric: {
            type: 'Water',
            uniforms: {
              baseWaterColor: this.options.baseWaterColor,
              normalMap: './image/water.jpg',
              frequency: this.options.frequency,
              animationSpeed: this.options.animationSpeed, // 水的流速
              amplitude: this.options.amplitude, // 水波纹振幅
              specularIntensity: this.options.specularIntensity, // 镜面反射强度
            }
          }
        }),
      }),
    });
    this.waterPrimitive = this._viewer.scene.primitives.add(waterPrimitive);
  }
  flyTo(){
    console.log("flyto",(this.waterFaceData.length))
    let vertices = []
    let j=0,k=0
    for (let i=0;i<(this.waterFaceData.length)/2*3;i++){
      if (j === 2){
        vertices[i] = this.height
        j = 0
      }else {
        vertices[i] = this.waterFaceData[k]
        j++
        k++
      }
    }
    //先找到包围盒，再根据包围盒flyto到primitives位置，其中高度是自己调的参数，因为半径也是以°为单位
    let boundingSphere = Cesium.BoundingSphere.fromVertices(vertices)
    this._viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(boundingSphere.center.x, boundingSphere.center.y, boundingSphere.center.z+boundingSphere.radius*200000),
      orientation: {
        heading: Cesium.Math.toRadians(180.0), // 方向
        pitch: Cesium.Math.toRadians(-90), // 倾斜角度
        roll: 0.0 // 旋转角度
      },
      duration :1,
    })
  }
  destroy(){
    if (this.waterPrimitive){
      this._viewer.scene.primitives.remove(this.waterPrimitive);
      this.waterPrimitive.destroy();
    }
    this._viewer = undefined
    this.height = undefined
    this.waterFaceData = undefined
  }
}
