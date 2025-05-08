import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { dbConnect } from "./db";
import { nextCookies } from "better-auth/next-js";

const mongoose = await dbConnect();

const client = mongoose.connection.getClient()
const db = client.db();
 
export const auth = betterAuth({
  database: mongodbAdapter(db),
  session: {
    cookieCache: {
        enabled: true,
        maxAge: 5 * 60 
    }
  },
    emailAndPassword: {
        enabled: true
    },
    secret: process.env.AUTH_SECRET,
    plugins: [
        nextCookies()
    ]
});