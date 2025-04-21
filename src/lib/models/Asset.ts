import mongoose, { Schema } from 'mongoose';

const assetSchema = new Schema({
  symbol: { type: String, unique: true, required: true },
});

export default mongoose.models.Asset || mongoose.model('Asset', assetSchema);