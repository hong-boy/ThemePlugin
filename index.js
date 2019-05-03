const less = require('less');
const CleanCssPlugin = require('less-plugin-clean-css');
const fs = require('fs');
const merge = require('lodash/merge');

class ThemePlugin {
  constructor(options) {
    const defaulOptions = {
      filename: 'day.css',
      mainLess: './node_modules/antd/dist/antd.less',
      lessOptions: {
        paths: ['./node_modules/antd/lib'],
        javascriptEnabled: true,
        modifyVars: {},
        plugins: [
          new CleanCssPlugin({ advanced: true }),
        ],
      }
    };
    this.options = merge(defaulOptions, options);
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync('ThemePlugin', (compilation, callback) => {
      const { filename, mainLess, lessOptions } = this.options;
      try {
        less
        .render(fs.readFileSync(mainLess).toString(), lessOptions)
        .then((res) => {
          const file = res.css;
          compilation.assets[filename] = {
            source() {
              return file;
            },
            size() {
              return file.length;
            },
          };
          callback();
        })
        .catch((e) => {
          callback(e);
        });
      } catch (err) {
        callback(err);
      }
    });
  }
}

module.exports = ThemePlugin;
