require("dotenv").config();
import mongoose from "mongoose";
const uri = process.env.URI;

connect().catch((err) => console.log(err));

async function connect() {
  await mongoose.connect(String(uri));
  console.log("Databse conneted success! ✅");
}

type HostType = {
  name: string;
  ipAddress: string;
  location?: string;
  provider?: string;
  serviceId?: string;
  customerId?: string;
};

const hostSchema = new mongoose.Schema({
  name: String,
  ipAddress: String,
  provider: String,
  location: String,
  serviceId: String,
  customerId: String,
});

const Host = mongoose.model("Host", hostSchema);

export { connect, Host, HostType };
