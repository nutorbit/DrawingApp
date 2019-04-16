const KerasJS = require('keras-js')
const Model = require('keras-js').Model

var connect = require('connect');
var serveStatic = require('serve-static');

var $ = require("jquery");

connect().use(serveStatic(__dirname)).listen(8080, function() {
    console.log('in http://localhost:8080/');
});
