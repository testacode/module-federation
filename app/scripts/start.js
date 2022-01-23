const rewire = require('rewire');
const defaults = rewire('react-scripts/scripts/start.js');
const webpackConfig = require('react-scripts/config/webpack.config');

const { resolve } = require("path");
const { ModuleFederationPlugin } = require("webpack").container;

const processPath = process.cwd();
const PKG_JSON_FILE = resolve(processPath, "package.json");

/**
 * Extract all the information from the package.json file
 */
const {
  name: packageName,
  shared = [],
  remotes = [],
  exposes = [],
  dependencies: deps
// eslint-disable-next-line import/no-dynamic-require
} = require(PKG_JSON_FILE);

/**
 * Camelize given string
 * @returns string
 * @param str string
 */
const camelize = (str) =>
  str.replace(/^\w|[A-Z]|-|\b\w|\s+/g, (match, index) => {
    if (match === " " || match === "-") return "";
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
const PACKAGE_NAME = camelize(packageName);

/**
 * Add version to the shared libraries based on your dependencies
 */
const sharedWithVersions = Object.fromEntries(
  Object.entries(shared).map(([depName, depData]) => [
    depName,
    { ...depData, requiredVersion: deps[depName] },
  ])
);

//In order to override the webpack configuration without ejecting the create-react-app
defaults.__set__('configFactory', (webpackEnv) => {
  let config = webpackConfig(webpackEnv);

  //Customize the webpack configuration here, for reference I have updated webpack externals field
  config.plugins = [
    ...config.plugins,
    new ModuleFederationPlugin({
      name: PACKAGE_NAME,
      filename: "remoteEntry.js",
      exposes,
      shared: sharedWithVersions,
      remotes,
    }),
  ];

  return config;
});
