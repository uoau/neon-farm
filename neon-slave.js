const superagent = require('superagent');
const cheerio = require('cheerio');
const farm = require('./neon-farm.js');


const zzz = '123';
(async ()=>{
	
	let res = await superagent.get('https://www.lunu8.com/')
	
	console.log(res.text);



})()




// 请求 - 奴隶
// const questSlave = new Slave(async (seed)=>{
// 	const res = await superagent.get(url);
// 	seed.body = res.body;
// })

// // 抓取页面所有图片 - 奴隶
// const catchAllImgSlave = new Slave(async (seed) => {
// 	let body = seed.body;

// })

// // 保存body文本 - 奴隶
// const saveBodySlave = new Slave(async (seed)=>{



// })

// 
// const a = new Slave(async (seed) => {

// })

// (async()=>{
// 	const res = await superagent.get('http://www.h5uc.com');
// 	console.log(res.body)
// })()

// const request = require('superagent');request.get('http://www.h5uc.com').buffer(true).end((err, res) => {console.log(res.text);});