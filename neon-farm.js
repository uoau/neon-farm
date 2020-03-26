// 引入
const _ = require('lodash');

// 农场主类
class Farmer {
	_name = 'Farmer';
	customData = {
		orderFlow : [] // 工单流
	}
	data   = {
		status : 'pending',  // 状态 free 空闲 pending 停工 working 处理订单中
		order  : null        // 当前订单
	}
	keeper = null; // 种子提供者
	filter = null; // 过滤器生成工单
	constructor(){
		const dataObserve = new Observer();
		dataObserve.action = this._listenData.bind(this);
		this.data = dataObserve.createObserve(this.data);
		return this;
	}
	_listenData(target, key, value){
		if(key == 'status'){
			if(value=='free'){
				this._nextOrder();
			}else if(value=='pending'){
				console.log('# 停工了');
			}
		}
		return true;
	}
	async _nextOrder(){
		let order = null;
		if(this.customData.orderFlow.length){
			order = this.customData.orderFlow.splice(0,1);
		}else {
			order = await this._createOrder();
		}
		if(order){
			this._startOrder(order);
		}
	}
	async _createOrder(){
		//索要种子
		let seed = await this.keeper.pushSeed();
		let order = null;
		if(seed){
			order = await this.filter.createOrder(seed);
		}else {
			console.log('# 没有种子了');
			this.data.status = 'pending';
		}
		return order;
	}
	async _startOrder(order){
		let seed = order.seed;
		let flowLine = order.flowLine;
		for(let slave of flowLine){
			seed = await slave.work(seed);
		}
		console.log('# 完成一单');
		this.data.status = 'free'; //空闲
	}
	startWork(){
		// 开工~
		this.data.status = 'free';
	}
	stopWork(){
		// 停工了~
		this.data.status = 'pending';
	}
	bind(role){
		if(role._name=='Keeper'){
			this.keeper = role;
		}else if (role._name=='Filter'){
			this.filter = role;
		}
	}
	dealErrorOrder(){
		//处理错误订单

	}
}
// 种子看守人类
class Keeper {
	_name = 'Keeper';
	seeds = []; //资源数组
	constructor(){
		return this;
	}
	addSeeds(arr){
		this.seeds = [...this.seeds,...arr];
	}
	pushSeed(){
		if(this.seeds.length){

			return this.seeds.splice(0,1)[0];
		}else {
			return null;
		}
	}
}
// 过滤机生成器
class Filter {
	_name = 'Filter';
	orderTypeList = []; //工单类型集合
	constructor(){
		return this;
	}
	add({
		orderName,
		path,
		flowLine = []
	} = {}){
		checkType(orderName,'String',true);
		checkType(path,'RegExp',true);
		checkType(flowLine,'Array',true);
		let orderType = {orderName,path,flowLine};
		this.orderTypeList.push(orderType);
	}
	createOrder(seed){
		let order = null;
		for(let orderType of this.orderTypeList){
			if(orderType.path.test(seed.url)){
				order = new Order({
					orderName : orderType.orderName,
					seed : seed,
					flowLine : orderType.flowLine
				})
				break;
			}
		}
		return order;
	}
}
// 奴隶生成器
class Slave {
	_name = 'Slave';
	work  = null;
	constructor(workFun){
		checkType(workFun,'Function',true);
		this.work = async (seed)=>{
			await workFun(seed);
			return seed;
		}
		return this;
	}
}

// 订单类
class Order {
	_name = 'Order';
	constructor({
		orderName , // 订单名
		seed ,      // 种子
		flowLine ,  // 流水线
	} = {}){
		checkType(orderName,'String',true);
		checkType(flowLine,'Array',true);
		this.orderName = orderName;
		this.seed = seed;
		this.flowLine = flowLine;
		return this;
	}
}
// 种子类
class Seed {
	_name = 'Seed';
	constructor({ url,param } = {}){
		// 类型检查
		checkType(url,'String',true);
		checkType(param,'All',true);

		// 属性赋值
		this.url        = url;    // 请求地址
		this.param      = param;  // 附带参数
		this.reqHeader  = null;   // 请求头
		this.resHeader  = null;   // 响应头
		this.body       = null;   // 响应体
		this.customData = null;   // 用户的自定义数据
	}
}

// 通用函数
function checkType(value,type,must) {
	const strategy = {
		'String'   : _.isString(value),
		'Array'    : _.isArray(value),
		'Function' : _.isFunction(value),
		'Boolean'  : _.isBoolean(value),
		'RegExp'   : _.isRegExp(value),
		'All'      : true
 	} 
 	if(!strategy[type]){
		throw new Error('Error parameter');
 	}else{
 		return true;
 	}
}
function sleep(timeountMS){
	return new Promise((resolve) => {
		setTimeout(resolve, timeountMS);
	})
}

// 通用类
class Observer {
    createObserve(object) { //创建观察的对象
        return new Proxy(object, {
            set: (target, key, value, receiver) => {
                this.action(target, key, value)
                Reflect.set(target, key, value, receiver)
                return true
            }
        })
    }
    action() {} //发生改变后执行的方法
}


// 导出模块
module.exports = {
	Farmer,
	Keeper,
	Filter,
	Slave
}



// 业务代码---------------------------------------
// 召唤农场主
// const farmer = new Farmer;

// // 召唤种子管理员
// const keeper = new Keeper;
// keeper.addSeeds([
// 	new Seed({
// 		url:'https://www.baidu.com',
// 		param:'xxx'
// 	}),
// 	new Seed({
// 		url:'https://www.jd.com',
// 		param:'xxx'
// 	}),
// 	new Seed({
// 		url:'https://www.baidu.com',
// 		param:'xxx'
// 	}),
// ])


// // 召唤奴隶
// const slave1 = new Slave(async()=>{
// 	await sleep(1000);
// 	console.log('奴隶1处理完成')
// })
// const slave2 = new Slave(async()=>{
// 	await sleep(1000);
// 	console.log('奴隶2处理完成')
// })

// // 召唤过滤器
// let filter = new Filter;
// filter.add({
// 	orderName : '爬取百度页面',
// 	path : /www\.baidu\.com/,
// 	flowLine : [slave2,slave2,slave1]
// })
// filter.add({
// 	orderName : '爬取京东页面',
// 	path : /www\.jd\.com/,
// 	flowLine : [slave1,slave2,slave1]
// })


// // 绑定
// farmer.bind(keeper);
// farmer.bind(filter);

// farmer.startWork();
