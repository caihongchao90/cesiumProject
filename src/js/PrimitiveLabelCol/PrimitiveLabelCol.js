export default class PrimitiveLabelCol{
    constructor(viewer) {
        this.viewer = viewer;

        this.billboards = this.viewer.scene.primitives.add(new Cesium.BillboardCollection());
        this.labels = this.viewer.scene.primitives.add(new Cesium.LabelCollection());
    }

    add(position, label, imgUrl) {
        this.addBillboard(position, imgUrl);
        this.addLabel(position, label);
    }

    //添加单个图标点
    addBillboard(position, imgUrl) {
        this.billboards.add({
            position: position,
            image: imgUrl,
            scale: 0.6,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            scaleByDistance: new Cesium.NearFarScalar(50000, 1, 1000000, 0.4),
            clampToGround: true
        });
    }

    //添加单个文本
    addLabel(position, label) {
        this.labels.add({
            position: position,
            text: label,
            fillColor: Cesium.Color.WHITE,
            scale: 0.4,
            font: 'normal 40px MicroSoft YaHei',
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 500000),
            scaleByDistance: new Cesium.NearFarScalar(50000, 1, 1000000, 0.4),
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new Cesium.Cartesian2(14, -4),
            outlineWidth: 20,
            clampToGround: true,
            outlineColor: Cesium.Color.BLACK
        })
    }

    //移除
    remove() {

        this.viewer.scene.primitives.remove(this.billboards);
        this.viewer.scene.primitives.remove(this.labels);
        this.viewer = undefined
    }
}