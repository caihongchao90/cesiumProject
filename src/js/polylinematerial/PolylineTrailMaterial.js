//尾迹线材质类
export default class PolylineTrailMaterialProperty {
    constructor(options) {
        options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT);
        this._definitionChanged = new Cesium.Event();
        this.colorSubscription = undefined;
        this.speed = options.speed || 6 * Math.random(); //速度
        this.color = options.color || Cesium.Color.RED; //颜色
        this.percent = options.percent || 0.1; //百分比
        this.gradient = options.gradient || 0.01; //渐变 
    }
}

Object.defineProperties(PolylineTrailMaterialProperty.prototype, {
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

PolylineTrailMaterialProperty.prototype.getType = function(time) {
    return 'PolylineTrail';
}

PolylineTrailMaterialProperty.prototype.getValue = function(time, result) {
    if (!Cesium.defined(result)) {
        result = {};
    }
    result.color = Cesium.Property.getValueOrClonedDefault(this.color, time, Cesium.Color.WHITE, result.color);
    result.speed = this.speed;
    result.gradient = this.gradient;
    result.percent = this.percent;
    return result;
}

PolylineTrailMaterialProperty.prototype.equals = function(other) {
    return this === other ||
        (other instanceof PolylineTrailMaterialProperty &&
            this.speed == other.speed &&
            Cesium.Property.equals(this.color, other.color))
}
Cesium.Material.PolylineTrailType = 'PolylineTrail';
Cesium.Material.PolylineTrailSource = `uniform vec4 color;
uniform float speed;
uniform float percent;
uniform float gradient;

czm_material czm_getMaterial(czm_materialInput materialInput){
    czm_material material = czm_getDefaultMaterial(materialInput);
    vec2 st = materialInput.st;
    float t =fract(czm_frameNumber * speed / 1000.0);
    t *= (1.0 + percent);
    float alpha = smoothstep(t- percent, t, st.s) * step(-t, -st.s);
    alpha += gradient;
    material.diffuse = color.rgb;
    material.alpha = alpha;
    return material;
}`

Cesium.Material._materialCache.addMaterial(Cesium.Material.PolylineTrailType, {
    fabric: {
        type: Cesium.Material.PolylineTrailType,
        uniforms: {
            color: new Cesium.Color(1.0, 0.0, 0.0, 0.5),
            transparent: true,
            speed: 0,
            gradient: 0.01,
            percent: 0.1
        },
        source: Cesium.Material.PolylineTrailSource
    },
    translucent: function(material) {
        return true;
    }
});