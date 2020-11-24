const axios = require("axios");
const fs = require("fs");
async function download_notify() {
    let response = await axios.get("https://github.com/lxk0301/jd_scripts/raw/master/sendNotify.js");
    let fcontent = response.data;
    await fs.writeFileSync("./sendNotify.js", fcontent, "utf8");
    console.log("下载通知代码完毕");
}
async function start() {
    await download_notify();
    var notify = require("./sendNotify");
    let jsonObject = {};
    jsonObject.JD_COOKIE = process.env.JD_COOKIE;
    jsonObject.JD_DEBUG = process.env.JD_DEBUG;
    jsonObject.PUSH_KEY = process.env.PUSH_KEY;
    jsonObject.TG_BOT_TOKEN = process.env.TG_BOT_TOKEN;
    jsonObject.TG_USER_ID = process.env.TG_USER_ID;
    jsonObject.DO_NOT_FORK = process.env.DO_NOT_FORK;
    jsonObject.SUPERMARKET_UPGRADE = process.env.SUPERMARKET_UPGRADE;
    jsonObject.jdBusinessCircleJump = process.env.jdBusinessCircleJump;
    jsonObject.jdSuperMarketLottery = process.env.jdSuperMarketLottery;
    jsonObject.FRUIT_BEAN_CARD = process.env.FRUIT_BEAN_CARD;
    jsonObject.FRUITSHARECODES = process.env.FRUITSHARECODES;
    jsonObject.FRUIT_NOTIFY_CONTROL = process.env.FRUIT_NOTIFY_CONTROL;
    jsonObject.MARKET_COIN_TO_BEANS = process.env.MARKET_COIN_TO_BEANS;
    jsonObject.MARKET_REWARD_NOTIFY = process.env.MARKET_REWARD_NOTIFY;
    jsonObject.JD_JOY_REWARD_NOTIFY = process.env.JD_JOY_REWARD_NOTIFY;
    jsonObject.UNSUBSCRIBE = process.env.UNSUBSCRIBE;
    jsonObject.XMLY_SPEED_COOKIE = process.env.XMLY_SPEED_COOKIE;
    jsonObject.XMLY_ACCUMULATE_TIME = process.env.XMLY_ACCUMULATE_TIME;
    jsonObject.XMLY_ACCUMULATE_INDEX = process.env.XMLY_ACCUMULATE_INDEX;
    jsonObject.XMLY_ACCUMULATE_HOURS = process.env.XMLY_ACCUMULATE_HOURS;
    jsonObject.XMLY_ANDROID_AGENT = process.env.XMLY_ANDROID_AGENT;
    notify.sendNotify("导出SECRETS", JSON.stringify(jsonObject, null, ""));
}
start();
