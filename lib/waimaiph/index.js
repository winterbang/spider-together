import superagent  from 'superagent';
import cheerio from'cheerio';
import sync from 'async';
var wilddog = require('wilddog');
// import * as wilddog from 'wilddog';
import qiniu from 'qiniu';
import fs from 'fs';
qiniu.conf.ACCESS_KEY = 'LWOFV5jRfd6ashHPwP3gIWjkEoRXcyh_M63Qv1cX';
qiniu.conf.SECRET_KEY = 'BFBCnXVa0EOpuqaN3o_jeAx3gTbGFu476keKvElM';

//要上传的空间
var bucket = 'waimaiph';
var bucket1 = 'phwaimai';
var client = new qiniu.rs.Client();

var baseUrl = 'http://www.waimai.ph'
var targetWeb = 'http://www.waimai.ph/index/loadStores'
var params = {
  page: 1,
  order: 'view DESC',
  check: 0
}
var config = {
  syncURL: "https://waimaiph.wilddogio.com" //输入节点 URL
};
wilddog.initializeApp(config);
var ref = wilddog.sync().ref('stores');
let key = 'test.JPG'

// client.stat(bucket, key, function(err, ret) {
//   if (!err) {
//     console.log(ret.hash, ret.fsize, ret.putTime, ret.mimeType);
//   } else {
//     console.log(err);
//   }
// });
superagent
  .get(targetWeb)
  .query(params)
  .end(function(err, sres){
    if (err) {
      console.log('request error', err)
      return
    }
    // var $ = cheerio.load(res.text);
    // ref.orderByChild('view').limitToFirst(1).on('child_added', function(stores){
    //   console.log(`get ${stores.val().id}`)
    //   superagent
    //     .get(`${url}/index/store?sid=${stores.val().id}`)
    //     .end(function(err, res){
    //       let $ = cheerio.load(res.text);
    //       $('.goodsLis .storeList').each(function(idx, e){
    //           // // let $ = require('cheerio')
    //           // let $e = cheerio.load(e)
    //           // // console.log(e)
    //           // // console.log($e.text())
    //           // let priceNode = $(this).children('.fl')
    //           // let foodNameNode = priceNode.prev()
    //           //
    //           // let price = priceNode.text()
    //           // let foodName = foodNameNode.text()
    //           // console.log(`${foodName} --- ${foodName}`)
    //
    //           let listType = $(this).children('.storeListTyp').text()
    //       })
    //     })
    // })
    // $('.foodsList a').each(function (idx, e){
    //   var $e = cheerio.load(e);
    //   // console.log(e)
    //   // items.push({
    //   //   link: $e.attr('href'),
    //   //   img: $e('img').attr('src')
    //   // })
    // })
    // console.log(items)

    let data = JSON.parse(sres.text).data
    data.forEach((item, idx) => {
      let logoUrl = `${baseUrl}${item.logo}`
      // fetch(logoUrl, bucket1, item.logo)
      client.fetch(logoUrl, bucket1, logoUrl, function(uri, digest, res) {
        console.log('===================')
        console.log(uri, 'uri')
        console.log(digest, 'digest')
        // console.log(res, 'res')
        console.log('===================')
      })

      console.log(logoUrl)
    })

    function fetch (url1, bucket, key) {
      let url = "http://www.flw.ph/data/attachment/forum/201412/03/134956ennnxcuzcngho1tj.jpg.thumb.jpg"
      let entry = bucket+":"+key
      let encodedEntryURI = qiniu.util.urlsafeBase64Encode(entry)

      let pic = new Buffer(url).toString('base64')
      let basePic = qiniu.util.base64ToUrlSafe(pic)

      let token = qiniu.util.generateAccessToken('http://iovip.qbox.me/fetch/'+basePic+'/to/'+encodedEntryURI)
      console.log(token)

      var options = {
          method: 'POST',
        url: 'http://iovip.qbox.me/fetch/'+basePic+'/to/'+encodedEntryURI,
        headers:{
          authorization: token,
          'content-type': 'application/x-www-form-urlencoded'
        }
      }
      superagent
        .post(options.url)
        .set('authorization', token)
        .set('content-type', 'application/x-www-form-urlencoded')
        .end(function(res) {
          console.log(res)
        })
    }
  })
