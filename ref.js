var async = require('async');
var util = require("./util.js");

var Ref = module.exports = function Ref(fee) {	
	this._fee = fee;	
}