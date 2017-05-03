import superagent from 'superagent';
import cheerio from'cheerio';
import async from 'async';
// var wilddog = require('wilddog');
import wilddog from 'wilddog';
import qiniu from 'qiniu';
import fs from 'fs';
import log4js from 'log4js'
import store from './detail'
import sf from './saveFile'
qiniu.conf.ACCESS_KEY = 'LWOFV5jRfd6ashHPwP3gIWjkEoRXcyh_M63Qv1cX';
qiniu.conf.SECRET_KEY = 'BFBCnXVa0EOpuqaN3o_jeAx3gTbGFu476keKvElM';

// log4js.configure({
//   appenders: { cheese: { type: 'file', filename: 'cheese.log' } },
//   categories: { default: { appenders: ['cheese'], level: 'error' } }
// });

const logger = log4js.getLogger('cheese');

var bucket = 'waimaiph';
var client = new qiniu.rs.Client();

var baseUrl = 'http://www.waimai.ph'
var targetWeb = 'http://www.waimai.ph/index/loadStores'

var source = 'waimaiph'
var params = {
  page: 1,
  order: 'view DESC',
  check: 0
}
var config = {
  syncURL: "https://waimaiph.wilddogio.com" //输入节点 URL
};
wilddog.initializeApp(config);
var storesRef = wilddog.sync().ref('stores');
var goodsRef = wilddog.sync().ref('goods');
var tagsRef = wilddog.sync().ref('tags');
goodsRef.remove()
tagsRef.remove()

storesRef.once('value', function(snapshot, prev) {
  let source_stores = snapshot.val()
  // console.log(source_stores);
  console.log(snapshot.numChildren());
  // async.mapLimit(Object.keys(source_stores), 2, function(ref) {
  // async.eachSeries(Object.keys(source_stores), function(ref, callBack) {
  Object.keys(source_stores).forEach(function(ref, i) {
    let storeId = source_stores[ref].id
    logger.debug('start ');
    setTimeout(function() {
      store({sid: storeId}, function(data) {
        console.log(`开始保存${storeId} ${source_stores[ref].name} 相关数据`)
        // async.eachSeries(data.menus, function(item, callBack) {
        data.menus.forEach(function(item , j) {
          setTimeout(function(){
            tagsRef.push({name: item.tag, store_id: ref})
              .then(function(tagRef) {
                let tagId = tagRef.key()
                item.menus.forEach(function(menu, k) {
                  menu.tag_id = tagId
                  menu.store_id = storeId
                  menu.price = menu.price || ''
                  setTimeout(function() {
                    goodsRef.push(menu)
                      .then(function(goodRef) {
                        console.log('save goods: ',menu.name)
                      })
                  }, k*30)
                })
              })
              .catch(function(err) {
                console.info('set data failed', err.code, err)
              })
          }, j*600)
        })
      })
    }, i*30000)
    logger.debug('end');
  })
})


function sleep(time, callback) {
  var stop = new Date().getTime();
  while(new Date().getTime() < stop + time) {}
  if(callback) callback();
}
// async.mapLimit(heroes, 5,
//   function (hero, callback) {
//     // 对每个角色对象的处理逻辑
//      var heroId = hero[0];    // 获取角色数据第一位的数据，即：角色id
//     fetchInfo(heroId, callback);
//   },
//   function (err, result) {
//     console.log('抓取的角色数：' + heroes.length);
//   }
// );


// for(let i=1; i<7; i++){
//   setTimeout( function() {
//     let page = i
//     catchStores(page)
//   }, 5000)
// }
