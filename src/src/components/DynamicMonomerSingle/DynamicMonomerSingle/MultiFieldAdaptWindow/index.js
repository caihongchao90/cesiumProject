// 多字段自动适配窗口
//根据字段字符段长度设置label的宽度
//不限字段数量
//动态设置字段与字段值

import "./style.css"
export default class MultiFieldAdaptWindow {
    constructor(viewer, position, title, fields, values) {
        if (!Array.isArray(fields) || !Array.isArray(values)) {
            throw "字段和值必须为数组类型"
        }

        if (fields.length != values.length) {
            throw "字段和值数组长度不一致！"
        }
        this.viewer = viewer;
        this.position = position;
        this.title = title;
        this.fields = fields;
        this.values = values;

        this.createDom();
        viewer.cesiumWidget.container.appendChild(this.container); //将字符串模板生成的内容添加到DOM上
        this.initDom();
        this.initEvent();

        this.addPostRender();
    }


    //创建dom
    createDom() {
        this.container = document.createElement("div");
        this.container.innerHTML =
            `  <div class="MultiFieldAdaptWindow-container" v-if="show">
          <div class="MultiFieldAdaptWindow-header">
            <span class="MultiFieldAdaptWindow-title">  ` + this.title + `</span>
            <span class="MultiFieldAdaptWindow-close" title="关闭"  >×</span>
          </div>
          <div class="MultiFieldAdaptWindow-body">
           <!-- <div v-for="(field,index) in fields" :key="index" class="MultiFieldAdaptWindow-info-item">
              <span class="MultiFieldAdaptWindow-ifno-label" :style="getFieldStyle()">{{field}}：</span>
              <span class="MultiFieldAdaptWindow-ifno-text">{{formatValue(values[index])}}</span>
            </div>-->
          </div>
        </div>`
    }

    initDom() {
        for (let i = 0; i < this.values.length; i++) {
            let item = document.createElement("div");
            item.classList.add("MultiFieldAdaptWindow-info-item");
            let span = document.createElement("span");
            span.classList.add("MultiFieldAdaptWindow-ifno-label");
            span.innerHTML = this.fields[i] + "："
            item.appendChild(span);

            span = document.createElement("span");
            span.classList.add("MultiFieldAdaptWindow-ifno-text");
            span.innerHTML = this.values[i];
            item.appendChild(span);

            this.container.getElementsByClassName("MultiFieldAdaptWindow-body")[0].appendChild(item);
        }
    }

    //点击关闭
    initEvent() {
        this.container.getElementsByClassName("MultiFieldAdaptWindow-close")[0]
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
        const MultiFieldAdaptWindowPosition = new Cesium.Cartesian2();
        Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, this.position, MultiFieldAdaptWindowPosition);
        this.container.style.position = "absolute";
        this.container.style.bottom = canvasHeight - MultiFieldAdaptWindowPosition.y + 80 + "px";
        // const elWidth = this.container.offsetWidth;
        const elWidth = this.container.scrollWidth;

        this.container.style.left = MultiFieldAdaptWindowPosition.x - (elWidth / 2) + "px";

        // if (this.viewer.camera.positionCartographic.height > 14000) {
        //     this.container.style.display = "none";
        // } else {
        //     this.container.style.display = "block";
        // }
    }

    //关闭
    close() {
        this.container.remove(); //删除dom
        this.viewer.scene.postRender.removeEventListener(this.postRender, this); //移除事件监听
    }
}
