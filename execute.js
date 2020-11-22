const exec = require("child_process").execSync;
const fs = require("fs");
const axios = require("axios");
const stupid = require("./stupid");

// 公共变量
const Secrets = {
    JD_COOKIE: process.env.JD_COOKIE,
    SyncUrl: process.env.SYNCURL,
    PUSH_KEY: process.env.PUSH_KEY, 
    BARK_PUSH: process.env.BARK_PUSH,
    TG_BOT_TOKEN: process.env.TG_BOT_TOKEN,
    TG_USER_ID: process.env.TG_USER_ID,
    MarketCoinToBeanCount: process.env.JDMarketCoinToBeans,
    JoyFeedCount: process.env.JDJoyFeedCount,
    FruitShareCodes: process.env.FruitShareCodes,
    Unsubscribe: process.env.UNSUBSCRIBE,
};

async function changeFiele() {
    let response = await axios.get(Secrets.SyncUrl);
    let content = response.data;
    content = await stupid.magic(content, Secrets);
    await fs.writeFileSync("./execute.js", content, "utf8");
    console.log("替换变量完毕");
}

async function start() {
    console.log(`当前执行时间:${new Date().toString()}`);
    if (!Secrets.JD_COOKIE) {
        console.log("请填写 JD_COOKIE 后在继续");
        return;
    }
    if (!Secrets.SyncUrl) {
        console.log("请填写 SYNCURL 后在继续");
        return;
    }
    console.log(`当前共${Secrets.JD_COOKIE.split("&").length}个账号需要签到`);
    try {
        await changeFiele();
        await exec("node execute.js", { stdio: "inherit" });
    } catch (e) {
        console.log("执行异常:" + e);
    }
    console.log("执行完毕");
}

start();
