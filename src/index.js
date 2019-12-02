import Vue from 'vue';
import App from './components/app.vue';
import VueContentPlaceholders from 'vue-content-placeholders'

Vue.use(VueContentPlaceholders)

new Vue({ render: createElement => createElement(App) }).$mount('#app');