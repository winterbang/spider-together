import superagent  from 'superagent';
import cheerio from'cheerio';
import sync from 'async';
// var wilddog = require('wilddog');
import wilddog from 'wilddog';
import qiniu from 'qiniu';
import fs from 'fs';
import store from './detail'
qiniu.conf.ACCESS_KEY = 'LWOFV5jRfd6ashHPwP3gIWjkEoRXcyh_M63Qv1cX';
qiniu.conf.SECRET_KEY = 'BFBCnXVa0EOpuqaN3o_jeAx3gTbGFu476keKvElM';

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

storesRef.once('value', function(snapshot, prev) {
  let source_stores = snapshot.val()
  // console.log(source_stores);
  console.log(snapshot.numChildren());
  Object.keys(source_stores).forEach(function(ref, idx) {
    let storeId = source_stores[ref].id
    // console.info(storeId);
    var result = []
    setTimeout(function() {
      tagsRef.orderByChild('store_id').equalTo(ref).on('value', function(snapshot, prev){
        if(!snapshot.val()) {
          console.log(storeId, `========${source_stores[ref].name}=======${ref}`)
          result.push({id: storeId, name: source_stores[ref].name, ref})
          console.log(result.length)
          store({sid: storeId}, function(data){
            console.log(data.menus)
            data.menus.forEach(function(item, idx) {
              setTimeout(function() {
                tagsRef.push({name: item.tag, store_id: storeId})
                .then(function(tagRef){
                  let tagId = tagRef.key()
                  item.menus.forEach(function(menu){
                    menu.tag_id = tagId
                    menu.store_id = storeId
                    goodsRef.push(menu)
                      .then(function(goodRef) {
                        console.log('success')
                      })
                  })
                })
              }, idx*5000)
            })
          })
        }
      })

    }, idx*300)


  })

})



// for(let i=1; i<7; i++){
//   setTimeout( function() {
//     let page = i
//     catchStores(page)
//   }, 5000)
// }
