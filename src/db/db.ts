import mongoose from "mongoose";
const uri = process.env.URI;

async function conn() {
  await mongoose.connect(String(uri));
}
