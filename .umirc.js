// ref: https://umijs.org/config/
export default {
  treeShaking: true,
  routes: [
    {
      path: '/',
      component: '../pages/index'
    }
  ],
  externals: {
    'AMap': 'window.AMap',
  },
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    ['umi-plugin-react', {
      antd: false,
      dva: true,
      dynamicImport: false,
      title: 'amap',
      dll: false,
      hd: true,
      chunks: ['umi'],
      fastClick: true,
      routes: {
        exclude: [
          /models\//,
          /services\//,
          /model\.(t|j)sx?$/,
          /service\.(t|j)sx?$/,
          /components\//,
        ],
      },
    }],
  ],
  extraBabelPlugins: [
    ['import', { libraryName: 'antd-mobile', style: true }],
  ]
};
