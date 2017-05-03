import superagent  from 'superagent';
import cheerio from 'cheerio';
import sync from 'async';
// var wilddog = require('wilddog');
import * as wilddog from 'wilddog';

console.log('start catch data')
var config = {
  syncURL: "https://together.wilddogio.com" //输入节点 URL
};
var wd = wilddog.default
wd.initializeApp(config);
// var ref = wilddog.sync().ref();
let targetWeb = 'http://next.36kr.com/posts'
let params = {
  start_on: '2017-05-03'
}

let source="next"

let productsRef = wd.sync().ref('users');
let journeys = wd.sync().ref("journeys");

superagent.get(targetWeb)
  // .set('Accept', 'application/json')
  // .type('form')
  .set('gzip', true)
  .send(params)
  .end(function (err, sres) {
    // 常规的错误处理
    if (err) {
      console.log(err)
      return
    }
    var $ = cheerio.load(sres.text);
    // let together_infos = JSON.parse(sres.text).data.res

  })

function getPage(date, callback) {
  superagent.get(targetWeb)
    // .set('Accept', 'application/json')
    // .type('form')
    .set('gzip', true)
    .send({
      start_on: date
    })
    .end(function (err, sres) {
      // 常规的错误处理
      if (err) {
        console.log(err)
        return
      }
      var $ = cheerio.load(sres.text);
      // let together_infos = JSON.parse(sres.text).data.res
      $('.content .post').forEach(function(post, idx) {
        console.log($(this).child('.date').attr('title'))
        $(this).child('.product-list').forEach(function(post, idx) {
          console.log($(this).child('.post-url').text())
          console.log($(this).child('.post-url').title())
          console.log($(this).child('.post-tagline').text())
        })
      })
      callback(data, getPage)
      // async.mapLimit(heroes, 5,
      //   function (hero, callback) {
      //       // 对每个角色对象的处理逻辑
      //        var heroId = hero[0];    // 获取角色数据第一位的数据，即：角色id
      //       fetchInfo(heroId, callback);
      //   },
      //   function (err, result) {
      //       console.log('抓取的角色数：' + heroes.length);
      //   }
      // );
    })
}
