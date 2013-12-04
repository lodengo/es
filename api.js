var async = require('async');
var Cost = require("./cost.js");
var Fee = require("./fee.js");
var Calc = require("./calc.js");
var util = require("./util.js");

var Api = module.exports = function Api() {

}

//////////////////////////////////////////////////////////
Api.createCost = function(data, fees, parentId, callback) {
	var me = this;
	Cost.create(data, parentId, function(err, cost) {		
		async.each(fees, function(fee, cb) {
			cost.createFee(fee, null, cb);
		}, function(err) {
			callback(err, cost);				
//			cost.feesMayRefMeAndMyfees(function(err, fees){
//				async.map(fees, function(fee, cb){	
//					//build ref					
//					fee.buildRef(function(err, res){
//						cb(err, fee.id);
//					});
//				}, function(err, ids){
//					//calc
//					Calc.start(ids, function(err, res){callback(err, cost);});
//				});
//			});			
		});
	});
}

Api.updateCost = function(id, key, value, callback){
	Cost.get(id, function(err, cost){
		cost.update(key, value, function(err, res){
			if(!err && res == 0){ //value not change, do nothing
				callback(null, null);
			}else{
				//callback(null, null);				
				cost.feesMayRefProp(key, function(err, fees){
					async.map(fees, function(fee, cb){	
						//build ref
						fee.buildRef(function(err, res){
							cb(err, fee.id);
						});
					}, function(err, ids){
						//calc
						Calc.start(ids, callback);
					});
				})
			}
		})
	});	
}

Api.deleteCost = function(id, callback){
	Cost.get(id, function(err, cost){
		cost.feesMayRefFromParentAndSibling(function(err, fees){
			cost.del(function(err, res){
				//callback(null, null);				
				async.map(fees, function(fee, cb){	
					//build ref
					fee.buildRef(function(err, res){
						cb(err, fee.id);
					});
				}, function(err, ids){
					//calc
					Calc.start(ids, callback);
				});
			});
		});
	});
}

Api.createFee = function(data, costId, parentId, callback){
	Cost.get(id, function(err, cost){
		cost.createFee(data, parentId, function(err, fee){
			fee.feesMayRefMe(function(err, fees){
				fees.concat(fee);
				//callback(null, null);
				async.map(fees, function(fee, cb){	
					//build ref
					fee.buildRef(function(err, res){
						cb(err, fee.id);
					});
				}, function(err, ids){
					//calc
					Calc.start(ids, callback);
				});
				
			});
		});
	});	
}

Api.updateFee = function(id, key, value, callback){
	Fee.get(id, function(err, fee){
		fee.update(key, value, function(err, res){
			if(!err && res == 0){ //value not change, do nothing
				callback(null, null);
			}else{
				//callback(null, null)				
				if(key != 'feeExpr'){
					var feeExpr = fee.feeExpr;
					var regex = 'f\\(' + key + '\\)';
					if(feeExpr.match(regex) ){
						fee.buildRef(function(err, res){
							Calc.start(id);
						});
					}					
				}else{
					fee.buildRef(function(err, res){
						Calc.start(id, callback);
					});
				}				
			}
		})
	});	
}

Api.deleteFee = function(id, callback){
	Fee.get(id, function(err, fee){
		fee.feesMayRefMe(function(err, fees){
			fee.del(function(err, res){
				//callback(null, null);				
				async.map(fees, function(fee, cb){	
					//build ref
					fee.buildRef(function(err, res){
						cb(err, fee.id);
					});
				}, function(err, ids){
					//calc
					Calc.start(ids, callback);
				});
			});
		});
	});
}