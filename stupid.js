const axios = require("axios");
const fs = require("fs");
const replacements = [];
var remoteContent;
async function init(content) {
    remoteContent = content;
    await inject();
    return batchReplace(remoteContent);
}
//#region 注入代码
async function inject() {
    await inject_jd();
}

async function inject_jd() {
    if (!process.env.JD_COOKIE) return;
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
/** 自动注入分享码 */
function inject_jd_autoShareCode(type) {
    if (!type) return;
    let pointer = {
        ddfactory: {
            isAsync: true, //是否异步执行
            uuid: "item.assistTaskDetailVo.taskToken",
            match:
                "console.log(`\\n【京东账号${$.index}（${$.nickName || $.UserName}）的${$.name}好友互助码】${item.assistTaskDetailVo.taskToken}\\n`)",
            api: "http://api.turinglabs.net/api/v1/jd/ddfactory/create/",
            link: "https://raw.githubusercontent.com/lxk0301/jd_scripts/master/jd_jdfactory.js", //没啥用,用于快捷定位
        },
        jxfactory: {
            isAsync: true,
            uuid: "data.user.encryptPin",
            match:
                "console.log(`\\n【京东账号${$.index}（${$.nickName || $.UserName}）的${$.name}好友互助码】${data.user.encryptPin}`);",
            api: "http://api.turinglabs.net/api/v1/jd/jxfactory/create/",
            link: "https://github.com/lxk0301/jd_scripts/raw/master/jd_dreamFactory.js",
        },
        bean: {
            isAsync: false,
            uuid: "$.myPlantUuid",
            match:
                "console.log(`\\n【京东账号${$.index}（${$.nickName || $.UserName}）的${$.name}好友互助码】${$.myPlantUuid}\\n`);",
            api: "http://api.turinglabs.net/api/v1/jd/bean/create/",
            link: "https://github.com/lxk0301/jd_scripts/raw/master/jd_plantBean.js",
        },
        farm: {
            isAsync: false,
            uuid: "$.farmInfo.farmUserPro.shareCode",
            match:
                "console.log(`\\n【京东账号${$.index}（${$.nickName || $.UserName}）的${$.name}好友互助码】${$.farmInfo.farmUserPro.shareCode}\\n`);",
            api: "http://api.turinglabs.net/api/v1/jd/farm/create/",
            link: "https://raw.githubusercontent.com/lxk0301/jd_scripts/master/jd_fruit.js",
        },
        pet: {
            isAsync: false,
            uuid: "$.petInfo.shareCode",
            match:
                "console.log(`\\n【京东账号${$.index}（${$.nickName || $.UserName}）的${$.name}好友互助码】${$.petInfo.shareCode}\\n`);",
            api: "http://api.turinglabs.net/api/v1/jd/pet/create/",
            link: "https://github.com/lxk0301/jd_scripts/raw/master/jd_pet.js",
        },
        jdzz: {
            isAsync: true,
            uuid: "data.data.shareTaskRes.itemId",
            match:
                "console.log(`\\n【京东账号${$.index}（${$.nickName || $.UserName}）的${$.name}好友互助码】${data.data.shareTaskRes.itemId}\\n`);",
            api: "https://code.chiang.fun/api/v1/jd/jdzz/create/",
            link: "https://github.com/lxk0301/jd_scripts/raw/master/jd_jdzz.js",
        },
        crazyjoy: {
            isAsync: true,
            uuid: "data.data.userInviteCode",
            match:
                "console.log(`\\n【京东账号${$.index}（${$.nickName || $.UserName}）的${$.name}好友互助码】${data.data.userInviteCode}`)",
            api: "https://code.chiang.fun/api/v1/jd/jdcrazyjoy/create/",
            link: "https://github.com/lxk0301/jd_scripts/raw/master/jd_crazy_joy.js",
        },
    };
    let target = pointer[type];

    if (!target) return;
    var targetCode = target.isAsync
        ? `
        $.get({url:'${target.api}'+${target.uuid}+'/'}, (err, resp, data) => {
            try {
                if (err) {
                    console.log('API请求失败，请检查网路重试',err);
                } else {
                    console.log('API请求成功',data);
                }
            } catch(e) {
                console.log('API处理失败',e);
            } finally {
            }
        });`
        : `
        await new Promise(resolve => {
        $.get({url:'${target.api}'+${target.uuid}+'/'}, (err, resp, data) => {
            try {
                if (err) {
                    console.log('API请求失败，请检查网路重试',err);
                } else {
                    console.log('API请求成功',data);
                }
            } catch(e) {
                console.log('API处理失败',e);
            } finally {
                resolve();
            }
        });
    });`;
    replacements.push({
        key: target.match,
        value: `${target.match}
        console.log("准备执行注入代码");
        ${targetCode}`,
    });
    console.log(`互助码-${type}-随机互助API请求导入完毕`);
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
    if (/require\(['"`]{1}.\/jdCookie.js['"`]{1}\)/.test(remoteContent))
        await download("https://github.com/lxk0301/jd_scripts/raw/master/jdCookie.js", "./jdCookie.js", "京东Cookies");
    if (remoteContent.indexOf("new Env('东东农场')") > 0) {
        await download(
            "https://github.com/lxk0301/jd_scripts/raw/master/jdFruitShareCodes.js",
            "./jdFruitShareCodes.js",
            "东东农场互助码"
        );
        inject_jd_autoShareCode("farm");
    }
    if (remoteContent.indexOf("new Env('东东萌宠')") > 0) {
        await download(
            "https://github.com/lxk0301/jd_scripts/raw/master/jdPetShareCodes.js",
            "./jdPetShareCodes.js",
            "京东萌宠"
        );
        inject_jd_autoShareCode("pet");
    }
    if (remoteContent.indexOf("new Env('京东种豆得豆')") > 0) {
        await download(
            "https://github.com/lxk0301/jd_scripts/raw/master/jdPlantBeanShareCodes.js",
            "./jdPlantBeanShareCodes.js",
            "种豆得豆互助码"
        );
        inject_jd_autoShareCode("bean");
    }
    // if (remoteContent.indexOf("jdSuperMarketShareCodes") > 0)
    //     await download(
    //         "https://github.com/lxk0301/jd_scripts/raw/master/jdSuperMarketShareCodes.js",
    //         "./jdSuperMarketShareCodes.js",
    //         "京小超互助码"
    //     );
    if (remoteContent.indexOf("new Env('东东工厂')") > 0) {
        await download(
            "https://github.com/lxk0301/jd_scripts/raw/master/jdFactoryShareCodes.js",
            "./jdFactoryShareCodes.js",
            "东东工厂互助码"
        );
        inject_jd_autoShareCode("ddfactory");
    }
    if (remoteContent.indexOf("jdDreamFactoryShareCodes") > 0) {
        await download(
            "https://github.com/lxk0301/jd_scripts/raw/master/jdDreamFactoryShareCodes.js",
            "./jdDreamFactoryShareCodes.js",
            "京喜工厂互助码"
        );
        inject_jd_autoShareCode("jxfactory");
    }
    if (remoteContent.indexOf("new Env('京东赚赚')") > 0) {
        inject_jd_autoShareCode("jdzz");
    }
    if (remoteContent.indexOf("new Env('crazyJoy任务')") > 0) {
        inject_jd_autoShareCode("crazyjoy");
    }
    if (reniteCintent.indexOf("new Env('京喜农场')") > 0) {
        await download(
            "https://github.com/lxk0301/jd_scripts/raw/master/jdJxncTokens.js",
            "./jdJxncTokens.js",
            "京喜农场Token"
        );
    }
}

async function downloader_notify() {
    await download("https://github.com/lxk0301/jd_scripts/raw/master/sendNotify.js", "./sendNotify.js", "统一通知");
}

async function download(url, path, target) {
    let response = await axios.get(url);
    let fcontent = response.data;
    await fs.writeFileSync(path, fcontent, "utf8");
    console.log(`下载${target}完毕`);
}
//#endregion

module.exports = {
    inject: init,
};
