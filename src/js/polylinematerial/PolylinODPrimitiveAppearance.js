export default class PolylinODPrimitiveAppearance {
    constructor(color) {
        return new Cesium.PolylineMaterialAppearance({
            material: new Cesium.Material({
                fabric: {
                    type: 'ODLineMaterial',
                    uniforms: {
                        color_0: color,
                        totoalFrameCount_1: 1000,
                    },
                    source: ` 
                    uniform float totoalFrameCount_1;
                    uniform vec4 color_0; 
                    czm_material czm_getMaterial(czm_materialInput materialInput)
                    {
                        czm_material material = czm_getDefaultMaterial(materialInput);
                        vec2 st = materialInput.st;  
                        float t = mod(czm_frameNumber, totoalFrameCount_1) / totoalFrameCount_1; 
                        t *= 1.03;
                        float alpha = smoothstep(t- 0.03, t, st.s) * step(-t, -st.s); 
                        alpha += 0.1;
                        alpha *= step(-0.4, -abs(0.5-st.t));                             
                        material.diffuse = color_0.rgb;
                        material.alpha = alpha;
                        return material;
                    } 
                `,
                },
                translucent: true
            }),
            faceForward: false,
            closed: false
        })
    }
}