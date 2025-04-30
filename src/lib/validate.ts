import { z } from "zod";

export const openTradeSchema = z.object({
    symbol:   z.enum(["BTCUSD", "XAUUSD", "SPXUSD", "NDXUSD"]),
    margin:   z.number().positive(),
    isLong:   z.boolean(),
    leverage: z.number().int().min(1).max(50),
});
