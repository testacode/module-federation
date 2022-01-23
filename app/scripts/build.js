const rewire = require('rewire');
const defaults = rewire('react-scripts/scripts/build.js');

//In order to override the webpack configuration without ejecting the create-react-app
const config = defaults.__get__('config');

//Customize the Webpack configuration here,  for reference I have updated Webpack externals field
console.log('build: ', { config });
