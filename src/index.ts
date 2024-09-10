require("dotenv").config();
import { Bot, Context, GrammyError, HttpError } from "grammy";
import { PingAlert } from "./utils/ping";
import { hosts, hostsType } from "./hosts";

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

//run ping function
PingAlert(hosts);

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
