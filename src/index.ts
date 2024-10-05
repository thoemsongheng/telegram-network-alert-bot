require("dotenv").config();
import { Bot, Context, GrammyError, HttpError } from "grammy";
import moment from "moment-timezone";
// import ping, { PingResponse } from "ping";
import { Host, hosts } from "./hosts";

import { ping, ResponseType } from "./utils/ping";

const TOKEN = process.env.TOKEN;
const groupId = process.env.GROUP_ID;
const bot = new Bot(String(TOKEN));

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
      state[String(chatId)].isp = ctx.message?.text;
      ctx.reply("What is it's service Id? (if no type none)");
      state[String(chatId)].step = 4;
      break;
    }
    case 4: {
      state[String(chatId)].sid = ctx.message?.text;
      ctx.reply("What is it's customer Id? (if no type none)");
      state[String(chatId)].step = 5;
      break;
    }
    case 5: {
      state[String(chatId)].cid = ctx.message?.text;
      ctx.reply("Where is it's location?");
      state[String(chatId)].step = 6;
      break;
    }
    case 6: {
      state[String(chatId)].loc = ctx.message?.text;
      const { name, ip, isp, sid, cid, loc } = state[String(chatId)];
      ctx.reply(
        `✅ Okay new host is added.\n- Host Name : ${name}\n- IP Address : ${ip} \n- ISP Name : ${isp} \n- Service ID : ${sid} \n- Customer ID : ${cid} \n- Address : ${loc}`
      );
      console.log(state);
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
// const sendMessage = (host: Host, res: PingResponse) => {
//   const date = currentTime().format("lll");
//   const statusMessage = `● Alert: ${res.alive ? "UP" : "DOWN"} ${
//     res.alive ? "✅" : "❌"
//   }\n- Type: ${res.alive ? "UP" : "DOWN"}\n- name: ${host.name}\n- IP: ${
//     host.ip
//   }\n- SID: ${host.sid}\n- CID: ${host.cid}\n- Address: ${
//     host.location
//   }\n- Date: ${date}\n${res ? res.output : ""}`;

//   // Send message or log it
//   // bot.api.sendMessage(String(groupId), statusMessage);
//   console.log(statusMessage);
// };

// ((): void => {
//   const hostStatuses: Record<string, HostStatus> = hosts.reduce((acc, host) => {
//     acc[host.ip] = { alive: true, failureCount: 0 };
//     return acc;
//   }, {} as Record<string, HostStatus>);

//   setInterval(() => {
//     hosts.forEach((host) => {
//       ping.promise
//         .probe(host.ip)
//         .then((res: ping.PingResponse) => {
//           console.log(res.host, res.alive);
//           const currentStatus = res.alive;
//           const hostStatus = hostStatuses[host.ip];

//           if (hostStatus.alive !== null) {
//             if (hostStatus.alive && !currentStatus) {
//               hostStatus.failureCount += 1;

//               if (hostStatus.failureCount >= threshold) {
//                 sendMessage(host, res);
//                 hostStatus.alive = false;
//               }
//             } else if (!hostStatus.alive && currentStatus) {
//               hostStatus.failureCount = 0;
//               sendMessage(host, res);
//               hostStatus.alive = true;
//             } else if (currentStatus) {
//               hostStatus.failureCount = 0;
//             }
//           } else {
//             hostStatus.alive = currentStatus;
//           }
//         })
//         .catch((err: Error) => {
//           console.error(`Error pinging ${host.ip}:`, err);
//         });
//     });
//   }, 2000);
// })();

const testHost: { ip: string }[] = [
  { ip: "192.168.1.8" },
  { ip: "1.1.1.1" },
  { ip: "192.168.0.98" },
];

interface HostStatus {
  alive: boolean | null;
  failureCount: number;
}

const threshold = 5; // Set the threshold for minimum failures

// pinging each hosts
(() => {
  // store prev state to count maximum failed before send message
  const hostStatuses: Record<string, HostStatus> = testHost.reduce(
    (acc, host) => {
      acc[host.ip] = { alive: true, failureCount: 0 };
      return acc;
    },
    {} as Record<string, HostStatus>
  );

  // ip addr ping func
  const pingHosts = () => {
    const pingPromises = testHost.map((host) => {
      return ping(host.ip)
        .then((result: ResponseType) => {
          const currentStatus = result.alive;
          const hostStatus = hostStatuses[host.ip];

          // set initial value
          if (!hostStatus) {
            hostStatuses[host.ip] = { alive: currentStatus, failureCount: 0 };
            return;
          }

          // checking ping status and update value
          if (hostStatus?.alive !== null) {
            if (hostStatus?.alive && !currentStatus) {
              hostStatus.failureCount += 1;

              if (hostStatus?.failureCount >= threshold) {
                console.log(host, result);
                hostStatus.alive = false;
              }
            } else if (!hostStatus?.alive && currentStatus) {
              hostStatus.failureCount = 0;
              console.log(host, result);
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
      setTimeout(pingHosts, 25000); // Restart the timer after 5 seconds
    });
  };

  // Start the first ping
  pingHosts();
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
