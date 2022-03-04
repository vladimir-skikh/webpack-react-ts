const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserWebpackPlugin = require('terser-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

// Получение системной переменной режима сборки
const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

const optimization = () => {
  let config = {
    splitChunks: { // Соединение чанков
      chunks: 'all'
    }
  };

  if (isProd) {
    config['minimizer'] = [ // Минификация
      new TerserWebpackPlugin(),
      new CssMinimizerPlugin()
    ];
  };

  return config;
};

// Настройки babel с пресетами
const babelOptions = (...extraPresets) => {
  const options = {
    presets: [ // Пресеты с плагинами для babel
      '@babel/preset-env',
      ...extraPresets
    ],
    plugins: [
      '@babel/plugin-proposal-class-properties'
    ]
  }

  return options;
}

// Настройка имени выходного файла
const fileName = (ext) => isDev ? `[name].${ext}` : `[name].[hash].${ext}`;

module.exports = {

  // Корень резолва путей
  context: path.resolve(__dirname, 'src'), 

  // Режим работы
  mode: 'development', 

  // Входные чанки (ключ - путь)
  entry: { 
    main: ['@babel/polyfill', './index.tsx'],
  },

  // Выходные бандлы 
  output: { 
    filename: fileName('js'), // Имя с паттерном 
    path: path.resolve(__dirname, 'dist') // Путь для выходного бандла
  },

  // Настройка резолва 
  resolve: {
    // Какие расширения пинимать по умолчанию
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],

    // Алиасы для путей
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  },

  // Оптимизация
  optimization: optimization(),

  // Настройки инструментов разработки
  devtool: isDev ? 'source-map' : undefined,

  // Сервер разработки
  devServer: {
    port: 4200, // Порт
    hot: isDev
  },

  // Плагины - массив инстансав
  plugins: [ 
    new HtmlWebpackPlugin({ // Настройки плагина 
      template: './index.html',
      minify: {
        collapseWhitespace: !isProd
      }
    }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: fileName('css'),
    }),
  ],

  // Лоадеры - добавление функционалов для других типов файлов
  module: { // Настройки лоадеров
    rules: [ // Правила для активации лоадеров
      {
        test: /\.ts|.tsx/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: babelOptions(
              '@babel/preset-react',
              '@babel/preset-typescript', 
            ),
          },
          {
            loader: 'ts-loader'
          }
        ]
      },
      {
        test: /\.js|.jsx/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: babelOptions('@babel/preset-react'),
        }
      },
      {
        test: /\.css$/, // Что ищем - регулярка
        use: [ // Что используем - лоадеры, идем справа-налево/снизу-вверх
          {
            loader: MiniCssExtractPlugin.loader,
            options: {}
          }, 
          'css-loader'
        ]
      },
      {
        test: /\.(png|jpg|svg|gif)$/,
        use: ['file-loader']
      }
    ]
  }
}