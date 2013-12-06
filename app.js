var Api = require("./api.js");
var async = require('async');

var fees = {
	'ztgc' : [ { // 整体工程
		feeName : '单项工程费用合计',
		feeExpr : 'sum(ccf(单项工程,工程总造价))',
		feeResult : '0'
	}, {
		feeName : '整体工程费用合计',
		feeExpr : '0',
		feeResult : '0'
	}, {
		feeName : '工程总造价',
		feeExpr : 'cf(单项工程费用合计)+cf(整体工程费用合计)',
		feeResult : '0'
	} ],
	'dxgc' : [ // 单项工程
			{
				feeName : '单位工程工程费合计',
				feeExpr : 'sum(ccf(单位工程,工程总造价))',
				feeResult : '0'
			},
			{
				feeName : '单项工程费用合计',
				feeExpr : 'cf(措施项目清单费用)+cf(其他项目清单费用)+cf(规费)+cf(税金)',
				feeResult : '0',
				fee : [
						{
							feeName : '措施项目清单费用',
							feeExpr : '100+10*20',
							feeResult : '0'
						},
						{
							feeName : '其他项目清单费用',
							feeExpr : '500+100',
							feeResult : '0'
						},
						{
							feeName : '规费',
							feeExpr : 'cf(工程排污费)+cf(社会保障费)+cf(住房公积金)+cf(河道管理费)',
							feeResult : '0',
							fee : [
									{
										feeName : '工程排污费',
										feeExpr : 'cf(措施项目清单费用)*f(feeRate)',
										feeRate : '0.0348', // 费率
										feeResult : '0'
									},
									{
										feeName : '社会保障费',
										feeExpr : '200*f(feeRate)',
										feeRate : '0.0348', // 费率
										feeResult : '0'
									},
									{
										feeName : '住房公积金',
										feeExpr : 'cf(措施项目清单费用)*f(feeRate)',
										feeRate : '0.0348', // 费率
										feeResult : '0'
									},
									{
										feeName : '河道管理费',
										feeExpr : '(cf(措施项目清单费用)+cf(其他项目清单费用)+cf(工程排污费)+cf(社会保障费)+cf(住房公积金))*f(feeRate)',
										feeRate : '0.0348', // 费率
										feeResult : '0'
									} ]
						},
						{
							feeName : '税金',
							feeExpr : '(cf(措施项目清单费用)+cf(其他项目清单费用)+cf(规费)-cf(河道管理费))*f(feeRate)',
							feeRate : '0.0348', // 费率
							feeResult : '0'
						} ]
			}, {
				feeName : '工程总造价',
				feeExpr : 'cf(单位工程工程费合计)+cf(单项工程费用合计)',
				feeResult : '0'
			} ],
	'dwgc' : [ // 单位工程
			{
				feeName : '分部分项工程量清单费用',
				feeExpr : 'sum(ccf(分部分项,综合合价))',
				feeResult : '0'
			},
			{
				feeName : '措施项目清单费用',
				feeExpr : '0',
				feeResult : '0'
			},
			{
				feeName : '其他项目清单费用',
				feeExpr : '0',
				feeResult : '0'
			},
			{
				feeName : '规费',
				feeExpr : 'cf(工程排污费)+cf(社会保障费)+cf(住房公积金)+cf(河道管理费)',
				feeResult : '0',
				fee : [
						{
							feeName : '工程排污费',
							feeExpr : '(cf(分部分项工程量清单费用)+cf(措施项目清单费用))*f(feeRate)',
							feeRate : '0.0348', // 费率
							feeResult : '0'
						},
						{
							feeName : '社会保障费',
							feeExpr : '200*f(feeRate)',
							feeRate : '0.0348', // 费率
							feeResult : '0'
						},
						{
							feeName : '住房公积金',
							feeExpr : '(cf(分部分项工程量清单费用)+cf(措施项目清单费用))*f(feeRate)',
							feeRate : '0.0348', // 费率
							feeResult : '0'
						},
						{
							feeName : '河道管理费',
							feeExpr : '(cf(分部分项工程量清单费用)+cf(措施项目清单费用)+cf(其他项目清单费用)+cf(工程排污费)+cf(社会保障费)+cf(住房公积金))*f(feeRate)',
							feeRate : '0.0348', // 费率
							feeResult : '0'
						} ]
			},
			{
				feeName : '税金',
				feeExpr : '(cf(分部分项工程量清单费用)+cf(措施项目清单费用)+cf(其他项目清单费用)+cf(规费)-cf(河道管理费))*f(feeRate)',
				feeResult : '0',
				feeRate : '0.0348', // 费率
			},
			{
				feeName : '工程总造价',
				feeExpr : 'cf(分部分项工程量清单费用)+cf(措施项目清单费用)+cf(其他项目清单费用)+cf(规费)+cf(税金)',
				feeResult : '0'
			} ],
	'fbfx' : [ { // 分部分项
		feeName : '人工费合价',
		feeExpr : 'sum(ccf(清单,人工费合价))',
		feeResult : '0'
	}, {
		feeName : '材料费合价',
		feeExpr : 'sum(ccf(清单,材料费合价))',
		feeResult : '0'
	}, {
		feeName : '机械费合价',
		feeExpr : 'sum(ccf(清单,机械费合价))',
		feeResult : '0'
	}, {
		feeName : '直接费合价',
		feeExpr : 'sum(ccf(清单,直接费合价))',
		feeResult : '0'
	}, {
		feeName : '综合合价',
		feeExpr : 'sum(ccf(清单,综合合价))',
		feeResult : '0'
	} ],
	'qd' : [ { // 清单
		feeName : '人工费',
		feeExpr : 'cf(人工费合价)/c(quantity)',
		feeResult : '0'
	}, {
		feeName : '人工费合价',
		feeExpr : 'sum(ccf(定额,人工费合价))',
		feeResult : '0'
	}, {
		feeName : '材料费',
		feeExpr : 'cf(材料费合价)/c(quantity)',
		feeResult : '0'
	}, {
		feeName : '材料费合价',
		feeExpr : 'sum(ccf(定额,材料费合价))',
		feeResult : '0'
	}, {
		feeName : '机械费',
		feeExpr : 'cf(机械费合价)/c(quantity)',
		feeResult : '0'
	}, {
		feeName : '机械费合价',
		feeExpr : 'sum(ccf(定额,机械费合价))',
		feeResult : '0'
	}, {
		feeName : '直接费',
		feeExpr : 'cf(人工费)+cf(材料费)+cf(机械费)',
		feeResult : '0'
	}, {
		feeName : '直接费合价',
		feeExpr : 'cf(直接费)*c(quantity)',
		feeResult : '0'
	}, {
		feeName : '综合单价',
		feeExpr : 'cf(综合合价)/c(quantity)',
		feeResult : '0'
	}, {
		feeName : '综合合价',
		feeExpr : 'sum(ccf(定额,综合合价))',
		feeResult : '0'
	} ],
	'de' : [ // 定额
	{
		feeName : '人工费',
		feeExpr : 'sum(ccf(人工,直接费))',
		feeResult : '0'
	}, {
		feeName : '人工费合价',
		feeExpr : 'cf(人工费)*c(quantity)',
		feeResult : '0'
	}, {
		feeName : '材料费',
		feeExpr : 'sum(ccf(材料,直接费))',
		feeResult : '0'
	}, {
		feeName : '材料费合价',
		feeExpr : 'cf(材料费)*c(quantity)',
		feeResult : '0'
	}, {
		feeName : '机械费',
		feeExpr : 'sum(ccf(机械,直接费))',
		feeResult : '0'
	}, {
		feeName : '机械费合价',
		feeExpr : 'cf(机械费)*c(quantity)',
		feeResult : '0'
	}, {
		feeName : '直接费',
		feeExpr : 'cf(人工费)+cf(材料费)+cf(机械费)',
		feeResult : '0'
	}, {
		feeName : '直接费合价',
		feeExpr : 'cf(直接费)*c(quantity)',
		feeResult : '0'
	}, {
		feeName : '管理费',
		feeExpr : '1+2',
		feeResult : '0'
	}, {
		feeName : '管理费合价',
		feeExpr : 'cf(管理费)*c(quantity)',
		feeResult : '0'
	}, {
		feeName : '利润',
		feeExpr : '1+2*3',
		feeResult : '0'
	}, {
		feeName : '利润合价',
		feeExpr : 'cf(利润)*c(quantity)',
		feeResult : '0'
	}, {
		feeName : '综合单价',
		feeExpr : 'cf(直接费)+cf(管理费)+cf(利润)',
		feeResult : '0'
	}, {
		feeName : '综合合价',
		feeExpr : 'cf(综合单价)*c(quantity)',
		feeResult : '0'
	} ],
	'glj' : [ { // 工料机
		feeName : '直接费',
		feeExpr : 'c(price)*c(content)',
		feeResult : '0'
	} ]
};
// ////////////////////////////////////////////
function Tester() {
	this.ztgc = 0; // 整体工程id
	this.dxgc = []; // 单项工程ids
	this.dwgc = []; // 单位工程ids
	this.fbfx = []; // 分部分项ids
	this.qd = []; // 清单ids
	this.de = []; // 定额ids
	this.glj = []; // 工料机ids
}

