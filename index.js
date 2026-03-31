// index.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const adminRoutes = require('./routes/admin');

// 导入数据模型
const User = require('./models/User');
const Transaction = require('./models/Transaction');

const app = express();
const PORT = 3000;

// 配置中间件
app.use(bodyParser.json());
app.use(cors());

// 连接数据库
connectDB();

// 管理员路由
app.use('/api/v1/admin', adminRoutes);

// 模拟数据库，用于存储用户信息
const users = new Map();

// 登录接口
app.post('/api/v1/user/login', async (req, res) => {
  try {
    const { code, user_info } = req.body;
    
    // 检查参数
    if (!code) {
      return res.json({
        code: 1,
        message: '缺少code参数'
      });
    }
    
    // 简化版本：使用code作为唯一标识，跳过微信API调用
    // 实际项目中应该调用微信API获取openid
    const openid = `mock_${code}_${Date.now()}`;
    
    // 尝试从数据库创建或更新用户信息
    let user;
    
    try {
      user = await User.findOne({ openid });
      
      if (!user) {
        // 新用户，创建用户信息
        user = new User({
          openid,
          nickname: user_info?.nickName || '测试用户',
          avatar_url: user_info?.avatarUrl || 'https://app2.55555566.com/jws/images/sport.png',
          balance: 100
        });
        await user.save();
        
        // 创建初始交易记录
        const initialTransaction = new Transaction({
          user_id: user._id,
          type: 'payment',
          amount: 30,
          balance_before: 100,
          balance_after: 70,
          service_name: '理发',
          status: 'completed',
          transaction_no: `TX${Date.now()}_1`
        });
        await initialTransaction.save();
      } else {
        // 老用户，更新用户信息
        if (user_info) {
          user.nickname = user_info.nickName || user.nickname;
          user.avatar_url = user_info.avatarUrl || user.avatar_url;
          await user.save();
        }
      }
    } catch (dbError) {
      console.log('数据库操作失败，使用模拟数据:', dbError.message);
      // 使用模拟数据
      user = {
        nickname: user_info?.nickName || '测试用户',
        avatar_url: user_info?.avatarUrl || 'https://app2.55555566.com/jws/images/sport.png',
        balance: 100
      };
    }
    
    // 返回用户信息
    res.json({
      code: 0,
      message: '登录成功',
      data: {
        nickName: user.nickname,
        avatarUrl: user.avatar_url,
        balance: user.balance,
        token: openid // 直接使用openid作为token
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.json({
      code: 1,
      message: '登录失败',
      error: error.message
    });
  }
});

// 充值接口
app.post('/api/v1/user/recharge', async (req, res) => {
  try {
    // 从请求头获取token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.json({
        code: 1,
        message: '缺少token'
      });
    }
    
    // 使用token直接作为openid
    const openid = token;
    const { amount, payment_type } = req.body;
    
    // 验证金额
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.json({
        code: 1,
        message: '无效的充值金额'
      });
    }
    
    // 尝试从数据库获取用户信息
    let user;
    let balanceBefore = 0;
    
    try {
      user = await User.findOne({ openid });
      if (!user) {
        return res.json({
          code: 1,
          message: '用户不存在'
        });
      }
      
      // 记录充值前的余额
      balanceBefore = user.balance;
      
      // 更新用户余额
      user.balance += parseFloat(amount);
      await user.save();
      
      // 创建充值交易记录
      const transaction = new Transaction({
        user_id: user._id,
        type: 'recharge',
        amount: parseFloat(amount),
        balance_before: balanceBefore,
        balance_after: user.balance,
        payment_type,
        status: 'completed',
        transaction_no: `TX${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
      await transaction.save();
      
      // 返回成功响应
      res.json({
        code: 0,
        message: '充值成功',
        data: {
          balance: user.balance,
          transaction: {
            _id: transaction._id.toString(),
            amount: transaction.amount,
            type: transaction.type,
            created_at: transaction.created_at.toISOString()
          }
        }
      });
    } catch (dbError) {
      console.log('数据库操作失败，使用模拟数据:', dbError.message);
      // 使用模拟数据返回充值结果
      balanceBefore = 100;
      const newBalance = balanceBefore + parseFloat(amount);
      
      res.json({
        code: 0,
        message: '充值成功（模拟数据）',
        data: {
          balance: newBalance,
          transaction: {
            _id: `TX${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            amount: parseFloat(amount),
            type: 'recharge',
            created_at: new Date().toISOString()
          }
        }
      });
    }
  } catch (error) {
    console.error('充值失败:', error);
    res.json({
      code: 1,
      message: '充值失败',
      error: error.message
    });
  }
});

