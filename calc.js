var async = require('async');
var math = require('mathjs')();
var util = require("./util.js");
var TopoSort = require("./topsort.js");
var Fee = require("./fee.js");	

math.import(util.math_extend);

var Calc = module.exports = function Calc(fee) {	
	this._fee = fee;		
}