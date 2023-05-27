<template>
    <div id="cesiumContainer"></div>
</template>

<script>
let viewer, window
import MultiFieldAdaptWindow from './Map3dWindow/MultiFieldAdaptWindow/index.js';
import PopupWindow1 from './Map3dWindow/PopupWindow1/index.js'
import PopupWindow2 from './Map3dWindow/PopupWindow2/index.js'
import LeafletPopup from './Map3dWindow/LeafletPopup/index.js'
import DeviceStatusWindow from './Map3dWindow/DeviceStatus/index.js'
export default {
    name: "Map3dWindow",
    mounted() {
        viewer = new Cesium.Viewer("cesiumContainer", {
            shouldAnimate: false,
            animation: false, // 是否创建动画小器件，左下角仪表
            // baseLayerPicker: false, // 是否显示图层选择器
            fullscreenButton: false, // 是否显示全屏按钮
            geocoder: false, // 是否显示geocoder小器件，右上角查询按钮
            homeButton: false, // 是否显示Home按钮
            infoBox: false, // 是否显示信息框
            sceneModePicker: false, // 是否显示3D/2D选择器
            selectionIndicator: false, // 是否显示选取指示器组件
            timeline: false, // 是否显示时间轴
            navigationHelpButton: false, // 是否显示右上角的帮助按钮

        });
        viewer.imageryLayers.remove(viewer.imageryLayers.get(0));
        var arcGisProvider = new Cesium.ArcGisMapServerImageryProvider({
            url: 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer',
            enablePickFeatures: false
        });
        viewer.imageryLayers.addImageryProvider(arcGisProvider);
        let palaceTileset = new Cesium.Cesium3DTileset({
            url: 'http://211.149.185.229:8081/data/offset_3dtiles/tileset.json',
        });
        let that = this
        palaceTileset.readyPromise.then(function (palaceTileset) {
            viewer.scene.primitives.add(palaceTileset);
            that.setTilesetHeight(palaceTileset)
            viewer.zoomTo(palaceTileset)
        });

        this.initMonitors(viewer)
        viewer.selectedEntityChanged.addEventListener(e => {
            this.selectedEntityChanged(e);
        });
    },
    methods: {
        //初始化点位
        initMonitors(viewer) {
            let p1 = Cesium.Cartesian3.fromDegrees(106.45387638471723, 29.504594313681245, 9.691983084673709);
            let p2 = Cesium.Cartesian3.fromDegrees(106.45525698570214, 29.504881385813373, 10.24838062187865);
            let p3 = Cesium.Cartesian3.fromDegrees(106.45661379889214, 29.504978803966548, 9.584467686712157);
            let monitors = [{
                name: "电缆室",
                status: false,
                num: "camera3033232",
                title: "监控设备",
                position: p1,
            }, {
                name: "过滤处理室",
                status: true,
                title: "监控设备",
                num: "camera5054232",
                position: p2,
            }, {
                name: "机房F",
                title: "监控设备",
                status: true,
                num: "camera6036232",
                position: p3,
            }];

            monitors.forEach(item => {
                viewer.entities.add({
                    position: item.position,
                    info: item,
                    billboard: {
                        image: './image/marker/bluecamera.png',
                        scaleByDistance: new Cesium.NearFarScalar(500, 1, 1200, 0.8),
                        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 10000),
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM
                    }
                })
            })
        },

        //实体选中事件
        selectedEntityChanged(e) {
            if (!e) return;
            if (window) {
                window.close();
                window = undefined;
            }
            window = new DeviceStatusWindow(viewer, e.position._value, e.info);
        },
        //调整3dtiles的高度位置
        setTilesetHeight(tileset) {
            var cartographic = Cesium.Cartographic.fromCartesian(
                tileset.boundingSphere.center
            );
            var surface = Cesium.Cartesian3.fromRadians(
                cartographic.longitude,
                cartographic.latitude,
                cartographic.height
            );
            var offset = Cesium.Cartesian3.fromRadians(
                cartographic.longitude,
                cartographic.latitude, 55
            );
            var translation = Cesium.Cartesian3.subtract(
                offset,
                surface,
                new Cesium.Cartesian3()
            );
            tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
        },
    }

}
</script>
<style scoped></style>