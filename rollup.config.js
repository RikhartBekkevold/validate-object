const commonjs = require('@rollup/plugin-commonjs')
const { terser } = require('rollup-plugin-terser')
const { author, license, version, name } = require('./package.json')
// can i mix import?
// replace export for better rollup
const camelizedName = name.replace(/-(\w)/g, (_, char) => char ? char.toUpperCase() : '')
const licenseText = "/* " + name + ".js - copyright " + author + ". " + license + " license. Version " + version + ". */"

module.exports = {
  input: 'src/index.js',
  output: [
    {
      format: 'umd',
      name: camelizedName,
      file: "dist/"+name+".js",
      banner: licenseText
    },
    {
      format: 'umd',
      name: camelizedName,
      file: 'dist/'+name+'.min.js',
      banner: licenseText,
      plugins: [
        terser({
          format: {
            comments: function(node, comment) {
              var isMultiline = comment.type === "comment2"
              if (isMultiline)
                return /MIT license/.test(comment.value)
            }
          }
        })
      ]
    }
  ],
  plugins: [
    commonjs()
  ]
}
