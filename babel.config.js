module.exports = (api) => {
  api.cache.using(() => process.env.NODE_ENV);

  return {
    presets: [
      [
        "@babel/preset-env",
        {
          targets: { node: "current", browsers: "since 2015" },
          useBuiltIns: "entry",
          corejs: "3.6"
        }
      ],
      "@babel/preset-react",
      "@babel/preset-typescript"
    ],
    plugins: [
      [
        "@babel/plugin-proposal-decorators",
        {
          legacy: true
        }
      ],
      api.env("development") && "react-refresh/babel"
    ].filter(Boolean)
  };
};
