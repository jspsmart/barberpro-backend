# barberpro-backend

## 一、后端代码修改

1. 创建配置文件 ：

   - 创建了 /Users/ldk/trae-projects/barberpro-backend/config/index.js 存储微信小程序和JWT的配置信息
   - 包含微信AppID、AppSecret、登录URL以及JWT密钥和过期时间
2. 添加依赖 ：

   - 添加了 jsonwebtoken 依赖用于实现JWT token的生成和验证
3. 修改登录接口 ：

   - 实现了真实的微信API调用，获取用户的openid
   - 使用JWT生成安全的token，代替原来的模拟token
   - 保留了数据库操作的错误处理和模拟数据支持
4. 添加token验证中间件 ：

   - 创建了 verifyToken 中间件用于验证请求中的token
   - 确保只有授权用户才能访问受保护的接口
5. 修改充值接口 ：

   - 使用验证后的token获取用户信息，确保请求的安全性

## 二、远程服务器部署步骤

1. 服务器准备 ：

   - 购买云服务器（推荐阿里云、腾讯云、华为云等）
   - 选择Ubuntu或CentOS操作系统
   - 配置安全组，开放3000端口（或其他你设置的端口）
2. 环境搭建 ：

   ```
   # 更新系统
   sudo apt update && sudo apt upgrade -y
   
   # 安装Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E 
   bash -
   sudo apt install -y nodejs
   
   # 安装MongoDB
   sudo apt install -y mongodb
   sudo systemctl start mongodb
   sudo systemctl enable mongodb
   
   # 安装git
   sudo apt install -y git
   ```

3. 项目部署 ：

   ```
   # 克隆代码
   git clone <你的代码仓库地址>
   cd barberpro-backend
   
   # 安装依赖
   npm install
   
   # 配置环境变量
   # 修改config/index.js文件中的微信AppID和AppSecret
   nano config/index.js
   
   # 启动服务
   npm start
   
   # 推荐使用PM2进行进程管理
   npm install -g pm2
   pm2 start index.js
   pm2 startup
   pm2 save
   ```

4. 配置域名（可选） ：

   - 购买域名并完成备案
   - 配置Nginx反向代理
   - 配置SSL证书实现HTTPS访问

## 三、测试方法

1. 本地测试 ：

   ```
   # 安装依赖
   npm install
   
   # 修改config/index.js中的微信AppID和AppSecret
   
   # 启动服务
   npm start
   
   # 使用curl测试登录接口
   curl -X POST http://localhost:3000/api/v1/user/login -H 
   "Content-Type: application/json" -d '{"code":"test_code",
   "user_info":{"nickName":"测试用户","avatarUrl":"https://example.
   com/avatar.png"}}'
   
   # 使用返回的token测试充值接口
   curl -X POST http://localhost:3000/api/v1/user/recharge -H 
   "Content-Type: application/json" -H "Authorization: Bearer <返
   回的token>" -d '{"amount":200,"payment_type":"wechat"}'
   ```

2. 小程序测试 ：

   - 在微信开发者工具中配置正确的request域名
   - 调用 wx.login() 获取code
   - 将code发送到后端登录接口获取token
   - 在后续请求的header中添加Authorization: Bearer <token/>

## 注意事项

1. 请将微信小程序的AppID和AppSecret替换为真实的值
2. 确保JWT密钥的安全性，不要泄露
3. 在生产环境中建议使用HTTPS协议
4. 定期备份数据库和配置文件
通过以上修改和部署步骤，你应该能够实现微信小程序与后台服务的真实授权功能。
