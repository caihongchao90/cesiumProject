 import "./style.css"
 export default class PopupWindow2 {
     constructor(viewer, position, title, html) {
         this.viewer = viewer;
         this.position = position;
         this.title = title;
         this.html = html;
         this.createDom();
         viewer.cesiumWidget.container.appendChild(this.container);

         this.initEvent();

         this.addPostRender();
     }


     //创建dom
     createDom() {
         this.container = document.createElement("div");
         this.container.innerHTML =
             `  <div class="popup3d2-container" v-if="show">
          <div class="popup3d2-header">
            <span class="popup3d2-title">  ` + this.title + `</span>
            <span class="popup3d2-close" title="关闭"  >×</span>
          </div>
          <div class="popup3d1-body">
          ` + this.html || "窗口内容" + `
          </div>
        </div>`
     }

     //点击关闭
     initEvent() {
         this.container.getElementsByClassName("popup3d2-close")[0]
             .onclick = e => {
                 this.close();
             }
     }


     //添加场景事件
     addPostRender() {
         this.viewer.scene.postRender.addEventListener(this.postRender, this);
     }

     //场景渲染事件 实时更新标签的位置 使其与笛卡尔坐标一致
     postRender() {
         if (!this.container || !this.container.style) return;
         const canvasHeight = this.viewer.scene.canvas.height;
         const windowPosition = new Cesium.Cartesian2();
         Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, this.position, windowPosition);
         this.container.style.position = "absolute";
         this.container.style.bottom = canvasHeight - windowPosition.y + 80 + "px";
         //  const elWidth = this.container.offsetWidth;
         this.container.style.left = windowPosition.x + 30 + "px";

         if (this.viewer.camera.positionCartographic.height > 4000) {
             this.container.style.display = "none";
         } else {
             this.container.style.display = "block";
         }
     }

     //关闭 
     close() {
         this.container.remove(); //删除dom
         this.viewer.scene.postRender.removeEventListener(this.postRender, this); //移除事件监听
     }
 }