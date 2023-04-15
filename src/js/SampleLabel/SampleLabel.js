 import "./style.css"
 export default class SampleLabel{
     constructor(viewer, position, label) {
         this.viewer = viewer;
         this.position = position;
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
         this.container.style.bottom = canvasHeight - windowPosition.y + 40 + "px";
         this.container.style.left = windowPosition.x + 20 + "px";
     }

     //移除标绘
     remove() {
         this.viewer.scene.postRender.removeEventListener(this.postRender, this); //移除事件监听
         this.viewer.cesiumWidget.container.removeChild(this.container); //删除DOM
     }

     createDom() {
         this.container = document.createElement("div");
         this.container.classList.add("point-sample-label-container");
         let label = document.createElement("div");
         label.classList.add("point-sample-label-text");
         label.innerHTML = this.label;


         this.container.appendChild(label);
         this.viewer.cesiumWidget.container.appendChild(this.container);
     }
 }