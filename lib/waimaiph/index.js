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
// auth.wilddog.com
// s-dalwx-nss-1.wilddogio.com
// up.qbox.me
// iovip.qbox.me
//要上传的空间
var bucket = 'waimaiph';
var bucket1 = 'phwaimai';
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
storesRef.remove()
goodsRef.remove()
tagsRef.remove()

function catchStores(page) {
  params.page = page
  superagent
    .get(targetWeb)
    .query(params)
    .end(function(err, sres){
      if (err) {
        // console.log('request error', err)
        return
      }

      let data = JSON.parse(sres.text).data
      console.log(data)
      data.forEach((item, idx) => {
        let storeId = `${source}${item.id}`
        let logoUrl = `${baseUrl}${item.logo}`
        let logoKey = 'waimaiph/logo/' + item.logo.split('/images/').pop()
        let wechatUrl = `${baseUrl}${item.wechat}`
        let wechatKey = 'waimaiph/Qrcode/' + item.wechat.split('/images/').pop()
        client.fetch(logoUrl, bucket, logoKey, function(uri, digest) {})
        if(item.wechat) {
          client.fetch(wechatUrl, bucket, wechatKey, function(uri, digest) {})
        }
        item.source = source
        const { add_time, address, closed, comment, id,
          logo, openStatus, openend, openstart, place, price,
          qq, realend, sname, status, stype, summary, tel,
          tel1, tel2, uid, view, wechat
        } = item
        let tels = [tel, tel1, tel2];
        let phones = [];
        tels.forEach(function(item) {
          if(item != '') {
            phones.push(item)
          }
        })
        let newItem = {
          source, address, summary, id, phones, qq,
          alowed_region: place,
          name: sname,
          opening_time: openstart,
          closing_time: openend,
          sending_price: price,
          wechat_qrcode: wechat.split('/images/').pop(),
          type: stype,
          logo: logo.split('/images/').pop()
        }
        storesRef.push(newItem)
          .then(function(newRef){
            let storeId = newRef.key()
            console.info(storeId);
            store({sid: id}, function(data){
              // storesRef.child(storeId).update({announcement: data.announcement})
              data.menus.forEach(function(item){
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
              })
            })
          })
          .catch(function(err){
             console.info('remove node failed', err.code, err);
          });

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
}

for(let i=1; i<7; i++){
  setTimeout( function() {
    let page = i
    catchStores(page)
  }, 5000)
}
