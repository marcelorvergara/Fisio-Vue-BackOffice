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
:root{
  --corOk: #ffffff;
  --corFa: #ff0000;
  --cor0: #00753A;
  --cor1: #009E47;
  --cor2: #16DD36;
  --cor3: #0052A5;
  --cor4: #0079E7;
  --cor5: #06A9FC;
  --cor6: #681E7E;
  --cor7: #BD7AF6;
  --cor8: #FF7435;
  --cor9: #FFA135;
  --cor10: #FFCB35;
  --cor11: #FFF735;
}

.change::-webkit-input-placeholder {
  /* WebKit, Blink, Edge */
  color: #909;
}
.change:-moz-placeholder {
  /* Mozilla Firefox 4 to 18 */
  color: #909;
  opacity: 1;
}
.change::-moz-placeholder {
  /* Mozilla Firefox 19+ */
  color: #909;
  opacity: 1;
}
.change:-ms-input-placeholder {
  /* Internet Explorer 10-11 */
  color: #909;
}
input[type="date"]{
  color: #42B395;
}
#valor{
  color: #42B395;
}
</style>
