<template>
    <viewer></viewer>
<!--    <dynamic-monomer-single></dynamic-monomer-single>-->
</template>

<script>
import Viewer from "./components/Viewer.vue";
import DynamicMonomerSingle from "./components/DynamicMonomerSingle/DynamicMonomerSingle.vue";
  export default {
    name: 'App',
    components:{
      DynamicMonomerSingle,
      Viewer,
    }
  };
</script>
<style scoped>

</style>
