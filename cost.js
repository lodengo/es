var async = require('async');
var util = require("./util.js");
var Fee = require("./fee.js");
var db = require("./db.js");

var Cost = module.exports = function Cost(_doc) {
	this._doc = _doc;
}

Object.defineProperty(Cost.prototype, 'id', {
	get : function() {
		return this._doc._id;
	}
});

Object.defineProperty(Cost.prototype, 'parentId', {
	get : function() {
		return this._doc._source['parentId'];
	}
});

Object.defineProperty(Cost.prototype, 'idPath', {
	get : function() {
		return this._doc._source['idPath'];
	}
});

Object.defineProperty(Cost.prototype, 'type', {
	get : function() {
		return this._doc._source['type'];
	}
});

//fees need rebuild ref on create: fees of cost && parent fees with cc && sibling fees with cs
Cost.prototype.feesToBuildRefOnCreate = function(callback){
	var me = this;
	var costId = me.id;
	var type = me.type;
	var parentId = me.parentId;
	db.getFeesToBuildRefOnCostCreate(costId, type, parentId, function(err, fees){	
		async.map(fees, function(nfee, cb){cb(null, new Fee(nfee));}, callback);			
	});
};

Cost.prototype.createFee = function(data, feeParentId, callback){
	var me = this;
	var costId = me.id
	var costType = me.type;
	var costParentId = me.parentId;
	
	Fee.create(data, costId, costType, costParentId, feeParentId, callback);
}

Cost.get = function(id, callback){
	db.getCost(id, function(err,doc){
		callback(err, new Cost(doc));
	});
}

Cost.create = function(data, parentId, callback){
	var me = this;		
	if(parentId){
		me.get(parentId, function(err, parent){
			data.parentId = parentId;
			data.idPath = parent.idPath + ',' + parent.id;
			db.insertCost(data, function(err, data){
				me.get(data._id, callback);
			});
		});
	}else{
		data.parentId = '';
		data.idPath = '';
		db.insertCost(data, function(err, data){
			me.get(data._id, callback);
		});
	}	
}