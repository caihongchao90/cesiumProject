  import "./style.css"
  export default class DivPoint {
      constructor(viewer, position, info) {
          this.viewer = viewer;
          // this.position = position;
          this.positionArry = position
          this.position = Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2]);
          this.wStation = info
          this.point = undefined
          this.createDom();
          viewer.cesiumWidget.container.appendChild(this.$container); //将字符串模板生成的内容添加到DOM上
          this.addStates();
          this.addPostRender();
          this.addPoint();
      }

      //添加点图元
      addPoint() {
          this.point = this.viewer.entities.add({
              position: this.position,
              point: {
                  pixelSize: 10,
                  color: Cesium.Color.RED,
                  verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              }
          })
      }


      createDom() {
          this.$container = document.createElement("div");
          this.$container.innerHTML =
              ` <div class="div-point-container">
                  <div class="divpoint divpoint-theme">
                    <div class="divpoint-wrap">
                      <div class="area">
                        <div class="arrow-lt"></div>
                        <div class="b-t"></div>
                        <div class="b-r"></div>
                        <div class="b-b"></div>
                        <div class="b-l"></div>
                        <div class="arrow-rb"></div>
                        <div class="label-wrap">
                          <div class="title">` + this.wStation.title + `</div>
                          <div class="label-content">
                            <div class="data-li">
                              <div class="data-label">实时流量：</div>
                              <div class="data-value">
                                <span class="label-num">` + this.wStation.flow + `</span>
                                <span class="label-unit">m³/s</span>
                              </div>
                            </div>

                            <div class="data-li">
                              <div class="data-label">水池液位：</div>
                              <div class="data-value">
                                <span class="label-num">` + this.wStation.stage + `</span>
                                <span class="label-unit">m</span>
                              </div>
                            </div>
                            <div class="data-li data-li-state">
                              <div class="data-label">水泵状态：</div>
                             <!-- <div class="data-value" v-for="(item, index) in wStation.status" :key="index">
                                <el-tooltip
                                  class="item"
                                  effect="dark"
                                  :content="item.stateName"
                                  placement="bottom"
                                >
                                  <span class="label-tag" :style="{'background':getBg(item.state)}">{{item.num}}号</span>
                                </el-tooltip>
                              </div>-->
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="b-t-l"></div>
                      <div class="b-b-r"></div>
                    </div>
                    <div class="arrow"></div>
                  </div>
                </div>`
      }
      //状态
      addStates() {
          let dom = this.$container.getElementsByClassName("data-li-state", )[0];

          this.wStation.status.forEach(state => {
              let span = document.createElement("span");
              span.classList.add("label-tag");
              span.innerHTML = state.label;
              span.style.background = this.getBg(state.state);
              dom.appendChild(span);
          });
      }
      flyTo(){
          this.viewer.camera.flyTo({
              destination : Cesium.Cartesian3.fromDegrees(this.positionArry[0],this.positionArry[1],this.positionArry[2]+20),
              duration:1,
          });
      }
      getBg(state) {
          switch (state) {
              case 0:
                  return "red";
              case 1:
                  return "green";
              case 2:
                  return "#ffff00ab";
          }
      }

      //添加场景事件
      addPostRender() {
          this.viewer.scene.postRender.addEventListener(this.postRender, this);
      }

      //场景渲染事件 实时更新标签的位置 使其与笛卡尔坐标一致
      postRender() {
          if (!this.$container || !this.$container.style) return;
          const canvasHeight = this.viewer.scene.canvas.height;
          const windowPosition = new Cesium.Cartesian2();
          Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, this.position, windowPosition);
          this.$container.style.position = "absolute";
          this.$container.style.bottom = canvasHeight - windowPosition.y + "px";
          const elWidth = this.$container.offsetWidth;
          this.$container.style.left = windowPosition.x + "px";

          if (this.viewer.camera.positionCartographic.height > 14000) {
              this.$container.style.display = "none";
          } else {
              this.$container.style.display = "block";
          }
      }

      //关闭 
      remove() {
          this.viewer.scene.postRender.removeEventListener(this.postRender, this); //移除事件监听
          this.$container.remove();
          if (this.point){
              this.viewer.entities.remove(this.point);
              this.point = undefined
          }
      }
  }