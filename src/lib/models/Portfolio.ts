import mongoose, { Schema, Document } from "mongoose";

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
    closedAt: { type: Date, default: null },
    closePrice: { type: Number, default: null },
    profit: { type: Number, default: null },
});

export interface IPortfolio extends Document {
    userId: string;
    balance: number;
    positions: ITrade[];
    createdAt: Date;
}

const PortfolioSchema: Schema = new Schema({
    userId: { type: String, required: true },
    balance: { type: Number, required: true, default: 10000 },
    positions: [TradeSchema],
    createdAt: { type: Date, default: Date.now },
}, {
    collection: "portfolios"
});

export default mongoose.models.Portfolio || mongoose.model<IPortfolio>("Portfolio", PortfolioSchema);