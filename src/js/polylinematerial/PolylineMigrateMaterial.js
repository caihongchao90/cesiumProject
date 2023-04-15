 //迁徙线
 export default class PolylineMigrateMaterialProperty {
     constructor(options) {
         options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT);
         this._definitionChanged = new Cesium.Event();
         this._color = undefined;
         this._colorSubscription = undefined;
         this.color = options.color;
         this.duration = options.duration;
         this.url = options.url;
         this._time = performance.now();
     }
 }

 Object.defineProperties(PolylineMigrateMaterialProperty.prototype, {
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

 PolylineMigrateMaterialProperty.prototype.getType = function(time) {
     return 'PolylineMigrate';
 }

 PolylineMigrateMaterialProperty.prototype.getValue = function(time, result) {
     if (!Cesium.defined(result)) {
         result = {};
     }
     result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
     result.image = this.url;
     result.time = ((performance.now() - this._time) % this.duration) / this.duration;
     return result;
 }

 PolylineMigrateMaterialProperty.prototype.equals = function(other) {
     return this === other ||
         (other instanceof PolylineMigrateMaterialProperty &&
             Cesium.Property.equals(this._color, other._color) &&
             this.duration == other.duration)
 }

 Cesium.Material.PolylineMigrateType = 'PolylineMigrate';
 Cesium.Material.PolylineMigrateSource =
     "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
       {\n\
             czm_material material = czm_getDefaultMaterial(materialInput);\n\
             vec2 st = materialInput.st;\n\
             vec4 colorImage = texture(image, vec2(fract(st.s - time), st.t));\n\
             material.alpha = colorImage.a * color.a;\n\
             material.diffuse = color.rgb*1.5;\n\
             return material;\n\
     }";
 Cesium.Material._materialCache.addMaterial(Cesium.Material.PolylineMigrateType, {

     fabric: {
         type: Cesium.Material.PolylineMigrateType,
         uniforms: {
             color: new Cesium.Color(1.0, 0.0, 0.0, 0.5),
             image: "",
             transparent: true,
             time: 20
         },
         source: Cesium.Material.PolylineMigrateSource
     },

     translucent: function(material) {
         return true;
     }

 });