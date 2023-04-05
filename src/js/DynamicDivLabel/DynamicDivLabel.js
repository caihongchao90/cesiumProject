import "./style.css"
export default class DynamicDivLabel {
  constructor(viewer, position, label) {
      this.viewer = viewer;
      this.positionArry = position
      this.position = Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2]);
      // this.position = position;
      this.label = label;
      this.point = undefined
      this.#createDom();
      viewer.cesiumWidget.container.appendChild(this.$container); //将字符串模板生成的内容添加到DOM上
      this.#addPostRender();
      this.#addPoint();
  }

  //创建dom
  #createDom() {
      this.$container = document.createElement("div");
      this.$container.classList.add("dynamic-divlabel-container");
      this.$container.classList.add("dynamic-divlabel-container1");
      this.$body = document.createElement("div");
      this.$body.classList.add("sz-component-animate-marker__boder");
      this.$label = document.createElement("span");
      this.$label.classList.add("sz-component-animate-marker__text");

      this.$label.innerHTML = this.label;
      this.$body.appendChild(this.$label);
      this.$container.appendChild(this.$body);
  }

  //添加点图元
  #addPoint() {
      this.point = this.viewer.entities.add({
          position: this.position,
          point: {
              pixelSize: 10,
              color: Cesium.Color.RED,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          }
      })
  }

  //添加场景事件
  #addPostRender() {
      this.viewer.scene.postRender.addEventListener(this.#postRender, this);
  }

  //场景渲染事件 实时更新标签的位置 使其与笛卡尔坐标一致
  #postRender() {
      if (!this.$container || !this.$container.style) return;
      const canvasHeight = this.viewer.scene.canvas.height;
      const windowPosition = new Cesium.Cartesian2();
      Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, this.position, windowPosition);
      const elHeight = this.$container.firstChild.offsetHeight;
      this.$container.style.bottom = canvasHeight - windowPosition.y + elHeight + "px";
      const elWidth = this.$container.firstChild.offsetWidth;

      this.$container.style.left = windowPosition.x - (elWidth / 2) + "px";

      if (this.viewer.camera.positionCartographic.height > 14000) {
          this.$container.style.display = "none";
      } else {
          this.$container.style.display = "block";
      }
  }
  flyTo(){
      this.viewer.camera.flyTo({
          destination : Cesium.Cartesian3.fromDegrees(this.positionArry[0],this.positionArry[1],this.positionArry[2]+20),
          duration:1,
      });
  }
  //关闭
  remove() {
      this.$container.remove();
      this.point?this.viewer.entities.remove(this.point):this.point=undefined;
      this.viewer.scene.postRender.removeEventListener(this.postRender, this); //移除事件监听
  }
}