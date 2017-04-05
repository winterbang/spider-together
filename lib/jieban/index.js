import superagent  from 'superagent';
import cheerio from 'cheerio';
import sync from 'async';
var wilddog = require('wilddog');
// import * as wilddog from 'wilddog';

console.log('start catch data')
var config = {
  syncURL: "https://together.wilddogio.com" //输入节点 URL
};
wilddog.initializeApp(config);
// var ref = wilddog.sync().ref();
let targetWeb = 'http://bbs.qyer.com/thread.php?action=getTogether'
let params = {
  page: 10,
  limit: 20
}
let source="qyer"

let users = wilddog.sync().ref('users');
let journeys = wilddog.sync().ref("journeys");

superagent.post(targetWeb)
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
    let together_infos = JSON.parse(sres.text).data.res
    // users.remove();
    // journeys.remove();
    together_infos.forEach((item, idx) => {
      const { id, together_info={}, image, subject, url, uid, username, userPhoto } = item
      let _uid = `${source}${uid}`
      let _journeyid = `${source}${id}`
      let journey = {
        source: 'qyer',
        sourceUrl: url,
        title: subject,
        departurePlace: together_info.placename? together_info.placename[0].cn_name : "",
        startData: together_info.departure_time_earliest,
        // destination: "",
        endData: together_info.return_time,
        createdAt: together_info.created,
        uid: _uid,
        image: image
      }
      journeys.once("value").then(function(snapshot) {
        let journeyExists = snapshot.child(_journeyid).exists()
        if(!journeyExists) {
          // 保存用户信息
          users.once("value")
            .then(function(snapshot) {
              if(!snapshot.hasChild(_uid)) {
                users.child(_uid).set({
                  username: username,
                  avatar: userPhoto
                })
              }
            });
          // 获取行程详情并保存
          superagent.get(`http:${url}`)
            .end(function(err, res) {
              if (err) {
                console.log(err, 'error')
                return
              }
              // console.log(res.text)
              var $ = cheerio.load(res.text);
              let desc = $('.xpc .xlast').last().text()
              let contanct = $('.xpan-contact').last().text()
              journey.desc = desc
              journey.contactWays = [{others: contanct}]
              // 保存行程信息
              journeys.child(_journeyid).set(journey)
            })
        }
      })
      // console.dir(JSON.parse(sres.text))
      console.log(id)
    });
  })
