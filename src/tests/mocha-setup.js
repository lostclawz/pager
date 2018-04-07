require('babel-core/register')({
	presets: [ "env", "react" ],
	plugins: [
		"transform-class-properties",
      	"transform-decorators-legacy",
      	"transform-object-rest-spread",
      	"transform-es2015-destructuring"
  	]
});
var configure = require('enzyme').configure;
var Adapter = require('enzyme-adapter-react-16');
configure({ adapter: new Adapter() });