import superagent  from 'superagent';
import cheerio from'cheerio';
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
  page: 1,
  limit: 5
}
let source="qyer"

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
    // sres.text 里面存储着网页的 html 内容，将它传给 cheerio.load 之后
    // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
    // 剩下就都是 jquery 的内容了
    var $ = cheerio.load(sres.text);
    var items = [];
    // $('#topic_list .topic_title').each(function (idx, element) {
    //   var $element = $(element);
    //   items.push({
    //     title: $element.attr('title'),
    //     href: $element.attr('href')
    //   });
    // });
    let together_info = JSON.parse(sres.text).data.res
    // console.log(data)
    let users = wilddog.sync().ref('users');
    let journeys = wilddog.sync().ref("journeys");
    users.remove();
    journeys.remove();
    together_info.forEach((item, idx) => {
      const { together_info={}, image, subject, url, uid, username, userPhoto } = item
      let _uid = `${source}${uid}`
      let _journeyid = `${source}${id}`
      let journey = {
        source: 'qyer',
        sourceUrl: url,
        title: subject,
        departurePlace: together_info.placename[0].cn_name,
        startData: together_info.departure_time_earliest,
        // destination: "",
        endData: together_info.return_time,
        createdAt: together_info.created,
        // byWayOf: [],
        // peopleMin: 0,
        // peopleMax: 0,
        // peopleLimit: '',
        // contactWays: [],
        // desc: "",
        uid: _uid
      }
      // 保存用户信息
      // susers.once("value")
        .then(function(snapshot) {
          if(!snapshot.hasChild(_uid)) {
            users.child(_uid).set({
              username: username,
              avatar: userPhoto
            })
          }
        });
      // 保存行程信息
      // journeys.child(_journeyid).set(journey)
      superagent.get(url)
        .end(function(err, res){
          if (err) {
            console.log(err)
            return
          }
          var $ = cheerio.load(res.text);
          console.log($)
        })
      // journeys.push(journey).then(function(newRef){
      //   journeys.child(newRef.key()).
      //   console.info(newRef.key());
      // })
    })

    // console.dir(JSON.parse(sres.text))
  });
