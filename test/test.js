// const axios = require("axios");
// const fs = require("fs");
// const stupid = require("../stupid");

// async function downloadFile() {
//     var url = [
//         "https://github.com/lxk0301/jd_scripts/raw/master/jd_pet.js",
//         "https://github.com/lxk0301/jd_scripts/raw/master/jd_jdfactory.js",
//         "https://github.com/lxk0301/jd_scripts/raw/master/jd_dreamFactory.js",
//         "https://github.com/lxk0301/jd_scripts/raw/master/jd_plantBean.js",
//         "https://github.com/lxk0301/jd_scripts/raw/master/jd_fruit.js",
//     ];
//     let response = await axios.get(url[0]);
//     let content = response.data;
//     content = content.replace("console.log(`\\n【您的互助码shareCode】 ${$.petInfo.shareCode}\\n`);", "//已替换的代码");
//     // content = await stupid.magic(content);
//     console.log(content);
//     return "end";
// }

// downloadFile();
console.log("结果显示", process.env.TEST_KEY);
console.log("测试结果1:", process.env.TEST_KEY == "Cm9wLtO9OlLZI");
console.log("测试结果2:", !!process.env.TEST_KEY);
console.log("测试结果3:", process.env.TEST_KEY == '');

console.log("附加参数：", process.argv);
console.log("测试结束");
