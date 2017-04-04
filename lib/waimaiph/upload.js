import fs from 'fs';
import qiniu from 'qiniu';

qiniu.conf.ACCESS_KEY = 'LWOFV5jRfd6ashHPwP3gIWjkEoRXcyh_M63Qv1cX';
qiniu.conf.SECRET_KEY = 'BFBCnXVa0EOpuqaN3o_jeAx3gTbGFu476keKvElM';

//上传策略 http://developer.qiniu.com/article/developer/security/put-policy.html
// bucket:key 空间名:文件名
var putPolicy = new qiniu.rs.PutPolicy2(new policy('bucket:key'));

var token = putPolicy.token();

console.log(token);

//key 上传空间的文件名需要和 putPolicy 中的key 相同
qiniu.io.putFile(token,key,filePath ,null,function(err, ret) {
  if (!err) {
    // 上传成功， 处理返回值
    console.log(ret.key, ret.hash, ret.returnBody);
    // ret.key & ret.hash
  } else {
    // 上传失败， 处理返回代码
    console.log(err)
    // http://developer.qiniu.com/docs/v6/api/reference/codes.html
  }
});
//调用uploadFile上传

export default upload = function (url, bucket, callBack){
  let image_name
  let pathName = './imags/waimaiph/'
  let token = uptoken(bucket, image_name);
  superagent.get(url)
    .end(function(err, res) {
      let text = res.body
      console.log(text)
      fs.writeFileSync(`./imags/waimaiph/${image_name}`, res.body)
      uploadFile(token, image_name, filePath);
      callBack(pathName+image_name)
      // fs.writeFile(path, text, callback)
    })
}
