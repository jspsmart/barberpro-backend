// 配置文件
const config = {
  wechat: {
    appId: 'your-wechat-app-id', // 微信小程序AppID
    appSecret: 'your-wechat-app-secret', // 微信小程序AppSecret
    loginUrl: 'https://api.weixin.qq.com/sns/jscode2session'
  },
  jwt: {
    secret: 'your-jwt-secret-key', // JWT密钥
    expiresIn: '7d' // token过期时间
  }
};

module.exports = config;