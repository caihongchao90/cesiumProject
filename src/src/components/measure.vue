<template>
	<div id="cesiumContainer"></div>
</template>

<script>
let viewer
import MeasureTools from "./measure/MeasureTools/index.js"
export default {
	name: "measure",
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

		// 移除默认的影像图层
		viewer.imageryLayers.remove(viewer.imageryLayers.get(0));

		// 创建 ArcGIS Online 影像底图提供者
		var arcGisProvider = new Cesium.ArcGisMapServerImageryProvider({
			url: 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer',
			enablePickFeatures: false
		});
		// 添加 ArcGIS Online 影像底图到 Viewer
		viewer.imageryLayers.addImageryProvider(arcGisProvider);

		let palaceTileset = new Cesium.Cesium3DTileset({
			url: 'http://211.149.185.229:8081/data/offset_3dtiles/tileset.json',
			//控制切片视角显示的数量，可调整性能/src/assets/yaogansuo_3dtiles/tileset.json
		});
		palaceTileset.readyPromise.then(function (palaceTileset) {
			//添加到场景
			viewer.scene.primitives.add(palaceTileset)
			viewer.flyTo(palaceTileset)
		});

		let mdTool = new MeasureTools.Area(viewer);
		mdTool.activate()
	}
	
}
</script>
<style scoped>

</style>