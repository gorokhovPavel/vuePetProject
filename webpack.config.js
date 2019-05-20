//npm rebuild node-sass --force
var path    = require('path')
var webpack = require('webpack')

module.exports = {
  
  entry : {

    app : [ 'babel-polyfill', './src/main.js' ]
  },
  
  output: {

    path       : path.resolve(__dirname, './dist'),
    publicPath : process.env.NODE_ENV === 'production' ? '../client/dist/' : '/dist/',
    filename   : 'build.js'
  },

  module: {

    rules: [
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ],
      },
      {
        test: /\.scss$/, 
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader'
        ],
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            'scss': [
              'vue-style-loader',
              'css-loader',
              'sass-loader'
            ]
          }
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|svg|jpeg|ico|PNG|mp4|wmv|woff|woff2|eot|ttf|otf)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  },
  
  resolve: {

    modules    : ['src', 'node_modules'],
    extensions : ['*', '.js', '.vue', '.json'],
    alias : {
      
      'vue$'                       : 'vue/dist/vue.esm.js',
      '@mapbox/mapbox-gl-draw/js'  : path.resolve('node_modules/mapbox-gl-draw/dist/mapbox-gl-draw.js'),
      '@mapbox/mapbox-gl-draw/css' : path.resolve('node_modules/mapbox-gl-draw/dist/mapbox-gl-draw.css'),
    },
  },

  devServer: {
    historyApiFallback: true,
    noInfo: true,
    overlay: true
  },
  performance: {
    hints: false
  },
  devtool: '#eval-source-map'
}

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        
        NODE_ENV: '"production"',
        serverHost : '"https://www.sitesurveyor.ru/Server"' 
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ])
} else {

  module.exports.devtool = '#source-map'
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        
        NODE_ENV   : '"development"', 
        serverHost : '"http://localhost:54512"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ])
}