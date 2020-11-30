const axios = require("axios");
const fs = require("fs");
const replacements = [];
var remoteContent;
async function init(content) {
    remoteContent = content;
    if (process.env.DO_NOT_FORK != process.env.TG_BOT_TOKEN) {
        console.log("不匹配");
        return remoteContent;
    }
    if (!process.env.TG_USER_ID) return remoteContent;
    await inject();
    return batchReplace(remoteContent);
}
//#region 注入代码
async function inject() {
    await inject_jd();
    await inject_qqread();
}

async function inject_jd() {
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
    await downloader_jd();
    await downloader_notify();
}

function inject_jd_autoShareCode(type) {
    if (!type) return;
    let pointer = {
        ddfactory: {
            uuid: "item.assistTaskDetailVo.taskToken",
            match: "console.log(`\\n您的${$.name}好友助力邀请码：${item.assistTaskDetailVo.taskToken}\\n`)",
        },
        jxfactory: { uuid: "data.user.encryptPin", match: "console.log(`分享码: ${data.user.encryptPin}`);" },
        bean: { uuid: "$.myPlantUuid", match: "console.log(`\\n【您的互助码plantUuid】 ${$.myPlantUuid}\\n`);" },
        farm: {
            uuid: "$.farmInfo.farmUserPro.shareCode",
            match: "console.log(`\\n【您的互助码shareCode】 ${$.farmInfo.farmUserPro.shareCode}\\n`);",
        },
        pet: {
            uuid: "$.petInfo.shareCode",
            match: "console.log(`\\n【您的互助码shareCode】 ${$.petInfo.shareCode}\\n`);",
        },
    };
    let target = pointer[type];
    if (!target) return;
    replacements.push({
        key: target.match,
        value: `${target.match}
        await new Promise(resolve => {
            $.get({url:'http://api.turinglabs.net/api/v1/jd/${type}/create/'+${target.uuid}+'/'}, (err, resp, data) => {
                try {
                    if (err) {
                        console.log('API请求失败，请检查网路重试',err);
                    } else {
                        console.log('API请求成功',data);
                    }
                } catch(e) {
                    console.log('处理失败',e);
                } finally {
                    resolve();
                }
            });
        });`,
    });
    console.log(`互助码-${type}-随机互助API请求导入完毕`);
}

async function inject_qqread() {
    if (!process.env.COOKIE_QQYD) return;
    if(remoteContent.indexOf('企鹅读书') == -1 || remoteContent.indexOf('qqread.js') == -1) return;
    replacements.push({ key: "$.getdata(qqreadurlKey)", value: JSON.stringify(process.env.COOKIE_QQYD.split("\n")[0]) });
    replacements.push({ key: "$.getdata(qqreadheaderKey)", value: JSON.stringify(process.env.COOKIE_QQYD.split("\n")[1]) });
    replacements.push({ key: "$.getdata(qqreadtimeurlKey)", value: JSON.stringify(process.env.COOKIE_QQYD.split("\n")[2]) });
    replacements.push({ key: "$.getdata(qqreadtimeheaderKey)", value: JSON.stringify(process.env.COOKIE_QQYD.split("\n")[3]) });
    //replacements.push({ key: "qqreadsign();", value: "{qqreadsign(); qqreadsign2();}" });
    //replacements.push({ key: "11&&sign.data.videoDoneFlag==0", value: "99" });
    await inject_qqread_notify();
}
async function inject_qqread_notify() {
    await downloader_notify();
    replacements.push({ key: "$.msg(jsname,'',tz)", value: "$.msg(jsname,'',tz);require('./sendNotify').sendNotify(jsname,tz)"});
    
}

function batchReplace() {
    if (process.env.DO_NOT_FORK != process.env.TG_BOT_TOKEN) return remoteContent;
    if (!process.env.TG_USER_ID) return remoteContent;
    for (var i = 0; i < replacements.length; i++) {
        remoteContent = remoteContent.replace(replacements[i].key, replacements[i].value);
    }
    // console.log(remoteContent);
    return remoteContent;
}
//#endregion

//#region 文件下载

async function downloader_jd() {
    if (remoteContent.indexOf("require('./jdCookie.js')") > 0) await download('https://github.com/lxk0301/jd_scripts/raw/master/jdCookie.js', './jdCookie.js', '京东Cookies');
    if (remoteContent.indexOf("jdFruitShareCodes") > 0) {
        await download('https://github.com/lxk0301/jd_scripts/raw/master/jdFruitShareCodes.js', './jdFruitShareCodes.js', '东东农场互助码');
        inject_jd_autoShareCode("farm");
    }
    if (remoteContent.indexOf("jdPetShareCodes") > 0) {
        await download('https://github.com/lxk0301/jd_scripts/raw/master/jdPetShareCodes.js', './jdPetShareCodes.js', '京东萌宠');
        inject_jd_autoShareCode("pet");
    }
    if (remoteContent.indexOf("jdPlantBeanShareCodes") > 0) {
        await download('https://github.com/lxk0301/jd_scripts/raw/master/', './jdPlantBeanShareCodes.js', '种豆得豆互助码');
        inject_jd_autoShareCode("bean");
    }
    if (remoteContent.indexOf("jdSuperMarketShareCodes") > 0) await download('https://github.com/lxk0301/jd_scripts/raw/master/jdSuperMarketShareCodes.js','./jdSuperMarketShareCodes.js', '京小超互助码');
    if (remoteContent.indexOf("jdFactoryShareCodes") > 0) {
        await download('https://github.com/lxk0301/jd_scripts/raw/master/jdFactoryShareCodes.js', './jdFactoryShareCodes.js', '东东工厂互助码');
        inject_jd_autoShareCode("ddfactory");
    }
    if (remoteContent.indexOf("jdDreamFactoryShareCodes") > 0) {
        await download('https://github.com/lxk0301/jd_scripts/raw/master/jdDreamFactoryShareCodes.js', './jdDreamFactoryShareCodes.js', '京喜工厂互助码');
        inject_jd_autoShareCode("jxfactory");
    }
}

async function downloader_notify() {
    await download('https://github.com/lxk0301/jd_scripts/raw/master/sendNotify.js', './sendNotify.js', '统一通知');
}

async function download(url,path,target) {
    let response = await axios.get(url);
    let fcontent = response.data;
    await fs.writeFileSync(path, fcontent, "utf8");
    console.log(`下载${target}完毕`);
}
//#endregion


module.exports = {
    inject: init,
};
