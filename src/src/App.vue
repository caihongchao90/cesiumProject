<template>
    <!-- <viewer></viewer> -->
<!--    <dynamic-monomer-single></dynamic-monomer-single>-->
  <!-- <measure></measure> -->
  <map3d-window></map3d-window>
</template>

<script>
import Viewer from "./components/Viewer.vue";
import DynamicMonomerSingle from "./components/DynamicMonomerSingle/DynamicMonomerSingle.vue";
import Measure from "./components/measure.vue";
import Map3dWindow from "./components/Map3dWindow.vue";
  export default {
    name: 'App',
    components:{
    DynamicMonomerSingle,
    Viewer,
    Measure,
    Map3dWindow
}
  };
</script>
<style scoped>

</style>