// 获取用户信息接口
app.get('/api/v1/user/info', async (req, res) => {
  try {
    // 从请求头获取token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.json({
        code: 1,
        message: '缺少token'
      });
    }
    
    // 使用token直接作为openid
    const openid = token;
    
    // 尝试从数据库获取用户信息
    let user;
    let transactions = [];
    
    try {
      user = await User.findOne({ openid });
      
      if (!user) {
        // 如果用户不存在，创建一个新用户
        user = new User({
          openid,
          nickname: '测试用户',
          avatar_url: 'https://app2.55555566.com/jws/images/sport.png',
          balance: 50
        });
        await user.save();
      }
      
      // 获取用户的交易记录
      transactions = await Transaction.find({ user_id: user._id })
        .sort({ created_at: -1 })
        .limit(10);
    } catch (dbError) {
      console.log('数据库操作失败，使用模拟数据:', dbError.message);
      // 使用模拟数据
      user = {
        nickname: '测试用户',
        avatar_url: 'https://app2.55555566.com/jws/images/sport.png',
        balance: 50
      };
      transactions = [];
    }
    
    // 格式化交易记录
    const formattedTransactions = transactions.map(tx => ({
      _id: tx._id?.toString() || `TX${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      service_name: tx.service_id ? '消费项目' : '充值',
      amount: tx.amount || 0,
      type: tx.type || 'payment',
      created_at: tx.created_at?.toISOString() || new Date().toISOString()
    }));
    
    // 返回用户信息
    res.json({
      code: 0,
      message: '获取用户信息成功',
      data: {
        nickName: user.nickname,
        avatarUrl: user.avatar_url,
        balance: parseFloat(user.balance) || 0,
        transactions: formattedTransactions,
        token: `${openid}_${Date.now()}`
      }
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    // 无论如何都返回模拟数据，确保接口可用
    res.json({
      code: 0,
      message: '获取用户信息成功（模拟数据）',
      data: {
        nickName: '测试用户',
        avatarUrl: 'https://app2.55555566.com/jws/images/sport.png',
        balance: 50,
        transactions: [],
        token: `mock_${Date.now()}`
      }
    });
  }
});

// 管理员登录接口
app.post('/api/v1/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 检查参数
    if (!username || !password) {
      return res.json({
        code: 1,
        message: '缺少用户名或密码'
      });
    }
    
    // 模拟管理员用户（用户名：admin，密码：123456）
    const mockAdminUser = {
      username: 'admin',
      password: '123456',
      role: 'admin'
    };
    
    // 验证用户名和密码
    if (username === mockAdminUser.username && password === mockAdminUser.password) {
      // 登录成功，返回token
      return res.json({
        code: 0,
        message: '登录成功',
        data: {
          token: `admin_token_${Date.now()}` // 简单的token生成
        }
      });
    } else {
      // 登录失败
      return res.json({
        code: 1,
        message: '用户名或密码错误'
      });
    }
  } catch (error) {
    console.error('管理员登录失败:', error);
    res.json({
      code: 1,
      message: '登录失败',
      error: error.message
    });
  }
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`服务器运行在 http://192.168.8.2:${PORT}`);
  console.log('API接口：');
  console.log('POST http://localhost:3000/api/v1/user/login - 用户登录接口');
  console.log('GET http://localhost:3000/api/v1/user/info - 获取用户信息接口');
  console.log('POST http://localhost:3000/api/v1/admin/login - 管理员登录接口');
  console.log('GET http://localhost:3000/api/v1/admin/barbers - 获取理发师列表');
  console.log('POST http://localhost:3000/api/v1/admin/barbers - 创建理发师');
  console.log('PUT http://localhost:3000/api/v1/admin/barbers/:id - 更新理发师');
  console.log('DELETE http://localhost:3000/api/v1/admin/barbers/:id - 删除理发师');
  
  console.log('\n开发模式说明：');
  console.log('1. 跳过了微信API调用，使用模拟数据');
  console.log('2. 所有登录请求都会返回成功');
  console.log('3. 模拟了用户余额和交易记录');
  console.log('4. 管理员默认用户名：admin，密码：123456');
  console.log('5. 无需真实的微信AppID和secret');
  console.log('6. MongoDB数据库已配置，连接地址：mongodb://127.0.0.1:27017/barberpro');
});
