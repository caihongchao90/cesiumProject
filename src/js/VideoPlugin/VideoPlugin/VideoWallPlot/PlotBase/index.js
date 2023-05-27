 // 所有VideoWall标绘类的基类 
 export default class VideoWallPlotBase {
     constructor(viewer, geoFeature) {
         this.viewer = viewer;
         this.properties = geoFeature.properties; //相关属性 如plotCode  plotType
         this.properties.plotBase = "VideoWallPlot"; //基础类型

         this.geometry = geoFeature.geometry;
         this.coordinates = geoFeature.geometry.coordinates;
         this.generatePositions();
     }

     //构造坐标点串
     generatePositions() {
         this.positions = [];
         let coordinates;
         switch (this.geometry.type) {
             case "LineString":
                 coordinates = this.coordinates;
                 break;
             case "Polygon":
                 coordinates = this.coordinates[0];
                 break;
         }
         //从经纬度转为笛卡尔坐标
         coordinates.forEach(item => {
             this.positions.push(Cesium.Cartesian3.fromDegrees(item[0], item[1], item[2]));
         })
     }

     //设置坐标点串
     setPositions(value) {
         this.positions = value ? value : [];
         this.coordinates = [];
         switch (this.geometry.type) {
             case "LineString":
                 this.setLineStringCoordinates();
                 break;
             case "Polygon":
                 this.setPolygonCoordinates();
                 break;
         }

         if (this.updatePositionAction) {
             this.updatePositionAction();
         }
     }

     //设置线的坐标
     setLineStringCoordinates() {
         this.positions.forEach(item => {
             const c = Cesium.Cartographic.fromCartesian(item);
             const coordinate = [Cesium.Math.toDegrees(c.longitude), Cesium.Math.toDegrees(c.latitude), c.height];
             this.coordinates.push(coordinate);
         })
     }

     //设置面的坐标
     setPolygonCoordinates() {
         this.coordinates.push([]);
         this.positions.forEach(item => {
             const c = Cesium.Cartographic.fromCartesian(item);
             const coordinate = [Cesium.Math.toDegrees(c.longitude), Cesium.Math.toDegrees(c.latitude), c.height];
             this.coordinates[0].push(coordinate);
         })
     }

     //面对象贴模型会将坐标串z值设置为0  所以拷贝一个坐标串
     getPositions() {
         let positions = [];
         let coordinates;
         switch (this.geometry.type) {
             case "LineString":
                 coordinates = this.coordinates;
                 break;
             case "Polygon":
                 coordinates = this.coordinates[0];
                 break;
         }
         //从经纬度转为笛卡尔坐标
         coordinates.forEach(item => {
             positions.push(Cesium.Cartesian3.fromDegrees(item[0], item[1], item[2]));
         })
         return positions;
     }

     getPositionCount() {
         return this.positions.length;
     }

     setSelected(selected) {

     }

     //开启编辑模式
     openEditMode(isEdit) {

     }

     //删除标绘
     remove() {

     }
 }