 export function point3dsToPoint2ds(point2d, height) {
     return Cesium.Cartesian3.fromDegrees(point2d[0], point2d[1], height);
 }