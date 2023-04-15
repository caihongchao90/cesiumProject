export default class PointCluster2 {
    constructor(viewer, data, options) {
        this.viewer = viewer;
        this.data = data;
        this.options = options;
        this.clusterColors = options.colors;
        this.DataLoadedEvent = new Cesium.Event();
        this.addDatasource();
    }
    addDatasource() {
        new Cesium.GeoJsonDataSource().load(this.data).then(geoJsonDataSource => {

            this.DataLoadedEvent.raiseEvent(geoJsonDataSource);
            geoJsonDataSource.clustering.enabled = true;
            geoJsonDataSource.clustering.pixelRange = this.options.pixelRange;
            geoJsonDataSource.clustering.minimumClusterSize = this.options.minimumClusterSize;

            this.setClusterEvent(geoJsonDataSource);
            //设置相机的图标
            geoJsonDataSource.entities.values.forEach(entity => {
                entity.billboard.image = this.options.billboardImg
                entity.type = "cluster2";
            });

            this.viewer.dataSources.add(geoJsonDataSource);
            this.geoJsonDataSource = geoJsonDataSource;

        })
    }
    flyTo(){
        this.DataLoadedEvent.addEventListener(dataSource => {
            this.viewer.flyTo(dataSource.entities.values);
            this.viewer.dataSources.remove(dataSource)
        })
    }

    setClusterEvent(geoJsonDataSource) {
        let clusterColors = this.clusterColors
        this.removeListener = geoJsonDataSource.clustering.clusterEvent.addEventListener(
            (clusteredEntities, cluster) => {
                cluster.billboard.show = true;
                cluster.label.show = false;
                cluster.billboard.id = cluster.label.id;
                cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
                cluster.billboard.image = this.getCluserImage(clusterColors,clusteredEntities.length);
            }
        );
    }

    //获取聚合图标
    getCluserImage(clusterColors,length) {
        var c = document.createElement("canvas");
        //一个数字大概12像素
        const d = (length + "").length * 12 + 50;
        c.width = c.height = d;
        let ctx = c.getContext("2d");
        //绘制大圆
        ctx.beginPath();
        ctx.globalAlpha = 0.5;

        ctx.fillStyle = this.getClusterColor(clusterColors,length); //绘制样式
        ctx.arc(d / 2, d / 2, d / 2 - 5, 0, 2 * Math.PI);
        ctx.fill();

        //绘制小圆
        ctx.beginPath();
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = this.getClusterColor(clusterColors,length); //绘制样式
        ctx.arc(d / 2, d / 2, d / 2 - 10, 0, 2 * Math.PI);
        ctx.fill();

        //绘制文本
        ctx.font = "20px 微软雅黑";
        ctx.globalAlpha = 1;
        ctx.fillStyle = "rgb(255,255,255)";
        let fd = length.toString().length * 12; //文字的长度
        const x = d / 2 - fd / 2;
        ctx.fillText(length, x, d / 2 + 10);
        return c;
    }

    //获取聚合颜色
    getClusterColor(clusterColors,length) {
        if (clusterColors){
            for (let i = 0; i < clusterColors.length; i++) {
                const element = clusterColors[i];
                if (length >= element.value)
                    return element.color;
            }
        }else return
    }

    remove() {
        let that = this
        let i = setInterval(()=>{
            if (that.geoJsonDataSource && that.DataLoadedEvent._listeners.length !=0 && that.removeListener){
                that.DataLoadedEvent._listeners.map(value => {
                    that.DataLoadedEvent.removeEventListener(value);
                })
                that.DataLoadedEvent.removeEventListener(that.removeListener);
                that.viewer.dataSources.remove(that.geoJsonDataSource)
                clearTimeout(i);
            }
        },1)
    }
}