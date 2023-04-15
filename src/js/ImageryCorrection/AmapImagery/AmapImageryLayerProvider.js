/*
 * 高德地图主类
 * @Author: Wang jianLei
 * @Date: 2022-07-04 10:59:54
 * @Last Modified by: Wang JianLei
 * @Last Modified time: 2022-07-05 11:41:48
 */

import AmapMercatorTilingScheme from "./AmapMercatorTilingScheme.js";

class AmapImageryLayerProvider extends Cesium.UrlTemplateImageryProvider {
  constructor(options = {}) {
    if (!options.url) throw new Error("Map service url is required!");
    if (!options.subdomains || !options.subdomains.length) {
      options["subdomains"] = ["01", "02", "03", "04"];
    }
    if (options.crs === "WGS84") {
      options["tilingScheme"] = new AmapMercatorTilingScheme();
    }
    super(options);
  }
}
export default AmapImageryLayerProvider;