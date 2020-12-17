<template>
  <div>
    <router-view></router-view>
  </div>
</template>

<script>


export default {
  name: 'App',
  components: {

  }
}
</script>

<style lang="scss">
@import "./styles/custom-bootstrap";
@import '~bootstrap/dist/css/bootstrap.css';
@import '~bootstrap-vue/dist/bootstrap-vue.css';
@import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@500&display=swap');
body{
  background-color: #BDF8A3;
  font-family: 'Work Sans', sans-serif;
}
</style>
