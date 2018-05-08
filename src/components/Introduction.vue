<template>
  <div class="main_content">
    <div class="swiper-container" ref="slider">
      <div class="swiper-wrapper">
        <div class="swiper-slide slide_item">
          <h1 class="title">flowchart-drawer</h1>
          <sub class="subtitle">基于Vue的在线流程图绘制平台</sub>
          <img src="../assets/images/intro-1.png" class="intro-pic" />
        </div>
        <div class="swiper-slide slide_item">
          <h2 class="sec_title">免费在线绘图</h2>
          <img src="../assets/images/intro-2.png" class="intro-pic" />
        </div>
        <div class="swiper-slide slide_item">
          <h2 class="sec_title">高效易用</h2>
          <img src="../assets/images/intro-3.png" class="intro-pic" />
        </div>
        <div class="swiper-slide slide_item">
          <h2 class="sec_title">轻松绘制</h2>
          <img src="../assets/images/intro-4.png" class="intro-pic" />
        </div>
      </div>
      <div class="swiper-pagination" ref="pagination"></div>
    </div>
  </div>
</template>

<script>
import Swiper from 'swiper'
import 'swiper/dist/css/swiper.min.css'

export default {
  name: 'introduction',
  mounted () {
    this.init()
  },
  methods: {
    init () {
      /* eslint-disable no-new */
      new Swiper(this.$refs.slider, {
        pagination: this.$refs.pagination,
        paginationClickable: true,
        mousewheel: true,
        centeredSlides: true,
        autoplay: 2500,
        direction: 'vertical'
      })
    }
  }
}
</script>

<style scoped>
  .main_content{
    /*width: 100%;*/
    /*height: 100%;*/
  }
 .swiper-container{
   height: 100%;
   /*width: 100%;*/
 }
 .slide_item{
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
 }
  .title{
    font-size: 34px;
    margin: 0;
    line-height: 48px;
    color: #555;
    font-weight: bold;
  }
  .subtitle{
    font-size: 18px;
    line-height: 28px;
    color: #888;
    margin: 10px 0 10px;
  }
  .sec_title{
    font-size: 25px;
    margin: 0;
    line-height: 48px;
    color: #555;
    font-weight: bold;
  }
  .intro-pic{
    margin: 10px auto;
  }
</style>
