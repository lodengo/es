var async = require('async');

var ElasticSearchClient = require('elasticsearchclient');

var es = new ElasticSearchClient({
	hosts : [ {
		host : 'localhost',
		port : 9200
	} ]
});

var db = exports.db = function db(){
	
};

db.exec = function(api){	 
	//console.log(arguments);
	var args = ['budget'];	
	var i = 1;
	for(; i < arguments.length-1; i++){
		args.push(arguments[i]);
	}
	var callback = arguments[i];
	args.push(function(err, data){
		callback(err, JSON.parse(data));
	});
	
	es[api].apply(es, args);
}

// Compute the intersection of n arrays
Array.prototype.intersect = function() {
	if (!arguments.length)
		return [];
	var a1 = this;
	var a = a2 = null;
	var n = 0;
	while (n < arguments.length) {
		a = [];
		a2 = arguments[n];
		var l = a1.length;
		var l2 = a2.length;
		for (var i = 0; i < l; i++) {
			for (var j = 0; j < l2; j++) {
				if (a1[i] === a2[j])
					a.push(a1[i]);
			}
		}
		a1 = a;
		n++;
	}
	return a.unique();
};

// Return new array with duplicate values removed
Array.prototype.unique = function() {
	var a = [];
	var l = this.length;
	for (var i = 0; i < l; i++) {
		for (var j = i + 1; j < l; j++) {
			// If this[i] is found later in the array
			if (this[i] === this[j])
				j = ++i;
		}
		a.push(this[i]);
	}
	return a;
};

// Return elements which are in A but not in arg0 through argn
Array.prototype.diff = function() {
	var a1 = this;
	var a = a2 = null;
	var n = 0;
	while (n < arguments.length) {
		a = [];
		a2 = arguments[n];
		var l = a1.length;
		var l2 = a2.length;
		var diff = true;
		for (var i = 0; i < l; i++) {
			for (var j = 0; j < l2; j++) {
				if (a1[i] === a2[j]) {
					diff = false;
					break;
				}
			}
			diff ? a.push(a1[i]) : diff = true;
		}
		a1 = a;
		n++;
	}
	return a.unique();
};

Array.prototype.random = function() {
	var len = this.length;
	var idx = Math.floor(Math.random() * len);
	return this[idx];
};

Array.prototype.shuffle = function() {
	var o = this;
	for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x)
		;
	return o;
};
// //////////////////////////////////////////////////
// 费用表达式引用关系
exports.refReg = new RegExp([ 'f', 'c', 'cf', 'cc', 'ccf', 'cs', 'csf', 'cas' ]
		.join('\\([^\\)]*\\)|')
		+ '\\([^\\)]*\\)', 'g');

// 费用表达式--计算扩展 see:
// https://github.com/josdejong/mathjs/blob/master/docs/extend.md
exports.math_extend = {
	sum : function(args) {
		var total = 0;
		var argsArray = arguments;
		Object.keys(argsArray).forEach(function(key) {
			total += argsArray[key];
		});
		return total;
	}
};