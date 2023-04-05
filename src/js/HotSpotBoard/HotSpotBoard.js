import "./style.css"
export default class HotSpotBoard {
    constructor(viewer, position, style={}) {
        this.viewer = viewer;
        this.position = Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2]);
        this.positionArry = position

        this.style = style
        this.style.bgImageUrl = style.bgImageUrl || "./image/hotspotboard";
        this.style.title = style.title || "征收状态";
        this.style.content = style.content || "未签未腾退";
        this.createDom();
        viewer.cesiumWidget.container.appendChild(this.container);
        this.addPostRender();
        // this.addPoint();
        this.container.getElementsByClassName("hot-spot")[0].style.backgroundImage = "url(" + style.bgImageUrl + "/home_icon_18.png)";
        this.container.getElementsByClassName("hot-spot-board")[0].style.backgroundImage = "url(" + style.bgImageUrl + "/home_icon_19.png)";

        this.container.onmouseover = e => {
            this.container.getElementsByClassName("hot-spot")[0].style.backgroundImage = "url(" + style.bgImageUrl + "/home_icon_21.png)";
            this.container.getElementsByClassName("hot-spot-board")[0].style.backgroundImage = "url(" + style.bgImageUrl + "/home_icon_20.png)";
        }

        this.container.onmouseout = e => {
            this.container.getElementsByClassName("hot-spot")[0].style.backgroundImage = "url(" + style.bgImageUrl + "/home_icon_18.png)";
            this.container.getElementsByClassName("hot-spot-board")[0].style.backgroundImage = "url(" + style.bgImageUrl + "/home_icon_19.png)";

        }
    }

    //添加点图元
    addPoint() {
        this.viewer.entities.add({
            position: this.position,
            point: {
                pixelSize: 10,
                color: Cesium.Color.RED,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            }
        })
    }

    //创建dom
    createDom() {
        this.container = document.createElement("div");
        this.container.innerHTML =
          `<div class="hot-spot">
            <div class="hot-spot-board hot-spot-board-medium">
              <h5> ` + this.style.title + `</h5>
              <p> ` + this.style.content + `</p>
            </div>
            <div class="hot-spot-line hot-spot-line-medium"></div>
          </div>`;

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
        this.container.style.bottom = canvasHeight - windowPosition.y + "px";
        const elWidth = this.container.offsetWidth;
        this.container.style.left = windowPosition.x - (elWidth / 2) + "px";

        if (this.viewer.camera.positionCartographic.height > 5000) {
            this.container.style.display = "none";
        } else {
            this.container.style.display = "block";
        }
    }

    //关闭 
    windowClose() {
        this.container.remove(); //删除dom
        this.viewer.scene.postRender.removeEventListener(this.postRender, this); //移除事件监听
    }
    flyTo(){
        this.viewer.camera.flyTo({
            destination : Cesium.Cartesian3.fromDegrees(this.positionArry[0],this.positionArry[1],this.positionArry[2]+20),
            duration:1,
        });
    }
}