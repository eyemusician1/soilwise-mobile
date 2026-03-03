module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Keep the decorators plugin, but remove the class-properties plugin!
      ['@babel/plugin-proposal-decorators', { legacy: true }]
    ],
  };
};