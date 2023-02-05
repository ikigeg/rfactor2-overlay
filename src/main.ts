import { createApp } from "vue";
import { createPinia } from "pinia";
// import svgJS from "./plugins/svgjs";

import App from "./App.vue";
import router from "./router";

import "./assets/main.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);
// app.use(svgJS);

app.mount("#app");
