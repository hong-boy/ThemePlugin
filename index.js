const less = require("less");
const CleanCssPlugin = require("less-plugin-clean-css");
const NpmImportPlugin = require("less-plugin-npm-import");
const fs = require("fs");
const { merge, isString } = require("lodash");
const rucksack = require("rucksack-css");
const autoprefixer = require("autoprefixer");
const postcss = require("postcss");

const postcssConfig = {
  plugins: [
    rucksack(),
    autoprefixer({
      browsers: ["last 2 versions", "Firefox ESR", "> 1%", "ie >= 9", "iOS >= 8", "Android >= 4"]
    })
  ]
};

function handleMainLess(mainLess) {
  let content = "";
  [].concat(mainLess).forEach(filePath => {
    content += fs.readFileSync(filePath, "utf-8");
    content = content.replace(/^\uFEFF/, "");
    content += "\n";
  });
  return content;
}

class ThemePlugin {
  constructor(options) {
    const defaulOptions = {
      filename: "day.css",
      // mainLess: './node_modules/antd/dist/antd.less',
      mainLess: ["./node_modules/antd/lib/style/index.less", "./node_modules/antd/lib/style/components.less"],
      lessOptions: {
        paths: ["./node_modules/antd/lib"],
        javascriptEnabled: true,
        modifyVars: {},
        plugins: [new CleanCssPlugin({ advanced: true }), new NpmImportPlugin({ prefix: "~" })]
      }
    };
    this.options = merge(defaulOptions, options);
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync("ThemePlugin", (compilation, callback) => {
      const { filename, mainLess, lessOptions } = this.options;
      try {
        let data = handleMainLess(mainLess);
        less
          .render(data, lessOptions)
          .then(result => postcss(postcssConfig.plugins).process(result.css, { from: undefined }))
          .then(res => {
            const file = res.css;
            compilation.assets[filename] = {
              source() {
                return file;
              },
              size() {
                return file.length;
              }
            };
            callback();
          })
          .catch(e => {
            callback(e);
          });
      } catch (err) {
        callback(err);
      }
    });
  }
}

module.exports = ThemePlugin;
