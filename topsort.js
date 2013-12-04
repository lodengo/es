
//calc: a=b+c; b=c; c=999
//uvs:[{u:'a', v:['b','c']},{u:'b', v:['c']}, {u:'c', v:[]}]
//sort:{ cycle: false, order: [ 'c', 'b', 'a' ] }
var TopoSort = module.exports = function TopoSort(uvs){
	//邻接表 [顶点：{indegree：入度，link:[出边]}]
	//[ a: { indegree: 2, link: [] },  b: { indegree: 1, link: [ 'a' ] },  c: { indegree: 0, link: [ 'a', 'b' ] } ]
	this.adj = [];
	var self = this;
	uvs.forEach(function(uv){
		if(!self.adj[uv.u]) 
			self.adj[uv.u] = {indegree:uv.v.length, link:[]};
		else
			self.adj[uv.u].indegree += uv.v.length;
		
		uv.v.forEach(function(v){
			if(!self.adj[v])
				self.adj[v] = {indegree:0, link:[uv.u]};
			else
				self.adj[v].link.push(uv.u);
		});			
	});
}

TopoSort.prototype.sort = function(){
	var result = {cycle:true, order:[]};
	var self = this;
	while(Object.keys(self.adj).length != 0){
		var has0indegree = false;
		for(var i = 0; i < Object.keys(self.adj).length; i++){	
			var k = Object.keys(self.adj)[i];			
			if(self.adj[k].indegree == 0){					
				result.order.push(k);
				self.adj[k].link.forEach(function(o){
					self.adj[o].indegree = self.adj[o].indegree - 1;
				});
				delete self.adj[k];
				has0indegree = true;
				break;
			}
		}
		if(!has0indegree)
			break;
	}
	result.cycle = Object.keys(self.adj).length != 0;	
	return result;
}

//test
//var uvs = [{u:'a', v:['b','c']},{u:'b', v:['c']}, {u:'c', v:[]}];
//var toposort = new TopoSort(uvs);
//console.dir(toposort.sort());