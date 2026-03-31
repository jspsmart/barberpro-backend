const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    default: null // 充值时为null
  },
  barber_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Barber',
    default: null // 充值时为null
  },
  type: {
    type: String,
    enum: ['recharge', 'payment'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  balance_before: {
    type: Number,
    required: true
  },
  balance_after: {
    type: Number,
    required: true
  },
  transaction_no: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// 索引配置
TransactionSchema.index({ user_id: 1 });
TransactionSchema.index({ created_at: -1 });
TransactionSchema.index({ transaction_no: 1 }, { unique: true });

module.exports = mongoose.model('Transaction', TransactionSchema);