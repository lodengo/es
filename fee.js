var async = require('async');
var Ref = require("./ref.js");
var util = require("./util.js");


var Fee = module.exports = function Fee(_doc) {
	this._doc = _doc;
}

Object.defineProperty(Fee.prototype, 'id', {
	get : function() {
		return this._doc.id;
	}
});

Object.defineProperty(Fee.prototype, 'parentId', {
	get : function() {
		return this._doc._source['parentId'];
	}
});

Object.defineProperty(Fee.prototype, 'feeName', {
	get : function() {
		return this._doc._source['feeName'];
	}
});

Object.defineProperty(Fee.prototype, 'feeExpr', {
	get : function() {
		return this._doc._source['feeExpr'];
	}
});

Object.defineProperty(Fee.prototype, 'feeResult', {
	get : function() {
		return this._doc._source['feeResult'];
	},
	set: function (result) {
		this._doc._source['feeResult'] = result;
	}
});

Object.defineProperty(Fee.prototype, 'costId', {
	get : function() {
		return this._doc._source['costId'];
	}
});

Object.defineProperty(Fee.prototype, 'costType', {
	get : function() {
		return this._doc._source['costType'];
	}
});

Fee.get = function(id, callback){
	util.exec('get', 'fee', id, function(err,doc){
		callback(err, new Fee(doc));
	});
}

Fee.create = function(data, costId, costType, parentId, callback){
	var me = this;
	var childFees = data.fee || [];
	delete data.fee;
	
	data.parentId = parentId;
	data.costId = costId;	
	data.costType = costType;
	
	util.exec('index', 'fee', data, function(err, data){
		var id = data._id;
		async.each(childFees, function(cfee, cb){
			me.create(cfee, costId, costType, id, cb);
		}, function(err){
			me.get(id, callback);
		});	
	});	
}