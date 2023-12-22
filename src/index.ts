require("dotenv").config();
import { Bot, GrammyError, HttpError } from "grammy";
import ping from "ping";
import moment from "moment-timezone";
import { hosts } from "../data/hosts";

const TOKEN = process.env.TOKEN;
const GROUP_ID = "-4012462704";
const bot = new Bot(String(TOKEN));

const format = "hh:mm:ss";
const currentTime = moment().tz("Asia/Phnom_Penh");
const start = moment("05:00:00", format);
const end = moment("20:00:00", format);

let alive: { host: string; live: boolean; time: moment.Moment }[] = [];

setInterval(() => {
  hosts.forEach((host) => {
    ping.promise
      .probe(host.ip, { timeout: 30 })
      .then((res) => {
        if (!currentTime.isBetween(start, end)) return;
        if (res?.alive) {
          const found = alive.find((x) => x.host === host.ip);
          if (found) {
            if (found.live === false) {
              found.live = true;
              const message = `● Alert: RECOVERY ✅\n- Type: UP\n- name: ${
                host.name
              }\n- IP: ${host.ip}\n- SID: ${host.sid}\n- CID: ${
                host.cid
              }\n- Address: ${host.loc}\n- Date: ${currentTime.format(
                "lll"
              )}\n${res.output}`;
              // bot.api.sendMessage(GROUP_ID, message);
              console.log(message);
            }
            return;
          } else {
            alive.push({ host: host.ip, live: true, time: currentTime });
          }
        }
        if (!res?.alive) {
          const found = alive.find((x) => x.host === host.ip);
          if (found) {
            if (found.live === true) {
              found.live = false;
              const message = `● Alert: PROBLEM ❌\n- Type: DOWN\n- name: ${
                host.name
              }\n- IP: ${host.ip}\n- SID: ${host.sid}\n- CID: ${
                host.cid
              }\n- Address: ${host.loc}\n- Date: ${currentTime.format(
                "lll"
              )}\n${res.output}`;
              // bot.api.sendMessage(GROUP_ID, message);
              console.log(message);
            }
            return;
          } else {
            alive.push({ host: host.ip, live: false, time: currentTime });
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  });
}, 5000);

//testing middleware
let startCommand: boolean = false;
let host = { name: "", ip: "", isp: "", sid: "", cid: "", loc: "" };
bot.command("addhost", async (ctx, next) => {
  await ctx.reply("Okay. let put some info");
  await ctx.reply(
    "What is your host name? \nNote: start with name: (your connection name)"
  );
  startCommand = true;
  next();
});
bot.on(":text", async (ctx, next) => {
  const message = ctx.message?.text;
  if (!startCommand) return;
  if (message === "addhost") return;
  const args = message?.split(" ");
  if (args) {
    const propName = args[0].split(":").at(0);
    if (propName === "name") {
      const name = args
        ?.filter((x) => {
          if (x !== args[0]) {
            return x;
          }
        })
        .join(" ");
      host.name = name;
      await ctx.reply(
        `What is your host ip? \nNote: start with ip: (your ip address)`
      );
    }
    if (propName === "ip") {
      host.ip = args[1];
      await ctx.reply(
        "What is your isp name? \nNote: start with isp: (your isp name)"
      );
    }
    if (propName === "isp") {
      const isp = args
        ?.filter((x) => {
          if (x !== args[0]) {
            return x;
          }
        })
        .join(" ");
      host.isp = isp;
      await ctx.reply(
        `What is your host Service ID(optional)?\nNote: start with sid: (your service id number)`
      );
    }
    if (propName === "sid") {
      host.sid = args[1];
      if (args[1] === "") {
        host.sid = "";
        return;
      }
      await ctx.reply(
        `What is your host Customer ID?\nNote: start with cid: (your customer id number)`
      );
    }
    if (propName === "cid") {
      if (args[1] === "") {
        host.cid = "";
        await ctx.reply(
          "where is your equipment location? \nNote: start with loc: (your equipment location)"
        );
        return;
      }
      host.cid = args[1];
      await ctx.reply(
        "where is your equipment location? \nNote: start with loc: (your equipment location)"
      );
    }
    if (propName === "loc") {
      const loc = args
        ?.filter((x) => {
          if (x !== args[0]) {
            return x;
          }
        })
        .join(" ");
      host.loc = loc;
      await ctx.reply("type confirm to add connection to bot");
    }
    if (args[0] === "comfirm") {
      await ctx.reply(
        `✅ New host is added to the bot: \n- Connection Name: ${host.name} \n- IP Address: ${host.ip} \n- Internet Service Provider: ${host.isp} \n- Service ID: ${host.sid} \n- Customer ID: ${host.cid} \n- location: ${host.loc}`
      );
      startCommand = false;
    }
  }
});

//error handling
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});

bot.start();
