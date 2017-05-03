import superagent  from 'superagent';
import cheerio from'cheerio';
import sync from 'async';
import request from "request";
import fs from 'fs';
import path from 'path';

var detailWeb = 'http://www.waimai.ph/index/store'
var concurrencyCount = 0
export default function(id) {
  var url = detailWeb+`?sid=${id}`;
  var filename = 'store_' + id + '.html';
  fs.exists(filename, function(exists) {
    if (exists) {
      console.log(filename + ' is exists');
    } else {
      concurrencyCount++;
      console.log('并发数：', concurrencyCount, '，正在抓取的是', url);
      request.head(url, function(err, res, body){
        if (err) {
          console.log('err: '+ err);
        }
        request(url)
          .pipe(fs.createWriteStream(path.join(path.dirname(__filename) + '/tmp', filename)))
          .on('close', function(){
            console.log('Done : ', url);
            concurrencyCount --;
          });
      });
    }
  });
}
