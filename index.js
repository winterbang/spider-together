import superagent  from 'superagent';
import cheerio from'cheerio';
import sync from 'async';

console.log('start catch data')
superagent.post('http://bbs.qyer.com/thread.php?action=getTogether')
  .set('Accept', 'application/json')
  // .type('form')
  .set('gzip', true)
  .send({ page: 4, limit: 10 })
  .end(function (err, sres) {
    // 常规的错误处理
    if (err) {
      return next(err);
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
    console.log(JSON.parse(sres.text).data)
    // title = subject
    //         contanct
    //         departure_time_earliest
    //         return_time
    //         userPhoto
    //         username
    //         placename.0
    //           cn_name
    //           en_name
    //         url
    // console.dir(JSON.parse(sres.text))
  });
