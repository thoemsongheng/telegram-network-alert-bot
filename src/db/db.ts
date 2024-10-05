require("dotenv").config();
import mongoose from "mongoose";
const uri = process.env.URI;

connect().catch((err) => console.log(err));

async function connect() {
  await mongoose.connect(String(uri));
  console.log("Databse conneted success!");
}

const hostSchema = new mongoose.Schema({
  name: String,
  ipAddress: String,
  location: String,
  serviceId: String,
  customerId: String,
});

const Host = mongoose.model("Host", hostSchema);

/**
 * create new host exmaple
 * const googleHost = new Host({
    name: "Google Ip",
    ipAddress: "8.8.8.8",
    location: "",
    serviceId: "",
    customerId: "",
  });
  googleHost.save();
 */

export { connect, Host };
