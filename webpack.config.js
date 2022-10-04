import webpack from "webpack";
import path from "path";
import WebpackAssetsManifest from "webpack-assets-manifest";
import CompressionPlugin from "compression-webpack-plugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { resolve } from 'node:path';

export default (env, argv) => {
  const isProductionMode = argv.mode === "production";

  return {
    entry: {
      client: ["./src/index.tsx"],
    },
    mode: isProductionMode ? "production" : "development",
    target: ["web", "es5"],
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          include: resolve("./src"),
          use: {
            loader: "babel-loader",
            options: {
              cacheDirectory: true,
              cacheCompression: false,
            },
          },
        },
        {
          test: /\.(sa|sc|c)ss$/i,
          use: ["style-loader", "css-loader", "sass-loader"],
        },
      ],
      strictExportPresence: true,
    },
    resolve: {
      extensions: [".js", ".jsx", ".ts", ".tsx"],
      alias: {
        process: "process/browser",
        "@": resolve("./src"),
        components: resolve("./src/components"),
        hooks: resolve("./src/Hooks"),
        resources: resolve("./src/Resources"),
        schema: resolve("./src/Schema"),
        types: resolve("./src/types"),
        utils: resolve("./src/utils"),
        spec: resolve("./spec/javascripts"),
        "spec-utils": resolve("./spec/javascripts/utils"),
        "spec-resources": resolve("./spec/javascripts/Resources"),
      },
      fallback: {
        crypto: false,
      },
    },
    output: {
      pathinfo: false,
      path: resolve("dist"),
      filename: isProductionMode ? "[name]-[contenthash].js" : "[name].js",
      chunkFilename: isProductionMode
        ? "[name]-[contenthash].chunk.js"
        : "[name].chunk.js",
      sourceMapFilename: isProductionMode
        ? "[name]-[contenthash].chunk.js.map"
        : "[name].chunk.js.map",
    },
    optimization: {
      moduleIds: isProductionMode ? "deterministic" : "named",
      runtimeChunk: "single",
      splitChunks: {
        chunks: "async",
        minSize: 20000,
        minRemainingSize: 0,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        enforceSizeThreshold: 50000,
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
            chunks: "all",
            enforce: true,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/index.html",
      }),
      new webpack.ProvidePlugin({
        process: "process/browser",
        React: "react",
        moment: "moment",
      }),
      new WebpackAssetsManifest({
        output: "webpack-manifest.json",
        entrypoints: true,
      }),
      ...(isProductionMode
        ? [new CompressionPlugin()]
        : [
            new ForkTsCheckerWebpackPlugin({
              typescript: {
                memoryLimit: 4096,
                mode: "write-references",
                configFile: resolve("tsconfig.json"),
              },
            }),
            new ReactRefreshWebpackPlugin({
              overlay: false,
            }),
          ]),
    ],
    externals: {
      jquery: "jQuery",
    },
    devtool: isProductionMode ? "source-map" : "eval-source-map",
    watchOptions: {
      aggregateTimeout: 50,
      ignored: ["**/node_modules"],
    },
    devServer: {
      hot: true,
      port: 3050,
      static: "./public",
      headers: { "Access-Control-Allow-Origin": "*" },
      allowedHosts: "all",
      bonjour: true,
    },
    stats: isProductionMode ? undefined : "minimal",
  };
};
