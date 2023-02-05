import svgJS from "@svgdotjs/svg.js";

export default {
  install: (Vue: any) => {
    Vue.prototype.$svg = svgJS;
  },
};
// export default {
//     install: (app, options) => {
//       // Plugin code goes here
//     }
//   }
