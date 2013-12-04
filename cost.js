var async = require('async');
var util = require("./util.js");
var Fee = require("./fee.js");

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

//fees may ref me and my fees 
Cost.prototype.feesMayRefMeAndMyfees = function(callback){
	var me = this;
	var costId = me.id;
	var type = me.type;
	util.query(util.cypher.cost_fees, {id: costId}, function(err, myfees){
		util.query(util.cypher.parent_ref_fees, {id: costId, type:type}, function(err, parentfees){
			util.query(util.cypher.sibling_ref_fees, {id: costId}, function(err, siblingfees){
				//util.query(util.cypher.descendant_ref_fees, {id: costId}, function(err, descendantfees){
					var fees = myfees.concat(parentfees, siblingfees);//, descendantfees);
					fees = fees.unique();
					async.map(fees, function(nfee, cb){cb(null, new Fee(nfee));}, callback);
				//});
			});
		});
	});
};

Cost.prototype.createFee = function(data, feeParentId, callback){
	var me = this;
	var costId = me.id
	var costType = me.type;
	Fee.create(data, costId, costType, feeParentId, callback);
}

Cost.get = function(id, callback){
	util.exec('get', 'cost', id, function(err,doc){
		callback(err, new Cost(doc));
	});
}

Cost.create = function(data, parentId, callback){
	var me = this;		
	if(parentId){
		me.get(parentId, function(err, parent){
			data.parentId = parentId;
			data.idPath = parent.idPath + ',' + parent.id;
			util.exec('index', 'cost', data, function(err, data){
				me.get(data._id, callback);
			});
		});
	}else{
		data.parentId = '';
		data.idPath = '';
		util.exec('index', 'cost', data, function(err, data){
			me.get(data._id, callback);
		});
	}	
}