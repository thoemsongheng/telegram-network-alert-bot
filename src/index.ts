require("dotenv").config();
import { Bot, Context, GrammyError, HttpError } from "grammy";
import moment from "moment-timezone";
import { connect, HostType } from "./db/db";
import { ping, ResponseType } from "./utils/ping";
import { addHost, getHost } from "./hosts";

const TOKEN = process.env.TOKEN;
const groupId = process.env.GROUP_ID;
const bot = new Bot(String(TOKEN));

connect();

type HostState = {
  [key: string]: {
    step?: number;
    name?: string;
    ip?: string;
    isp?: string;
    sid?: string;
    cid?: string;
    loc?: string;
  };
};

const state: HostState = {};

bot.command("addhost", async (ctx: Context) => {
  const chatId = ctx?.chat?.id;
  ctx.reply("Okay, What is your new host name?");
  state[Number(chatId)] = { step: 1 };
});

bot.on(":text", async (ctx: Context) => {
  const chatId = ctx?.chat?.id;
  const step = state[String(chatId)]?.step || 0;

  switch (step) {
    case 1: {
      state[String(chatId)].name = ctx.message?.text;
      ctx.reply("What is it's IP address?");
      state[String(chatId)].step = 2;
      break;
    }
    case 2: {
      state[String(chatId)].ip = ctx.message?.text;
      ctx.reply("What is the ISP name?");
      state[String(chatId)].step = 3;
      break;
    }
    case 3: {
      if (ctx.message?.text === "none") {
        state[String(chatId)].isp = "";
      } else {
        state[String(chatId)].isp = ctx.message?.text;
      }
      ctx.reply("What is it's service Id? (if no type none)");
      state[String(chatId)].step = 4;
      break;
    }
    case 4: {
      if (ctx.message?.text === "none") {
        state[String(chatId)].sid = "";
      } else {
        state[String(chatId)].sid = ctx.message?.text;
      }
      ctx.reply("What is it's customer Id? (if no type none)");
      state[String(chatId)].step = 5;
      break;
    }
    case 5: {
      if (ctx.message?.text === "none") {
        state[String(chatId)].cid = "";
      } else {
        state[String(chatId)].cid = ctx.message?.text;
      }
      ctx.reply("Where is it's location?");
      state[String(chatId)].step = 6;
      break;
    }
    case 6: {
      if (ctx.message?.text === "none") {
        state[String(chatId)].loc = "";
      } else {
        state[String(chatId)].loc = ctx.message?.text;
      }
      const { name, ip, isp, sid, cid, loc } = state[String(chatId)];
      ctx.reply(
        `✅ Okay new host is added.\n- Host Name : ${name}\n- IP Address : ${ip} \n- ISP Name : ${isp} \n- Service ID : ${sid} \n- Customer ID : ${cid} \n- Address : ${loc}`
      );
      addHost({
        name: String(name),
        ipAddress: String(ip),
        provider: String(isp),
        location: String(loc),
        serviceId: String(sid),
        customerId: String(cid),
      });
      delete state[String(chatId)];
      break;
    }
    default: {
      ctx.reply("Invalid input or command.");
      break;
    }
  }
});

const currentTime = (): moment.Moment => moment().tz("Asia/Phnom_Penh");

interface HostStatus {
  alive: boolean | null;
  failureCount: number;
}

const threshold = 5; // Set the threshold for minimum failures

// pinging each hosts
(() => {
  getHost()
    .then((data) => {
      const hosts = data.map((x) => ({
        name: x.name,
        ipAddress: x.ipAddress,
        provider: x.provider,
        serviceId: x.serviceId,
        customerId: x.customerId,
        location: x.location,
      }));

      // store prev state to count maximum failed before send message
      const hostStatuses: Record<string, HostStatus> = hosts?.reduce(
        (acc, host) => {
          acc[host?.ipAddress] = { alive: true, failureCount: 0 };
          return acc;
        },
        {} as Record<string, HostStatus>
      );

      // ip addr ping func
      const pingHosts = () => {
        const pingPromises = hosts?.map((host: HostType) => {
          return ping(host?.ipAddress)
            .then((result: ResponseType) => {
              const currentStatus = result.alive;
              const hostStatus = hostStatuses[host?.ipAddress];

              // set initial value
              if (!hostStatus) {
                hostStatuses[host?.ipAddress] = {
                  alive: currentStatus,
                  failureCount: 0,
                };
                return;
              }

              // checking ping status and update value
              if (hostStatus?.alive !== null) {
                if (hostStatus?.alive && !currentStatus) {
                  hostStatus.failureCount += 1;

                  if (hostStatus?.failureCount >= threshold) {
                    console.log(host, "down");
                    hostStatus.alive = false;
                  }
                } else if (!hostStatus?.alive && currentStatus) {
                  hostStatus.failureCount = 0;
                  console.log(host, "up");
                  hostStatus.alive = true;
                } else if (currentStatus) {
                  hostStatus.failureCount = 0;
                }
              } else {
                hostStatus.alive = currentStatus;
                hostStatus.failureCount = 0;
              }
            })
            .catch((error) => console.log(error));
        });

        // execute ping func
        Promise.all(pingPromises).then(() => {
          console.log("Ping complete. Restarting in 5 seconds...");
          setTimeout(pingHosts, 10000); // Restart the timer after 5 seconds
        });
      };

      // Start the first ping
      pingHosts();
    })
    .catch((err) => console.log(err));
})();

// error handling
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
