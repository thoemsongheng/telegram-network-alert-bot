import ping from "ping";
import moment from "moment-timezone";
import fs from "node:fs";

export function Ping() {
  fs.readFile("data/hosts.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    interface Host {
      name: string;
      ip: string;
      sid: string;
      cid: string;
      loc: string;
    }

    const hosts = JSON.parse(data);

    const format = "hh:mm:ss";
    const start = moment("05:00:00", format);
    const end = moment("20:00:00", format);
    const currentTime = (): moment.Moment => moment().tz("Asia/Phnom_Penh");

    let alive: { host: string; live: boolean; time: moment.Moment }[] = [];

    const sendMessage = (
      status: string,
      host: Host,
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

    const checkHosts = (hosts: Host[]) => {
      for (const host of hosts) {
        ping.promise
          .probe(host.ip, { timeout: 1 })
          .then((res) => {
            const isTimeValid = currentTime().isBetween(start, end);

            const found = alive.find((x) => x.host === host.ip);

            if (isTimeValid) {
              if (res?.alive) {
                if (found) {
                  if (!found.live) {
                    found.live = true;
                    sendMessage("RECOVERY", host, true, res);
                  }
                  return;
                }
                alive.push({ host: host.ip, live: true, time: currentTime() });
              } else {
                if (found) {
                  if (found.live) {
                    found.live = false;
                    sendMessage("PROBLEM", host, false, res);
                  }
                  return;
                }
                alive.push({ host: host.ip, live: false, time: currentTime() });
              }
            }
          })
          .catch((error) => {
            console.log(error);
          });
      }
    };

    setInterval(() => {
      checkHosts(hosts); // Assuming hosts is defined somewhere
    }, 1 * 60 * 1000);
  });
}