Tester.prototype.createZtgc = function(callback) {
	var me = this;
	var ztgc = {
		type : '整体工程'
	};
	var fs = fees['ztgc'];
	Api.createCost(ztgc, fs, null, function(err, cost) {
		me.ztgc = cost.id;
		callback(null, cost);
	});
}

Tester.prototype.createDXgc = function(callback) {
	var me = this;
	var parentId = me.ztgc;
	var dxgc = {
		type : '单项工程'
	};
	var fs = fees['dxgc'];
	Api.createCost(dxgc, fs, parentId, function(err, cost) {
		me.dxgc.push(cost.id);
		callback(null, cost);
	});
}

Tester.prototype.createDwgc = function(callback) {
	var me = this;
	var dwgc = {
		type : '单位工程'
	};
	var fs = fees['dwgc'];
	var parentId = me.dxgc.random();
	if (!parentId) {
		return callback(null);
	}
	Api.createCost(dwgc, fs, parentId, function(err, cost) {
		me.dwgc.push(cost.id);
		callback(null, cost);
	});
}

Tester.prototype.createFbfx = function(callback) {
	var me = this;
	var fbfx = {
		type : '分部分项'
	};
	var fs = fees['fbfx'];
	var parentId = me.dwgc.random();
	if (!parentId) {
		return callback(null);
	}
	Api.createCost(fbfx, fs, parentId, function(err, cost) {
		me.fbfx.push(cost.id);
		callback(null, cost);
	});
}

