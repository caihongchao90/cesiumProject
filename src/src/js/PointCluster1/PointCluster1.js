export default class PointCluster1 {
  constructor(viewer, data, options) {
    this.viewer = viewer;
    this.data = data;
    this.options = options;
    this.DataLoadedEvent = new Cesium.Event();
    this.addDatasource();
  }

  addDatasource() {
    new Cesium.GeoJsonDataSource().load(this.data).then(geoJsonDataSource => {

      this.DataLoadedEvent.raiseEvent(geoJsonDataSource);
      geoJsonDataSource.clustering.enabled = true;
      geoJsonDataSource.clustering.pixelRange = this.options.pixelRange;
      geoJsonDataSource.clustering.minimumClusterSize = this.options.minimumClusterSize;

      this.#setClusterEvent(geoJsonDataSource);
      //设置相机的图标
      geoJsonDataSource.entities.values.forEach(entity => {
        entity.billboard.image = this.options.billboardImg //'static/images/marker/bluecamera.png';
        entity.type = "cluster1";
      });
      this.viewer.dataSources.add(geoJsonDataSource);
      this.geoJsonDataSource = geoJsonDataSource;
    })
  }
  flyTo(){
    this.DataLoadedEvent.addEventListener(dataSource => {
      this.viewer.flyTo(dataSource.entities.values);
    })
  }
  #setClusterEvent(geoJsonDataSource) {
    this.removeListener = geoJsonDataSource.clustering.clusterEvent.addEventListener(
      (clusteredEntities, cluster) => {
        cluster.billboard.show = true;
        cluster.label.show = false;
        cluster.billboard.id = cluster.label.id;
        cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;

        if (clusteredEntities.length >= 300) {
          cluster.billboard.image = this.options.clusterImage + "/300+.png";
        } else if (clusteredEntities.length >= 150) {
          cluster.billboard.image = this.options.clusterImage + "/150+.png";
        } else if (clusteredEntities.length >= 90) {
          cluster.billboard.image = this.options.clusterImage + "/90+.png";
        } else if (clusteredEntities.length >= 30) {
          cluster.billboard.image = this.options.clusterImage + "/30+.png";
        } else if (clusteredEntities.length > 10) {
          cluster.billboard.image = this.options.clusterImage + "/10+.png";
        } else {
          cluster.billboard.image = this.options.clusterImage + "/" + clusteredEntities.length + ".png";
        }
      }
    );
  }


  remove() {
    if (!this.geoJsonDataSource){
      throw new Error('点未创建完成，不可以删除');
      return;
    }
    if (this.DataLoadedEvent._listeners.length !=0){
      this.DataLoadedEvent._listeners.map(value => {
        this.DataLoadedEvent.removeEventListener(value);
      })
    }
    this.viewer.dataSources.remove(this.geoJsonDataSource)

  }
}