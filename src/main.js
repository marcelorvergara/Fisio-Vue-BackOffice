import Vue from 'vue'
import App from './App.vue'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import VueRouter from 'vue-router'
import { routes } from './router'
import { store } from './store/index'
import { initBackend } from "@/initBackend";
import { connDb } from "@/store/connDb";
import VueTypeaheadBootstrap from 'vue-typeahead-bootstrap'

Vue.use(BootstrapVue)
Vue.use(IconsPlugin)
Vue.use(VueRouter)
Vue.use(initBackend)

const router = new VueRouter({
  routes,
  mode:'history',
  base: process.env.BASE_URL
})
Vue.component('vue-typeahead-bootstrap', VueTypeaheadBootstrap)
Vue.config.productionTip = false

connDb.methods.connDbAuth().onAuthStateChanged(user => {
  store.dispatch('fetchUser', user);
});

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
