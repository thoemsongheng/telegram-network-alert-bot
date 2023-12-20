require("dotenv").config();
import { Telegraf } from "telegraf";
import { CronJob } from "cron";
import ping from "ping";
import moment from "moment-timezone";
import { hosts } from "../data/hosts";

const TOKEN = process.env.TOKEN;
const GROUP_ID = "-4012462704";
const bot = new Telegraf(String(TOKEN));

const format = "hh:mm:ss";
const currentTime = moment().tz("Asia/Phnom_Penh");
const start = moment("05:00:00", format);
const end = moment("20:00:00", format);

let alive: { host: string; live: boolean; time: moment.Moment }[] = [];

const job = new CronJob(
  "*/5 * * * * *",
  () => {
    hosts.forEach(async (host) => {
      let res = await ping.promise.probe(host.ip, { timeout: 30 });
      if (!currentTime.isBetween(start, end)) return;
      if (res?.alive) {
        const found = alive.find((x) => x.host === host.ip);
        if (found) {
          if (found.live === false) {
            found.live = true;
            const message = `● Alert: RECOVERY ✅\n- Type: UP\n- name: ${host.name}\n- IP: ${host.ip}\n- SID: ${host.sid}\n- CID: ${host.cid}\n- Address: ${host.loc}\n${res.output}`;
            // bot.telegram.sendMessage(GROUP_ID, message);
            console.log(message);
          }
        } else {
          alive.push({ host: host.ip, live: true, time: currentTime });
        }
      }
      if (!res?.alive) {
        const found = alive.find((x) => x.host === host.ip);
        if (found) {
          if (found.live === true) {
            found.live = false;
            const message = `● Alert: PROBLEM ❌\n- Type: DOWN\n- name: ${host.name}\n- IP: ${host.ip}\n- SID: ${host.sid}\n- CID: ${host.cid}\n- Address: ${host.loc}\n${res.output}`;
            // bot.telegram.sendMessage(GROUP_ID, message);
            console.log(message);
          }
        } else {
          alive.push({ host: host.ip, live: false, time: currentTime });
        }
      }
    });
  },
  null,
  true,
  "Asia/Phnom_Penh"
);

job.start();

bot.launch();
