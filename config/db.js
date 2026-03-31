const mongoose = require('mongoose');

// MongoDB连接配置
const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/barberpro');
    console.log(`MongoDB连接成功: ${conn.connection.host}`);
    
    // 自动创建数据库结构
    await createDatabaseStructure(conn);
    
  } catch (error) {
    console.error(`MongoDB连接失败: ${error.message}`);
    console.error('请确保MongoDB服务已启动');
    // 不退出进程，以便继续使用模拟数据
    console.log('使用模拟数据继续运行...');
  }
};

// 创建数据库结构
const createDatabaseStructure = async (conn) => {
  const db = conn.connection.db;
  
  console.log('=== 开始创建数据库结构 ===');
  
  // 创建集合
  const collections = ['users', 'services', 'transactions', 'admins', 'barbers'];
  for (const collection of collections) {
    const exists = await db.listCollections({ name: collection }).hasNext();
    if (!exists) {
      await db.createCollection(collection);
      console.log(`✓ 创建集合: ${collection}`);
    } else {
      console.log(`✓ 集合已存在: ${collection}`);
    }
  }
  
  // 创建索引
  console.log('\n=== 创建索引 ===');
  
  // 用户表索引
  await db.collection('users').createIndex({ openid: 1 }, { unique: true });
  console.log('✓ 用户表索引: openid (唯一)');
  
  // 交易表索引
  await db.collection('transactions').createIndex({ user_id: 1 });
  await db.collection('transactions').createIndex({ created_at: -1 });
  await db.collection('transactions').createIndex({ transaction_no: 1 }, { unique: true });
  console.log('✓ 交易表索引: user_id, created_at, transaction_no (唯一)');
  
  // 项目表索引
  await db.collection('services').createIndex({ name: 1 }, { unique: true });
  console.log('✓ 项目表索引: name (唯一)');
  
  // 管理员表索引
  await db.collection('admins').createIndex({ username: 1 }, { unique: true });
  console.log('✓ 管理员表索引: username (唯一)');
  
  // 理发师表索引
  await db.collection('barbers').createIndex({ name: 1 }, { unique: true });
  console.log('✓ 理发师表索引: name (唯一)');
  
  // 插入初始数据
  console.log('\n=== 插入初始数据 ===');
  
  // 初始管理员用户
  const adminCount = await db.collection('admins').countDocuments({ username: 'admin' });
  if (adminCount === 0) {
    await db.collection('admins').insertOne({
      username: 'admin',
      password_hash: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', // 密码: 123456
      created_at: new Date(),
      updated_at: new Date()
    });
    console.log('✓ 插入初始管理员用户: admin/123456');
  }
  
  // 初始服务项目
  const serviceCount = await db.collection('services').countDocuments();
  if (serviceCount === 0) {
    await db.collection('services').insertMany([
      {
        name: '理发',
        price: 50,
        member_price: 40,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '染发',
        price: 150,
        member_price: 120,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '烫发',
        price: 200,
        member_price: 160,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
    console.log('✓ 插入初始服务项目: 理发、染发、烫发');
  }
  
  // 初始理发师
  const barberCount = await db.collection('barbers').countDocuments();
  if (barberCount === 0) {
    await db.collection('barbers').insertMany([
      {
        name: '托尼老师',
        avatar_url: 'https://app2.55555566.com/jws/images/tony.png',
        phone: '13800138001',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '凯文老师',
        avatar_url: 'https://app2.55555566.com/jws/images/kevin.png',
        phone: '13800138002',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
    console.log('✓ 插入初始理发师: 托尼老师、凯文老师');
  }
  
  console.log('\n=== 数据库结构创建完成 ===');
};

module.exports = connectDB;