Tester.prototype.createQd = function(callback) {
	var me = this;
	var qd = {
		type : '清单',
		quantity : Math.random() * 1000
	};

	var fs = fees['qd'];
	var parentId = me.fbfx.random();
	if (!parentId) {
		return callback(null);
	}
	Api.createCost(qd, fs, parentId, function(err, cost) {
		me.qd.push(cost.id);
		callback(null, cost);
	});
}

Tester.prototype.createDe = function(callback) {
	var me = this;
	var de = {
		type : '定额',
		quantity : Math.random() * 1000
	};
	var fs = fees['de'];
	var parentId = me.qd.random();
	if (!parentId) {
		return callback(null);
	}
	Api.createCost(de, fs, parentId, function(err, cost) {
		me.de.push(cost.id);
		callback(null, cost);
	});
}

Tester.prototype.createGlj = function(callback) {
	var me = this;
	var types = [ "人工", "材料", "机械" ];
	var glj = {
		'type' : types[Math.floor(Math.random() * 10) % 3],
		'price' : Math.random() * 100,
		'content' : Math.random()
	};
	var fs = fees['glj'];
	var parentId = me.de.random();
	if (!parentId) {
		return callback(null);
	}
	Api.createCost(glj, fs, parentId, function(err, cost) {
		me.glj.push(cost.id);
		callback(null, cost);
	});
}

// 修改工程量
Tester.prototype.modGcl = function(callback) {
	var me = this;
	var modQd = Math.random() < 0.5;
	var nid = modQd ? me.qd.random() : me.de.random();
	if (!nid) {
		return callback(null);
	}
	var gcl = Math.random() * 1000;
	Api.updateCost(nid, 'quantity', gcl, function(err, res) {
		callback(err);
	});
}

// 删除清单或定额
Tester.prototype.delNode = function(callback) {
	var me = this;
	var delQd = Math.random() < 0.5;
	var nid = delQd ? me.qd.random() : me.de.random();
	if (!nid) {
		return callback(null);
	}
	Api.deleteCost(nid, function(err, res) {
		callback(err);
	});
}
// //////////////////////////////////////////////////////
function arrPush(arr, e, n) {
	if (n) {
		for (var i = 0; i < n; i++) {
			arr.push(e);
		}
	} else {
		arr.push(e);
	}
}

function step(actor, actions, i, callback) {
	if (i == actions.length) {
		callback();
	} else {
		var act = actions[i];
		console.log("step " + i + ": " + act);
		actor[act](function(err, res) {
			step(actor, actions, i + 1, callback);
		});
	}
}

function run(callback) {
	var actions = [ 'createZtgc' ];
	arrPush(actions, "createDXgc", 2);
	arrPush(actions, "createDwgc", 4);
	arrPush(actions, "createFbfx", 8);

	var ops = [];
	arrPush(ops, "createQd", 10);
	arrPush(ops, "createDe", 20);
	arrPush(ops, "createGlj", 30);
	// arrPush(actions, "modGcl", 5);
	// arrPush(actions, "delNode", 2);

	actions = actions.concat(ops.shuffle());

	var actor = new Tester();
	step(actor, actions, 0, callback);
}

 run(function() {
	 console.log('done');
	 //console.log(util.stats.info());
 });



