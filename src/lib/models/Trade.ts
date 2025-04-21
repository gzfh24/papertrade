import mongoose, { Schema } from 'mongoose';

const tradeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assetId: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
  positionType: { type: String, enum: ['LONG', 'SHORT'], required: true },
  leverage: { type: Number, default: 1 },
  entryPrice: { type: Number, required: true },
  exitPrice: Number,
  quantity: { type: Number, required: true },
  pnl: Number,
  openedAt: { type: Date, default: Date.now },
  closedAt: Date,
  status: { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN' },
});

export default mongoose.models.Trade || mongoose.model('Trade', tradeSchema);