import Vue from 'vue';
import App from './components/app.vue';

new Vue({ render: createElement => createElement(App) }).$mount('#app');