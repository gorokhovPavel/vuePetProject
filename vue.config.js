const path = require("path");

module.exports = {
  chainWebpack: config => {
    config.resolve.alias
      .set(
        "@mapbox/mapbox-gl-draw/js",
        path.resolve("node_modules/mapbox-gl-draw/dist/mapbox-gl-draw.js")
      )
      .set(
        "@mapbox/mapbox-gl-draw/css",
        path.resolve("node_modules/mapbox-gl-draw/dist/mapbox-gl-draw.css")
      )
      .set("@kpmgFont", path.resolve("public/cdn/scripts/kpmgFont.js"));
  },
  publicPath: "./"
};
