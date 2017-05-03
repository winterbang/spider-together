import superagent  from 'superagent';
import cheerio from'cheerio';
import sync from 'async';
import fs from 'fs';
import path from 'path';

var detailWeb = 'http://www.waimai.ph/index/store'

export default function(params, callback) {
  fromFile(params, callback)
  // superagent
  //   .get(detailWeb)
  //   .query(params)
  //   .end(function(err, res){
  //     if (err) {
  //       console.log('request error', err)
  //       return
  //     }
  //     let result = {}
  //     var $ = cheerio.load(res.text);
  //     let announcement = $('.storeSumCon').text()
  //     // console.log(announcement)
  //     result.announcement = announcement
  //     result.menus = []
  //     $('.goodsLis .storeList').each(function(idx, e) {
  //       let menus = []
  //       let tagDom = $(this)
  //       let tag = tagDom.find('.storeListTyp').text().replace(/[\r\n ]/g, "")
  //       tagDom.find('.storeListGood').each(function(idx, e){
  //         let menu = $(this).find('.ft16').eq(0).text()
  //         let price = $(this).find('.ft16').eq(1).text()
  //         menus.push({ name: menu, price: parseInt(price.split('P/').shift()) })
  //       })
  //       result.menus.push({
  //         tag: tag,
  //         menus
  //       })
  //     })
  //     if(callback) callback(result)
  //     // console.log(result)
  //   })
}

function fromFile(params, callback) {
  let result = {}
  var $ = cheerio.load(fs.readFileSync(path.join(path.dirname(__filename) + '/tmp', `store_${params.sid}.html`)));
  let announcement = $('.storeSumCon').text()
  // console.log(announcement)
  result.announcement = announcement
  result.menus = []
  $('.goodsLis .storeList').each(function(idx, e) {
    let menus = []
    let tagDom = $(this)
    let tag = tagDom.find('.storeListTyp').text().replace(/[\r\n ]/g, "")
    tagDom.find('.storeListGood').each(function(idx, e){
      let menu = $(this).find('.ft16').eq(0).text()
      let price = $(this).find('.ft16').eq(1).text()
      menus.push({ name: menu, price: parseInt(price.split('P/').shift()) })
    })
    result.menus.push({
      tag: tag,
      menus
    })
  })
  if(callback) callback(result)
}
