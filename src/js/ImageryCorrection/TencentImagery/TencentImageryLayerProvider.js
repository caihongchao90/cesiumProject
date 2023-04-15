/*
 * 腾讯地图主类
 * @Author: Wang jianLei
 * @Date: 2022-07-04 10:59:54
 * @Last Modified by: Wang JianLei
 * @Last Modified time: 2022-07-05 16:35:10
 */
import TencentMercatorTilingScheme from "./TencentMercatorTilingScheme.js";
const Cesium = window.Cesium;
class TencentImageryLayerProvider extends Cesium.UrlTemplateImageryProvider {
  constructor(options = {}) {
    if (!options.url) throw new Error("Map service url is required!");
    const url = options.url;
    options["url"] = url.replace("{style}", options.style || 1);
    if (!options.subdomains || !options.subdomains.length) {
      options["subdomains"] = ["0", "1", "2"];
    }
    if (options.style) {
      options["customTags"] = {
        sx: (imageryProvider, x, y, level) => {
          return x >> 4;
        },
        sy: (imageryProvider, x, y, level) => {
          return ((1 << level) - y) >> 4;
        },
      };
    }
    if (options.crs === "WGS84") {
      options["tilingScheme"] = new TencentMercatorTilingScheme();
    }
    super(options);
  }
}

export default TencentImageryLayerProvider;