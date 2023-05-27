import PlotBase from "../PlotBase";
import { unifiedHeight } from "../../../PlotBase/PlotBaseUtils";

import PlotTypes from "../PlotTypes"

export default class Wall extends PlotBase {
    constructor(viewer, geoFeature) {
        super(viewer, geoFeature);
        this.properties.plotName = "立体视频墙";
        this.properties.plotType = PlotTypes.WALL;
        this.fixPositionCount = 2;
        this.style = this.properties.style || this.getDefaultStyle();
        this.properties.style = this.style;
        this.createEntity();
        this.playVideo();
    }

    createEntity() {
        this.initHeights(); //创建之前先设置高度
        this.initWall();
    }

    getStyle() {
        return this.style;
    }

    updateStyle() {
        this.initHeights();
    }

    updatePositionAction() {
        this.initHeights();
    }

    initHeights() {
        this.style.baseHeight = unifiedHeight(this.positions, this.style.baseHeight);
        if (this.style.baseHeight < 0) this.style.baseHeight = 0;
        let minimumHeights = new Array(this.positions.length).fill(this.style.baseHeight); //最小高度集合 

        let maximumHeights = []; //最大高度集合 
        for (let i = 0; i < minimumHeights.length; i++) {
            maximumHeights.push(minimumHeights[i] + this.style.wallHeight);
        }
        this.minimumHeights = minimumHeights;
        this.maximumHeights = maximumHeights;
    }

    initWall() {
        this.wallEntity = this.viewer.entities.add({
            plotType: this.properties.plotBase,
            plotCode: this.properties.plotCode,
            wall: {
                positions: new Cesium.CallbackProperty(e => {
                    return this.positions
                }, false),
                minimumHeights: new Cesium.CallbackProperty(e => {
                    return this.minimumHeights //最小高度集合
                }, false),
                maximumHeights: new Cesium.CallbackProperty(e => {
                    return this.maximumHeights
                }, false),
                material: Cesium.Color.DARKGREEN.withAlpha(0.5),
                outline: false,
                outlineWidth: 10,
                outlineColor: Cesium.Color.AQUA
            }
        });
    }

    setSelected(selected) {
        this.wallEntity.wall.outline = selected;
    }

    playVideo() {
        if (!this.style.url) return;
        this.createVideo();
    }

    stopVideo() {

    }


    createVideo() {
        if (this.$video) this.$video.remove();
        let $video = document.createElement("video");
        $video.classList.add("video-jd-temp");
        $video.setAttribute("controls", !0);
        $video.setAttribute("autoplay", "autoplay");
        $video.setAttribute("src", this.style.url);

        let vId = "vid" + new Date().getTime();
        $video.setAttribute("id", vId);
        this.viewer.cesiumWidget.container.append($video);
        $video.addEventListener('play', () => { //播放开始执行的函数
            this.wallEntity.wall.material = $video;
        });

        this.$video = $video;
    }


    getDefaultStyle() {
        return {
            wallHeight: 10,
            fontSize: 84,
            text: "立体视频墙",
            url: "../../static/lukou.mp4"
        }
    }

    toGeoJson() {
        return {
            type: "Feature",
            properties: this.properties,
            geometry: {
                type: "LineString",
                coordinates: this.coordinates
            }
        };
    }

    //删除标绘
    remove() {
        this.viewer.entities.remove(this.wallEntity);
        if (this.$video)
            this.$video.remove();
    }
}