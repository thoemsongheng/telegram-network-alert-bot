import moment from "moment-timezone";
import { HostType } from "../db/db";
import { ResponseType } from "../utils/ping";

const currentTime = (): moment.Moment => moment().tz("Asia/Phnom_Penh");
const sendMessage = (
  res: ResponseType,
  host: HostType,
  onCompleted: (message: string) => void
) => {
  const date = currentTime().format("lll");

  const statusMessage = `● Alert: ${res.alive ? "UP" : "DOWN"} ${
    res.alive ? "✅" : "❌"
  }\n- Type: ${res.alive ? "UP" : "DOWN"}\n- name: ${host.name}\n- IP: ${
    host?.ipAddress
  }\n- SID: ${host.serviceId}\n- CID: ${host.customerId}\n- Address: ${
    host.location
  }\n- Date: ${date}\n${res ? res.output : ""}`;

  // Return  message
  onCompleted(statusMessage);
};

export { sendMessage };
