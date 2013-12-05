var async = require('async');
var Ref = require("./ref.js");
var util = require("./util.js");
var db = require("./db.js");

var Fee = module.exports = function Fee(_doc) {
	this._doc = _doc;	
}

Object.defineProperty(Fee.prototype, 'id', {
	get : function() {
		return this._doc._id;
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

Object.defineProperty(Fee.prototype, 'costParentId', {
	get : function() {
		return this._doc._source['costParentId'];
	}
});

Object.defineProperty(Fee.prototype, 'costType', {
	get : function() {
		return this._doc._source['costType'];
	}
});

Fee.get = function(id, callback){
	db.getFee(id, function(err,doc){
		callback(err, new Fee(doc));
	});
}

Fee.prototype.createRefTo = function(toIds, callback){	
	var fromFeeId = this.id;
	var fromCostId = this.costId;
	db.createRefsTo(fromCostId, fromFeeId, toIds, callback);		
}

Fee.prototype.removeRefsTo = function(toIds, callback){
	var fromFeeId = this.id;
	db.removeRefsTo(fromFeeId, toIds, callback);	
}

Fee.prototype.refedToIds = function(callback){
	var fromFeeId = this.id;
	db.getRefedToIdsOfFee(fromFeeId, callback);	
}

Fee.prototype.refToIdsByExpr = function(callback){
	var me = this;
	var ref = new Ref(me);
	ref.refToIdsByExpr(function(err, nodes){
		callback(err, nodes);
	});
}

Fee.prototype.buildRef = function(callback){
	var me = this;
	me.refedToIds(function(err, refedToIds){ 
		me.refToIdsByExpr(function(err, refToIdsByExpr){	
			//console.log(['ref', me.costType, me.feeName, refedToIds, refToIdsByExpr]);
			me.removeRefsTo(refedToIds.diff(refToIdsByExpr), function(err){
				me.createRefTo(refToIdsByExpr.diff(refedToIds), callback);
			});
		});
	});
}

Fee.create = function(data, costId, costType, costParentId, parentId, callback){
	var me = this;
	var childFees = data.fee || [];
	delete data.fee;
	
	data.parentId = parentId;
	data.costId = costId;	
	data.costType = costType;
	data.costParentId = costParentId;
		
	db.insertFee(data, function(err, data){
		var id = data._id;
		async.each(childFees, function(cfee, cb){
			me.create(cfee, costId, costType, costParentId, id, cb);
		}, function(err){
			me.get(id, callback);
		});	
	});	
}