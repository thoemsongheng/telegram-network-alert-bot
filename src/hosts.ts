import { Host, HostType } from "./db/db";

const getHost = async () => {
  const hosts = await Host.find();
  return hosts as HostType[];
};

const addHost = async (args: HostType) => {
  const newHost = new Host(args);
  await newHost.save();
};

const deleteHost = async (ip: string, args: HostType) => {
  const foundHost = Host.findOne({ ipAddress: ip });
  await foundHost.deleteOne();
};

export { addHost, deleteHost, getHost };
