const exec = require("child_process").execSync;
const fs = require("fs");
const axios = require("axios");
const stupid = require("./stupid");

async function changeFiele() {
    let response = await axios.get(process.env.SYNCURL);
    let content = response.data;
    content = await stupid.magic(content);
    await fs.writeFileSync("./execute.js", content, "utf8");
    console.log("替换变量完毕");
}

async function start() {
    console.log(`当前执行时间:${new Date().toString()}`);
    if (!process.env.JD_COOKIE) {
        console.log("请填写 JD_COOKIE 后在继续");
        return;
    }
    if (!process.env.SYNCURL) {
        console.log("请填写 SYNCURL 后在继续");
        return;
    }
    console.log(`当前共${process.env.JD_COOKIE.split("&").length}个账号需要签到`);
    try {
        await changeFiele();
        await exec("node execute.js", { stdio: "inherit" });
    } catch (e) {
        console.log("执行异常:" + e);
    }
    console.log("执行完毕");
}

start();
