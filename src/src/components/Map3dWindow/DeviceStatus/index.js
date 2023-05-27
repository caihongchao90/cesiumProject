import "./style.css"
export default class {
    constructor(viewer, position, infos) {
        this.viewer = viewer;
        this.position = position;
        this.infos = infos;

        this.createDom();
        viewer.cesiumWidget.container.appendChild(this.container); //将字符串模板生成的内容添加到DOM上

        this.addPostRender();
    }


    //创建dom
    createDom() {
        this.container = document.createElement("div");
        this.container.classList.add("device-status-container");
        if (this.infos.status) { //在线
            this.container.classList.add("device-status-container-green");
        } else {
            this.container.classList.add("device-status-container-yellow");
        }

        let title = document.createElement("div");
        title.classList.add("device-title");
        this.container.appendChild(title);
        title.innerHTML = this.infos.title;

        let name = document.createElement("div");
        name.classList.add("device-name");
        name.innerHTML = this.infos.name;
        this.container.appendChild(name);
        name.innerHTML = `
        <span>设备名称：</span>
        <span>` + this.infos.name + `</span>`

        let num = document.createElement("div");
        num.classList.add("device-num");
        num.innerHTML = this.infos.num;
        this.container.appendChild(num);
        num.innerHTML = `
        <span>设备编号：</span>
        <span>` + this.infos.num + `</span>`

        let status = document.createElement("div");
        status.classList.add("device-status");
        this.container.appendChild(status);
        let span1 = document.createElement("span");
        span1.innerHTML = "设备状态："
        status.appendChild(span1);

        let span2 = document.createElement("span");
        span2.innerHTML = this.infos.status ? "在线" : "离线";
        status.appendChild(span2);
        this.infos.status ? span2.classList.add("device-status-t1") : span2.classList.add("device-status-t0");
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
        this.container.style.bottom = canvasHeight - windowPosition.y + 60 + "px";
        // const elWidth = this.container.offsetWidth;
        const elWidth = this.container.scrollWidth;
        this.container.style.left = windowPosition.x - 10 + "px";
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