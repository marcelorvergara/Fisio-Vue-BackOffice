import Vue from 'vue'
import App from './App.vue'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import VueRouter from 'vue-router'
import { routes } from './router'
import { store } from './store/index'
import firebase from 'firebase/app'
import 'firebase/auth';
import 'firebase/firestore';
import VueBootstrapTypeahead from 'vue-bootstrap-typeahead'

Vue.use(BootstrapVue)
Vue.use(IconsPlugin)
Vue.use(VueRouter)
const router = new VueRouter({
  routes,
  mode:'history',
  base: process.env.BASE_URL
})
Vue.component('vue-bootstrap-typeahead', VueBootstrapTypeahead)
Vue.config.productionTip = false

const firebaseConfig = {

};
firebase.initializeApp(firebaseConfig);
//emulador local
firebase.auth().useEmulator('http://localhost:9099/');
firebase.auth().onAuthStateChanged(user => {
  store.dispatch("fetchUser", user);
});

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
