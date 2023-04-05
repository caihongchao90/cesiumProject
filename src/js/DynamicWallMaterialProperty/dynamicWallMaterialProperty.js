/**
 * @description:动态立体墙材质
 * @date: 2023-03-14
 * @author:蔡宏超
 * @detail:只需要改动着色器代码就可以调出不同的效果
 */


//动态墙材质
export default class DynamicWallMaterialProperty {
  // 默认参数设置
  constructor(options) {
    // options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT)
    this._definitionChanged = new Cesium.Event();
    this._color = undefined;
    this._colorSubscription = undefined;
    this.color = options.color;
    this.duration = options.duration;
    this.trailImage = options.trailImage;
    this._time = (new Date()).getTime();
  }
}
Object.defineProperties(DynamicWallMaterialProperty.prototype, {
  isConstant: {
    get: function() {
      return false;
    }
  },
  definitionChanged: {
    get: function() {
      return this._definitionChanged;
    }
  },
  color: Cesium.createPropertyDescriptor('color')
});
DynamicWallMaterialProperty.prototype.getType = function() {
  return 'DynamicWall';
};
DynamicWallMaterialProperty.prototype.getValue = function(time, result) {
  if (!Cesium.defined(result)) {
    result = {};
  }
  result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
  if (this.trailImage) {
    result.image = this.trailImage;
  } else {
    result.image = Cesium.Material.DynamicWallImage
  }

  if (this.duration) {
    result.time = (((new Date()).getTime() - this._time) % this.duration) / this.duration;
  }
  return result;
};
DynamicWallMaterialProperty.prototype.equals = function(other) {
  return this === other ||
    (other instanceof DynamicWallMaterialProperty &&
      Cesium.Property.equals(this._color, other._color))
};
Cesium.DynamicWallMaterialProperty = DynamicWallMaterialProperty;
Cesium.Material.DynamicWallType = 'DynamicWall';
Cesium.Material.DynamicWallImage = './color.png';
Cesium.Material.DynamicWallSource =
// 着色器代码
  'czm_material czm_getMaterial(czm_materialInput materialInput)\n\
                            {\n\
                              czm_material material = czm_getDefaultMaterial(materialInput);\n\
                              vec2 st = materialInput.st;\n\
                              vec4 colorImage = texture(image, vec2(fract(st.t - time), st.t));\n\n\
                              material.alpha = colorImage.a * color.a;\n\
                              material.diffuse = (colorImage.rgb+color.rgb)/2.0;\n\
                              return material;\n\
                            }'


// 'czm_material czm_getMaterial(czm_materialInput materialInput)\n\
//                            {\n\
//                              czm_material material = czm_getDefaultMaterial(materialInput);\n\
//                              vec2 st = materialInput.st;\n\
//                              vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t));\n\
//                              material.alpha = colorImage.a * color.a;\n\
//                              material.diffuse = (colorImage.rgb+color.rgb)/2.0;\n\
//                              return material;\n\
//                            }'

Cesium.Material._materialCache.addMaterial(Cesium.Material.DynamicWallType, {
  fabric: {
    type: Cesium.Material.DynamicWallType,
    uniforms: {
      color: new Cesium.Color(1.0, 1.0, 1.0, 1),
      image: Cesium.Material.DynamicWallImage,
      time: 0
    },
    source: Cesium.Material.DynamicWallSource
  },
  translucent: function() {
    return true;
  }
});
Cesium.DynamicWallMaterialProperty = DynamicWallMaterialProperty
