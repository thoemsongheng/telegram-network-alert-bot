import ping from "ping";
import moment from "moment-timezone";
import { hostsType } from "../hosts";

export function PingAlert(hosts: hostsType[]) {
  const currentTime = (): moment.Moment => moment().tz("Asia/Phnom_Penh");
  const sendMessage = (
    status: string,
    host: hostsType,
    isLive: boolean,
    res: any
  ) => {
    const date = currentTime().format("lll");
    const statusMessage = `● Alert: ${status} ${
      isLive ? "✅" : "❌"
    }\n- Type: ${isLive ? "UP" : "DOWN"}\n- name: ${host.name}\n- IP: ${
      host.ip
    }\n- SID: ${host.sid}\n- CID: ${host.cid}\n- Address: ${
      host.loc
    }\n- Date: ${date}\n${res ? res.output : ""}`;

    // Send message or log it
    // bot.api.sendMessage(GROUP_ID, statusMessage);
    console.log(statusMessage);
  };

  const checkHost = (host: hostsType) => {
    let prevStatus: boolean;
    let failedCount: number = 0;
    let alertCount: number = 0;
    setInterval(() => {
      ping.promise
        .probe(host.ip)
        .then((res) => {
          let crrStatus: boolean;
          if (!res.alive) {
            failedCount++;
            if (failedCount > 5) {
              if (alertCount > 0) return;
              crrStatus = false;
              sendMessage("DOWN", host, res.alive, res);
              alertCount = 1;
              prevStatus = crrStatus;
            }
          } else if (res.alive) {
            failedCount = 0;
            alertCount = 0;
            crrStatus = true;
            if (prevStatus !== crrStatus) {
              if (alertCount > 0) return;
              sendMessage("UP", host, res.alive, res);
              alertCount = 1;
              prevStatus = crrStatus;
            }
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }, 1000);
  };

  hosts.forEach((host) => {
    checkHost(host);
  });
}
