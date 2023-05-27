 import "./style.css"
 export default class RtmpVideoWindow {
     constructor(viewer, position, videoInfo) {
         this.viewer = viewer;
         this.position = position;
         this.videoInfo = videoInfo;
         this.isDestroy = false;
         this.init();
     }

     //初始化
     init() {
         //  let point = this.videoInfo.point;
         //  this.position = Cesium.Cartesian3.fromDegrees(point[0], point[1], point[2]);
         this.createDom();
         this.addEvent();
     }

     createDom() {
         let $container = document.createElement("div");
         $container.classList.add("video-popup3d-container");

         let $header = document.createElement("div");
         $header.classList.add("video-popup3d-header");
         $container.appendChild($header);

         let $title = document.createElement("span");
         $title.innerHTML = this.videoInfo.name;
         $title.classList.add("video-popup3d-header-title");
         $header.appendChild($title);

         let $close = document.createElement("span");
         $close.innerHTML = "×";
         $close.classList.add("video-popup3d-close");
         $header.appendChild($close);

         let $body = document.createElement("div");
         $body.classList.add("video-popup3d-body");
         $container.appendChild($body);
         this.$container = $container;
         this.$body = $body;
         this.viewer.cesiumWidget.container.append($container);
         //点击关闭按钮时关闭窗口
         $close.onclick = (e) => {
             this.close();
         };
         this.createVideo();
     }

     createVideo() {
         let $video = document.createElement("video");
         $video.classList.add("video-js");
         $video.classList.add("vjs-default-skin");
         $video.classList.add("vjs-big-play-centered");
         $video.classList.add("video-jd-temp");
         $video.setAttribute("controls", !0);
         $video.setAttribute("autoplay", "autoplay");
         $video.setAttribute("preload", "auto");
         let $source = document.createElement("source");
         $source.setAttribute("type", "rtmp/flv");
         $source.setAttribute("src", this.videoInfo.url);
         $video.appendChild($source);
         this.$body.appendChild($video);

         let vId = "vid" + new Date().getTime();
         $video.setAttribute("id", vId);

         let player = videojs(vId);
         player.ready((e) => {
             player.play(); //播放 
         });
         this.player = player;
     }

     addEvent() {
         this.viewer.scene.postRender.addEventListener(this.postRenderEvent, this);
     }

     postRenderEvent() {
         const canvasHeight = this.viewer.scene.canvas.height;
         const windowPosition = new Cesium.Cartesian2();
         Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, this.position, windowPosition);
         this.$container.style.bottom = canvasHeight - windowPosition.y + 80 + "px";
         this.$container.style.left = windowPosition.x + 20 + "px";
     }

     //关闭 
     close() {
         if (this.isDestroy) return;
         this.player.dispose();
         this.viewer.scene.postRender.removeEventListener(this.postRenderEvent, this);
         this.$container.remove();
         this.isDestroy = true;
     }
 }