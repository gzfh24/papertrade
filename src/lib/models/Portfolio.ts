import mongoose, { Schema, Document } from "mongoose";

// Trade Schema (embedded)
interface ITrade {
    symbol: string;
    margin: number;
    size: number;
    entryPrice: number;
    isLong: boolean;
    leverage: number;
    openedAt: Date;
    isOpen: boolean;
    closedAt: Date;
    closePrice: number;
    profit: number;
}

const TradeSchema: Schema = new Schema({
    symbol: { type: String, required: true },
    margin: { type: Number, required: true },
    size: { type: Number, required: true },
    entryPrice: { type: Number, required: true },
    isLong: { type: Boolean, required: true },
    leverage: { type: Number, required: true, default: 1 },
    openedAt: { type: Date, default: Date.now },
    isOpen: { type: Boolean, required: true, default: true },
    closedAt: { type: Date },
    closePrice: { type: Number },
    profit: { type: Number, default: 0 },
});

// Portfolio Schema
export interface IPortfolio extends Document {
    userId: string;
    balance: number;
    positions: ITrade[];
    createdAt: Date;
}

const PortfolioSchema: Schema = new Schema({
    userId: { type: String, required: true }, // References user._id from Better Auth
    balance: { type: Number, required: true, default: 10000 },
    positions: [TradeSchema], // Array of trades (perps positions)
    createdAt: { type: Date, default: Date.now },
}, {
    collection: "portfolios"
});

export default mongoose.models.Portfolio || mongoose.model<IPortfolio>("Portfolio", PortfolioSchema);