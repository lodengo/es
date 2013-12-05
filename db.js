var ElasticSearchClient = require('elasticsearchclient');

var es = new ElasticSearchClient({
	hosts : [ {
		host : 'localhost',
		port : 9200
	} ]
});

var db = module.exports = function db() {

};

db.exec = function(api) {	
	var args = [ 'budget' ];
	var i = 1;
	for (; i < arguments.length - 1; i++) {
		args.push(arguments[i]);
	}
	var callback = arguments[i];
	args.push(function(err, data) {
		callback(err, JSON.parse(data));
	});

	es[api].apply(es, args);
}

db.getCost = function(id, callback) {
	this.exec('get', 'cost', id, callback);
}

db.insertCost = function(data, callback) {
	this.exec('index', 'cost', data, callback);
}

db.getFee = function(id, callback) {
	this.exec('get', 'fee', id, callback);
}

db.insertFee = function(data, callback) {
	this.exec('index', 'fee', data, callback);
}

db.setFeeResult = function(feeId, result, callback){
	this.exec('update', 'fee', feeId, {doc:{feeResult:result}}, callback);
}

// fees of cost && parent fees with cc() && sibling fees with cs
db.getFeesToBuildRefOnCostCreate = function(costId, type, parentId, callback) {
	var cc = ".*cc.?\\(" + type + ".*";
	var cs = ".*cs.?\\(.*";
	var query = {
		"query" : {
			"constant_score" : {
				"filter" : {
					"or" : [ {
						"term" : {
							"costId" : costId
						}
					}, {
						"and" : [ {
							"term" : {
								"costId" : parentId
							}
						}, {
							"regexp" : {
								"feeExpr" : cc
							}
						} ]
					}, {
						"and" : [ {
							"term" : {
								"parentId" : parentId
							}
						}, {
							"not" : {
								"term" : {
									"costId" : costId
								}
							}
						}, {
							"regexp" : {
								"feeExpr" : cs
							}
						} ]
					} ]
				}
			}
		}
	};
	this.exec('search', 'fee', query, function(err, data) {
		callback(err, data.hits.hits);
	});
}

// remove refs (fromFeeId)-[:ref]->(toIds)
db.removeRefsTo = function(fromFeeId, toIds, callback) {
	var query = {
		"query" : {
			"constant_score" : {
				"filter" : {
					"and" : [ {
						"term" : {
							"fromFeeId" : fromFeeId
						}
					}, {
						"in" : {
							"toId" : toIds
						}
					} ]
				}
			}
		}
	};
	this.exec('deleteByQuery', 'ref', query, callback);
}

// create refs ({fromCostId, fromFeeId})-[:ref]->(toIds)
db.createRefsTo = function(fromCostId, fromFeeId, toIds, callback) {
	var refs = [];
	toIds.forEach(function(toId) {
		refs.push({
			index : {}
		});
		refs.push({
			fromCostId : fromCostId,
			fromFeeId : fromFeeId,
			toId : toId
		});
	});
	es.bulk(refs, {
		_index : 'budget',
		_type : 'ref'
	}, callback);
}

db.getRefedToIdsOfFee = function(fromFeeId, callback) {
	var query = {
		"fields" : [ "toId" ],
		"query" : {
			"constant_score" : {
				"filter" : {
					"term" : {
						"fromFeeId" : fromFeeId
					}
				}
			}
		}
	};
	this.exec('search', 'ref', query, function(err, data) {
		var ids = data.hits.hits.map(function(e) {
			return e.fields.toId;
		});
		callback(err, ids);
	});
}
///////////////////////////////////////////////////////////////
db._C = function(costId, prop, getId, callback){
	var query = {
			"fields" : [prop],
			"query" : {
				"constant_score" : {
					"filter" : {
						"term" : {
							"_id" : costId
						}
					}
				}
			}
		};
	this.exec('search', 'cost', query, function(err, data) {
		var values = data.hits.hits.map(function(e) {
			return getId? e._id : e.fields[prop];
		});
		callback(err, values);
	});
}

db._CF = function(costId, feeName, getId, callback) {
	var query = {
		"fields" : ["feeResult"],
		"query" : {
			"constant_score" : {
				"filter" : {
					"and" : [ {
						"term" : {
							"costId" : costId
						}
					}, {
						"term" : {
							"feeName" : feeName
						}
					} ]
				}
			}
		}
	};
	this.exec('search', 'fee', query, function(err, data) {
		var values = data.hits.hits.map(function(e) {
			return getId? e._id : e.fields.feeResult;
		});
		callback(err, values);
	});
}


