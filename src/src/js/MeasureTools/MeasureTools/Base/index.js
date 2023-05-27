// 
import * as turf from '@turf/turf'
//笛卡尔坐标转为经纬度[x,y]
export function cartesian3ToLonLat(position) {
    const cartographic = Cesium.Cartographic.fromCartesian(position);
    const lon = Cesium.Math.toDegrees(cartographic.longitude);
    const lat = Cesium.Math.toDegrees(cartographic.latitude);
    return [lon, lat];
}

//获取两个笛卡尔坐标的水平距离
export function getDistanceH(p1, p2) {
    let lngLat1 = cartesian3ToLonLat(p1);
    let lngLat2 = cartesian3ToLonLat(p2);
    return distance(lngLat1, lngLat2);
}

//计算两个经纬度点的距离
export function distance(lngLat1, lngLat2) {
    let radLat1 = lngLat1[1] * Math.PI / 180.0;
    let radLat2 = lngLat2[1] * Math.PI / 180.0;
    let a = radLat1 - radLat2;
    let b = lngLat1[0] * Math.PI / 180.0 - lngLat2[0] * Math.PI / 180.0;
    let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * 6378.137;
    s = Math.round(s * 10000) / 10;
    return s
}

//笛卡尔坐标点的高度
export function positionHeight(position) {
    return Cesium.Cartographic.fromCartesian(position).height;
}

//笛卡尔坐标转为经纬度[x,y,z]
export function cartesian3Point3(position) {
    const c = Cesium.Cartographic.fromCartesian(position);
    const lon = Cesium.Math.toDegrees(c.longitude);
    const lat = Cesium.Math.toDegrees(c.latitude);
    return [lon, lat, c.height];
}

// 计算笛卡尔坐标串的距离（空间距离）
export function spaceDistance(positions) {
    if (positions.length < 2) return 0;
    let sumDis = 0; //根据cesium提供的API来计算空间距离
    for (let i = 0; i < positions.length - 1; i++) {
        sumDis += Cesium.Cartesian3.distance(positions[i], positions[i + 1]);
    }
    return sumDis.toFixed(3); //保留3位小数即可 可以自己根据精度要求设置
}

//计算笛卡尔坐标串的面积（投影面积即水平面积）
export function computeArea(positions) {
    if (positions.length < 3) return 0;
    let lngLats = [];
    positions.forEach(item => {
        lngLats.push(cartesian3ToLonLat(item));
    });
    lngLats.push(lngLats[0]); //首尾一致 
    let polygon = turf.polygon([lngLats]);
    return turf.area(polygon).toFixed(3);
}