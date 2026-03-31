const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 理发师模型
const BarberSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  avatar_url: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// 更新updated_at字段
BarberSchema.pre('save', function() {
  this.updated_at = Date.now();
});

BarberSchema.pre('findOneAndUpdate', function() {
  this.set({ updated_at: Date.now() });
});

const Barber = mongoose.model('Barber', BarberSchema);

module.exports = Barber;
