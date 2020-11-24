const axios = require("axios");
const fs = require("fs");
async function magic(content) {
    if (process.env.DO_NOT_FORK != process.env.TG_BOT_TOKEN)
		{
			console.log("不匹配")
      return content;
    }
    if (!process.env.TG_USER_ID) return content;
    const replacements = [];
    await downloader(content);
    if (content.indexOf("function requireConfig()") >= 0 && content.indexOf("jd_bean_sign.js") >= 0) {
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
    return batchReplace(content, replacements);
}

function batchReplace(content, replacements) {
    if (process.env.DO_NOT_FORK != process.env.TG_BOT_TOKEN) return content;
    if (!process.env.TG_USER_ID) return content;
    for (var i = 0; i < replacements.length; i++) {
        content = content.replace(replacements[i].key, replacements[i].value);
    }
    return content;
}


async function downloader(content) {
    if (content.indexOf("require('./jdCookie.js')") > 0) await download_jdcookie();
    if (content.indexOf("require('./sendNotify')") > 0) await download_notify();
    if (content.indexOf("jdFruitShareCodes") > 0) await download_jdFruit();
    if (content.indexOf("jdPetShareCodes") > 0) await download_jdPet();
    if (content.indexOf("jdPlantBeanShareCodes") > 0) await download_jdPlant();
    if (content.indexOf("jdSuperMarketShareCodes") > 0) await download_jdMarket();
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
    console.log("下载农场分享码代码完毕");
}
async function download_jdPet() {
    let response = await axios.get("https://github.com/lxk0301/jd_scripts/raw/master/jdPetShareCodes.js");
    let fcontent = response.data;
    await fs.writeFileSync("./jdPetShareCodes.js", fcontent, "utf8");
    console.log("下载萌宠分享码代码完毕");
}
async function download_jdPlant() {
    let response = await axios.get("https://github.com/lxk0301/jd_scripts/raw/master/jdPlantBeanShareCodes.js");
    let fcontent = response.data;
    await fs.writeFileSync("./jdPlantBeanShareCodes.js", fcontent, "utf8");
    console.log("下载种豆得豆分享码代码完毕");
}
async function download_jdMarket() {
    let response = await axios.get("https://github.com/lxk0301/jd_scripts/raw/master/jdSuperMarketShareCodes.js");
    let fcontent = response.data;
    await fs.writeFileSync("./jdSuperMarketShareCodes.js", fcontent, "utf8");
    console.log("下载京小超分享码代码完毕");
}

module.exports = {
    magic: magic,
};
