<!--/Home.vue-->
<template>
  <div class="home_page">
    <top class="section top">
      <!--header-->
    </top>
    <introduction class="section introduction">
      <!--introduction-->
    </introduction>
    <foot class="section foot">
      <!--footer-->
    </foot>
  </div>
</template>

<script>
import Top from './components/Top'
import Introduction from './components/Introduction'
import Foot from './components/Foot'
export default {
  components: {
    'top': Top,
    'introduction': Introduction,
    'foot': Foot
  },
  name: 'home'
}
</script>

<style scoped>
  .home_page{
    width: 100%;
    height: 100%;
  }
  .top{
    height: 80px;
    background-color: #fff;
    color: #fff;
    line-height: 80px;
  }
  .introduction{
    height: calc(100% - 80px - 220px);
  }
  .foot{
    height: 220px;
  }
</style>
