const exec = require("child_process").execSync;
const fs = require("fs");
const axios = require("axios");
const stupid = require("./stupid");

!(async () => {
    console.log(`国际时间 (UTC+00)：${new Date().toLocaleString()}`);
    console.log(`北京时间 (UTC+08)：${new Date(new Date().getTime() + 8 * 60 * 60 * 1000).toLocaleString()}\n`);
    inject_env();
    if (!process.env.SYNCURL) {
        console.log("请填写 SYNCURL 后在继续");
        return;
    }
    if (process.env.MULTIPLE_ACCOUNT) {
        console.log("您已开启多账号模式，读取配置中。。。");
    } else {
        try {
            await change_file();
            await exec("node ./executeOnce.js", { stdio: "inherit" });
        } catch (e) {
            console.log("执行异常:" + e);
        }
    }

    console.log("执行完毕");
})()
    .catch((e) => {
        console.log(`❌ 执行失败! 原因: ${e}!`);
    })
    .finally(() => {
        console.log("结束脚本执行");
    });

function inject_env() {
    if (!process.env.ENVS_FROM_WEBHOOK) return;
    try {
        console.log("检测到Webhook参数,注入env中");
        var envs = JSON.parse(process.env.ENVS_FROM_WEBHOOK);
        var keys = Object.keys(envs);
        for (var key in keys) {
            process.env[key] = envs[key];
        }
    } catch (e) {
        console.log(`❌ 注入环境变量失败! 原因: ${e}!`);
    }
}

async function change_file() {
    let response = await axios.get(process.env.SYNCURL);
    let content = response.data;
    content = await stupid.inject(content);
    await fs.writeFileSync("./executeOnce.js", content, "utf8");
    console.log("替换变量完毕");
}
