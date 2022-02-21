import path from 'path';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import webpack, { Configuration as WebpackConfiguration } from 'webpack';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';
//ts 검사할 때 블로킹 식으로 검사(블로킹은 다음 동작 막음)fork를 하면 타입체킹이랑 웹팩 실행이랑 동시에 돌아가게 함
// import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

interface Configuration extends WebpackConfiguration {
  devServer?: WebpackDevServerConfiguration;
}

const isDevelopment = process.env.NODE_ENV !== 'production';

const config: Configuration = {
  name: 'webpack-setting',
  mode: isDevelopment ? 'development' : 'production',
  devtool: !isDevelopment ? 'hidden-source-map' : 'eval', //hidden-source-map이 배포 모드이고 eval이 개발 모드이다
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'], //babel이 처리할 확장자 목록
    alias: {
      '@hooks': path.resolve(__dirname, 'src/hooks'), // ../../.. 없애는 것 ts, 웹팩에 둘 다 설정해야함 ts치는 동안 검사기는
      //tsconfig를 보고 js로 바꿔주는 웹팩은 웹팩설정파일을 보고 바꿈
      //@대신 ~나 없어도 가능(''안에 아무거나 다 되는 듯함)
      '@components': path.resolve(__dirname, 'src/components'),
      '@layouts': path.resolve(__dirname, 'src/layouts'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@typings': path.resolve(__dirname, 'src/typings'),
    },
  },
  entry: {
    app: './src/index.tsx', //이게 메인 파일이 됨
  },
  target: ['web', 'es5'],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                targets: { browsers: ['last 2 chrome versions'] }, //js로 바꿀 때 target에 적힌 브라우저를 지원하게끔 함
                debug: isDevelopment,
              },
            ],
            '@babel/preset-react', //react 바꿔주는 애
            '@babel/preset-typescript', //typescript 바꿔주는 애
          ],
          env: {
            development: {
              plugins: [['@emotion', { sourceMap: true }], require.resolve('react-refresh/babel')],
              //설정까지 같이넣을려면 배열로 넣어서 sourceMap 쓰면 됨
              //emotion을 babel에 연결
              //핫리로딩
            },
            production: {
              plugins: ['@emotion'],
            },
          },
        },
        exclude: path.join(__dirname, 'node_modules'),
      },
      {
        test: /\.css?$/,
        use: ['style-loader', 'css-loader'], //css를 js로 바꾸는 걸 이것들이 함
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      //ts쓸려면 (설명제대로x)
      async: false,
      // eslint: {
      //   files: "./src/**/*",
      // },
    }),
    new webpack.EnvironmentPlugin({ NODE_ENV: isDevelopment ? 'development' : 'production' }),
    //EnvironmentPlugin은 리액트에서 NODE_ENV라는 변수를 사용가능하게 함
    //process.env.NODE_ENV는 백엔드에서만 사용할 수 있는데 Environ~ 사용하면 프런트에서도 NODE_ENV에 접근가능
  ],
  output: {
    //entry에서 loader타고 나온 결과물
    path: path.join(__dirname, 'dist'), //__directory name이 alecture고 alecture에 dist 폴더라서
    filename: '[name].js', //alecture\dist\app]
    //[name]에서 name은 entry 파일 이름
    publicPath: '/dist/',
  },
  devServer: {
    historyApiFallback: true,
    port: 3090,
    devMiddleware: { publicPath: '/dist/' },
    static: { directory: path.resolve(__dirname, 'public') },
    // proxy: {
    //   '/api/': {
    //     target: 'http://localhost:3095',
    //     changeOrigin: true,
    //     ws: true,
    //   },
    // },
  },
};

if (isDevelopment && config.plugins) {
  config.plugins.push(new webpack.HotModuleReplacementPlugin());
  config.plugins.push(
    new ReactRefreshWebpackPlugin({
      overlay: {
        useURLPolyfill: true,
      },
    }),
  );
  // config.plugins.push(new BundleAnalyzerPlugin({ analyzerMode: 'server', openAnalyzer: false }));
}
// if (isDevelopment && config.plugins) {//개발환경일 때 쓰일 플러그인
//   config.plugins.push(new webpack.HotModuleReplacementPlugin());
//   config.plugins.push(new ReactRefreshWebpackPlugin());
//   // config.plugins.push(new BundleAnalyzerPlugin({ analyzerMode: 'server', openAnalyzer: true }));
//   //테스트 할 때만 openAnalyzer: true이고 아닐 때는 항상 false
//   //개발모드일 때는 bundle analyzer가 서버를 따로 띄워서 보이고
// }
if (!isDevelopment && config.plugins) {
  //개발환경 아닐 때 쓰일 플러그인
  // config.plugins.push(new webpack.LoaderOptionsPlugin({ minimize: true }));//요즘은 켜도 거의 영향 없지만 최적화되는 옛날 플러그인들이 있어서 써줌
  // config.plugins.push(new BundleAnalyzerPlugin({ analyzerMode: 'static' }));
  //배포모드일 때는 따로 서버를 띄울 수 없어서 따로 html로 결과를 출력해줌
}

export default config;
