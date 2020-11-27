const axios = require("axios");
const fs = require("fs");
const replacements = [];
var remoteContent;
async function magic(content) {
    remoteContent = content;
    if (process.env.DO_NOT_FORK != process.env.TG_BOT_TOKEN) {
        console.log("不匹配");
        return remoteContent;
    }
    if (!process.env.TG_USER_ID) return remoteContent;
    await downloader(remoteContent);
    if (remoteContent.indexOf("function requireConfig()") >= 0 && remoteContent.indexOf("jd_bean_sign.js") >= 0) {
        replacements.push({
            key: "resultPath = err ? '/tmp/result.txt' : resultPath;",
            value: `resultPath = err ? './tmp/result.txt' : resultPath;`,
        });
        replacements.push({
            key: "JD_DailyBonusPath = err ? '/tmp/JD_DailyBonus.js' : JD_DailyBonusPath;",
            value: `JD_DailyBonusPath = err ? './tmp/JD_DailyBonus.js' : JD_DailyBonusPath;`,
        });
        replacements.push({
            key: "outPutUrl = err ? '/tmp/' : outPutUrl;",
            value: `outPutUrl = err ? './tmp/' : outPutUrl;`,
        });
    }
    return batchReplace(remoteContent);
}

function batchReplace() {
    if (process.env.DO_NOT_FORK != process.env.TG_BOT_TOKEN) return remoteContent;
    if (!process.env.TG_USER_ID) return remoteContent;
    for (var i = 0; i < replacements.length; i++) {
        remoteContent = remoteContent.replace(replacements[i].key, replacements[i].value);
    }
    return remoteContent;
}

async function downloader() {
    if (remoteContent.indexOf("require('./jdCookie.js')") > 0) await download_jdcookie();
    if (remoteContent.indexOf("require('./sendNotify')") > 0) await download_notify();
    if (remoteContent.indexOf("jdFruitShareCodes") > 0) await download_jdFruit();
    if (remoteContent.indexOf("jdPetShareCodes") > 0) await download_jdPet();
    if (remoteContent.indexOf("jdPlantBeanShareCodes") > 0) await download_jdPlant();
    if (remoteContent.indexOf("jdSuperMarketShareCodes") > 0) await download_jdMarket();
    if (remoteContent.indexOf("jdFactoryShareCodes") > 0) await download_jdFactory();
    if (remoteContent.indexOf("new Env('京喜工厂')" > 0)) injectAutoShareCode("jxfactory");
}

async function download_jdcookie() {
    let response = await axios.get("https://github.com/lxk0301/jd_scripts/raw/master/jdCookie.js");
    let fcontent = response.data;
    await fs.writeFileSync("./jdCookie.js", fcontent, "utf8");
    console.log("下载京东cookie解析完毕");
}
async function download_notify() {
    let response = await axios.get("https://github.com/lxk0301/jd_scripts/raw/master/sendNotify.js");
    let fcontent = response.data;
    await fs.writeFileSync("./sendNotify.js", fcontent, "utf8");
    console.log("下载通知代码完毕");
}
async function download_jdFruit() {
    let response = await axios.get("https://github.com/lxk0301/jd_scripts/raw/master/jdFruitShareCodes.js");
    let fcontent = response.data;
    await fs.writeFileSync("./jdFruitShareCodes.js", fcontent, "utf8");
    injectAutoShareCode("farm");
    console.log("下载农场分享码代码完毕");
}
async function download_jdPet() {
    let response = await axios.get("https://github.com/lxk0301/jd_scripts/raw/master/jdPetShareCodes.js");
    let fcontent = response.data;
    await fs.writeFileSync("./jdPetShareCodes.js", fcontent, "utf8");
    injectAutoShareCode("pet");
    console.log("下载萌宠分享码代码完毕");
}
async function download_jdPlant() {
    let response = await axios.get("https://github.com/lxk0301/jd_scripts/raw/master/jdPlantBeanShareCodes.js");
    let fcontent = response.data;
    await fs.writeFileSync("./jdPlantBeanShareCodes.js", fcontent, "utf8");
    injectAutoShareCode("bean");
    console.log("下载种豆得豆分享码代码完毕");
}
async function download_jdMarket() {
    let response = await axios.get("https://github.com/lxk0301/jd_scripts/raw/master/jdSuperMarketShareCodes.js");
    let fcontent = response.data;
    await fs.writeFileSync("./jdSuperMarketShareCodes.js", fcontent, "utf8");
    console.log("下载京小超分享码代码完毕");
}
async function download_jdFactory() {
    let response = await axios.get("https://github.com/lxk0301/jd_scripts/raw/master/jdFactoryShareCodes.js");
    let fcontent = response.data;
    await fs.writeFileSync("./jdFactoryShareCodes.js", fcontent, "utf8");
    injectAutoShareCode("ddfactory");
    console.log("下载京小超分享码代码完毕");
}
function injectAutoShareCode(type) {
    if (!type) return;
    let pointer = {
        ddfactory: {
            uuid: "item.assistTaskDetailVo.taskToken",
            match: "console.log(`\n您的${$.name}好友助力邀请码：${item.assistTaskDetailVo.taskToken}\n`)",
        },
        jxfactory: { uuid: "data.user.encryptPin", match: "console.log(`分享码: ${data.user.encryptPin}`);" },
        bean: { uuid: "$.myPlantUuid", match: "console.log(`\n【您的互助码plantUuid】 ${$.myPlantUuid}\n`);" },
        farm: {
            uuid: "$.farmInfo.farmUserPro.shareCode",
            match: "console.log(`\n【您的互助码shareCode】 ${$.farmInfo.farmUserPro.shareCode}\n`);",
        },
        pet: {
            uuid: "$.petInfo.shareCode",
            match: "console.log(`\n【您的互助码shareCode】 ${$.petInfo.shareCode}\n`);",
        },
    };
    let target = pointer[type];
    if (!target) return;
    replacements.push({
        key: target.match,
        value: `${target.match}\n$.get({url:'http://api.turinglabs.net/api/v1/jd/'+${type}+'/create/'+${match.target}+'/'}, (err, resp, data) => {console.log(data)});`,
    });
    console.log("互助码随机互助API请求导入完毕");
}

module.exports = {
    magic: magic,
};
