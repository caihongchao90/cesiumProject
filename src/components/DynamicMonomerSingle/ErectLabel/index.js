//竖立label 
import "./style.css"
export default class ErectLable{
    constructor(viewer, position, label) {
        this.viewer = viewer;
        this.positionArry = position
        this.position = Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2]);
        this.label = label;
        this.createDom();
        this.addPostRender();
    }


    //添加场景事件
    addPostRender() {
        this.viewer.scene.postRender.addEventListener(this.postRender, this);
    }

    //场景渲染事件 实时更新标签的位置 使其与笛卡尔坐标一致
    postRender() {
        if (!this.container || !this.container.style) return;
        if (!this.position) return;

        const canvasHeight = this.viewer.scene.canvas.height;
        const windowPosition = new Cesium.Cartesian2();
        Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, this.position, windowPosition);

        this.container.style.bottom = canvasHeight - windowPosition.y + 10 + "px";
        const elWidth = this.container.offsetWidth;
        this.container.style.left = windowPosition.x - (elWidth / 2) + "px";

        if (this.viewer.camera.positionCartographic.height > 4000) {
            this.container.style.display = "none";
        } else {
            this.container.style.display = "block";
        }
    }

    createDom() {
        this.container = document.createElement("div");
        this.container.classList.add("is-shulie");
        let label = document.createElement("div");
        label.innerHTML = this.label;
        label.classList.add("is-shulie-item");
        this.container.appendChild(label);

        let line = document.createElement("div");
        line.classList.add("pre-topCard-list-item-line");
        this.container.appendChild(line);

        let circle = document.createElement("div");
        circle.classList.add("pre-topCard-list-item-circle");
        this.container.appendChild(circle);
        this.viewer.cesiumWidget.container.appendChild(this.container);
    }

    flyTo(){
        this.viewer.camera.flyTo({
            destination : Cesium.Cartesian3.fromDegrees(this.positionArry[0],this.positionArry[1],this.positionArry[2]+20),
            duration:1,
        });
    }

    //移除标绘
    remove() {
        this.viewer.scene.postRender.removeEventListener(this.postRender, this); //移除事件监听
        this.viewer.cesiumWidget.container.removeChild(this.container); //删除DOM
    }
}