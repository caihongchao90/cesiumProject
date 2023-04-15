/* 各厂商在线地图服务加载主类
 * @Author: Wang jianLei
 * @Date: 2022-07-05 11:03:40
 * @Last Modified by: Wang JianLei
 * @Last Modified time: 2022-07-05 14:40:14
 */
import ArcgisImageryLayerProvider from "./ArcgisImagery/ArcgisImageryLayerProvider.js";
import BaiduImageryLayerProvider from "./BaiduImagery/BaiduImageryLayerProvider.js";
import AmapImageryLayerProvider from "./AmapImagery/AmapImageryLayerProvider.js";
import TencentImageryLayerProvider from "./TencentImagery/TencentImageryLayerProvider.js";

export default class ImageryLayer {
  constructor() {
    this.ArcgisImageryLayerProvider = ArcgisImageryLayerProvider;
    this.BaiduImageryLayerProvider = BaiduImageryLayerProvider;
    this.AmapImageryLayerProvider = AmapImageryLayerProvider;
    this.TencentImageryLayerProvider = TencentImageryLayerProvider;
  }
}