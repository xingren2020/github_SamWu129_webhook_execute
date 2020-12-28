const axios = require("axios");
const fs = require("fs");
const stupid = require("../stupid");

async function downloadFile() {
    let response = await axios.get(process.env.SYNCURL);
    let content = response.data;
    content = content.replace("console.log(`\\n【您的互助码shareCode】 ${$.petInfo.shareCode}\\n`);", "//已替换的代码");
    content = await stupid.inject(content);
    console.log(content);
    return "end";
}

downloadFile();

// console.log("结果显示TEST_KEY:", process.env.TEST_KEY);
// console.log("结果显示TEST_KEY1:", process.env.TEST_KEY1);
// console.log("测试结果1:", process.env.TEST_KEY == "Cm9wLtO9OlLZI");
// console.log("测试结果2:", !!process.env.TEST_KEY);
// console.log("测试结果3:", process.env.TEST_KEY == "");

// console.log("附加参数：", process.argv);
// if (process.env.TEST_KEY1) {
//     longtimerun();
// }
// console.log("测试结束");

async function longtimerun() {
    return new Promise((resolve) => {
        var i = 0;
        setInterval(function () {
            i++;
            console.log("持续输出:" + i);
            if (i >= 50) resolve();
        }, 10000);
    });
}