db._CC = function(costId, type, prop, getId, callback) {
	var query = {
		"fields" : [prop],
		"query" : {
			"constant_score" : {
				"filter" : {
					"and" : [ {
						"term" : {
							"parentId" : costId
						}
					}, {
						"term" : {
							"type" : type
						}
					}, {
						"exists" : {
							"field" : prop
						}
					} ]
				}
			}
		}
	};
	this.exec('search', 'cost', query, function(err, data) {
		var values = data.hits.hits.map(function(e) {
			return getId? e._id : e.fields[prop];
		});
		callback(err, values);
	});
}

db._CCF = function(costId, type, feeName, getId, callback) {
	var query = {
		"fields" : ["feeResult"],
		"query" : {
			"constant_score" : {
				"filter" : {
					"and" : [ {
						"term" : {
							"costParentId" : costId
						}
					}, {
						"term" : {
							"costType" : type
						}
					}, {
						"term" : {
							"feeName" : feeName
						}
					} ]
				}
			}
		}
	};
	this.exec('search', 'fee', query, function(err, data) {
		var values = data.hits.hits.map(function(e) {
			return getId? e._id : e.fields.feeResult;
		});
		callback(err, values);
	});
}

db._CS = function(costId, parentId, prop, getId, callback) {
	var query = {
		"fields" : [prop],
		"query" : {
			"constant_score" : {
				"filter" : {
					"and" : [ {
						"term" : {
							"parentId" : parentId
						}
					}, {
						"not" : {
							"term" : {
								"_id" : costId
							}
						}
					}, {
						"exists" : {
							"field" : prop
						}
					} ]
				}
			}
		}
	};
	this.exec('search', 'cost', query, function(err, data) {
		var values = data.hits.hits.map(function(e) {
			return getId? e._id : e.fields[prop];
		});
		callback(err, values);
	});
}

db._CSF = function(costParentId, costId, feeName, getId, callback) {
	var query = {
		"fields" : ["feeResult"],
		"query" : {
			"constant_score" : {
				"filter" : {
					"and" : [ {
						"term" : {
							"costParentId" : costParentId
						}
					}, {
						"not" : {
							"term" : {
								"costId" : costId
							}
						}
					}, {
						"term" : {
							"feeName" : feeName
						}
					} ]
				}
			}
		}
	};
	this.exec('search', 'fee', query, function(err, data) {
		var values = data.hits.hits.map(function(e) {
			return getId? e._id : e.fields.feeResult;
		});
		callback(err, values);
	});
}

db.ref_CAS = function(costId, prop, callback) {
	var query = {
		"fields" : [prop],
		"query" : {
			"constant_score" : {
				"filter" : {
					"and" : [ {
						"term" : {
							"parentId" : parentId
						}
					}, {
						"not" : {
							"term" : {
								"_id" : costId
							}
						}
					}, {
						"exists" : {
							"field" : prop
						}
					} ]
				}
			}
		}
	};
	this.exec('search', 'cost', query, function(err, data) {
		var values = data.hits.hits.map(function(e) {
			return getId? e._id : e.fields[prop];
		});
		callback(err, values);
	});
}
/////////////////////////////////////////////////////////////////////////
db.getRefToIdsOf = function(fromFeeIds, callback) {
	var query = {
		"fields" : [ "fromFeeId", "toId" ],
		"query" : {
			"constant_score" : {
				"filter" : {
					"in" : {
						"fromFeeId" : fromFeeIds
					}
				}
			}
		}
	};
	this.exec('search', 'ref', query, function(err, data) {
		var fromtos = [];
		data.hits.hits.forEach(function(hit){
			var fields = hit.fields;
			fromtos[fields.fromFeeId] = fromtos[fields.fromFeeId] ? fromtos[fields.fromFeeId].concat(fields.toId) : [fields.toId];
		});
		
		callback(err, fromtos);
	});
}

db.getFeeIdsRefTo = function(toIds, callback) {
	var query = {
		"fields" : [ "fromFeeId" ],
		"query" : {
			"constant_score" : {
				"filter" : {
					"in" : {
						"toId" : toIds
					}
				}
			}
		}
	};
	this.exec('search', 'ref', query, function(err, data) {
		var ids = data.hits.hits.map(function(e) {
			return e.fields.fromFeeId;
		});
		callback(err, ids);		
	});
}
