import "./style.css"
export default class LeafletWindow {
    constructor(viewer, position, fields, values) {
        this.viewer = viewer;
        this.position = position;
        this.fields = fields;
        this.values = values;
        this.init();
    }

    //初始化
    init() {
        this.createDom();
        this.addEvent();
    }

    createDom() {
        let $container = document.createElement("div");
        $container.classList.add("leaflet-popup-container");

        let $close = document.createElement("span");
        $close.innerHTML = "×";
        $close.classList.add("leaflet-popup-close-button");
        $container.appendChild($close);

        let $body = document.createElement("div");
        $body.classList.add("leaflet-popup-content-wrapper");
        $container.appendChild($body);
        this.createContent($body);

        let $tipcontainer = document.createElement("div");
        $tipcontainer.classList.add("leaflet-popup-tip-container");
        $container.appendChild($tipcontainer);

        let $tip = document.createElement("div");
        $tip.classList.add("leaflet-popup-tip");
        $tipcontainer.appendChild($tip);

        this.$container = $container;
        this.$body = $body;
        this.viewer.cesiumWidget.container.append($container);
        //点击关闭按钮时关闭窗口
        $close.onclick = (e) => {
            this.close();
        };
    }

    createContent($body) {
        let html = "";
        for (let i = 0; i < this.values.length; i++) {
            html += `
                <tr>
                  <td><label style="color:#e0f102;">${this.fields[i]}</label>：${this.values[i]}</td>
                </tr>`
        }
        let content = ` <table>${html}</table> `;
        $body.innerHTML = content;
    }

    addEvent() {
        this.viewer.scene.postRender.addEventListener(this.postRenderEvent, this);
    }

    postRenderEvent() {
        const canvasHeight = this.viewer.scene.canvas.height;
        const windowPosition = new Cesium.Cartesian2();
        Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, this.position, windowPosition);
        this.$container.style.bottom = canvasHeight - windowPosition.y + 30 + "px";

        const elWidth = this.$container.offsetWidth;
        this.$container.style.left = windowPosition.x - (elWidth / 2) + "px";

        if (this.viewer.camera.positionCartographic.height > 4000) {
            this.$container.style.display = "none";
        } else {
            this.$container.style.display = "block";
        }
    }

    //关闭 
    close() {
        this.viewer.scene.postRender.removeEventListener(this.postRenderEvent, this);
        this.$container.remove();
    }
}