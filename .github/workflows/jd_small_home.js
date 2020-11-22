# This workflow will do a clean install of node dependencies, build the source code and run tests across different versions of node
# For more information see: https://help.github.com/actions/language-and-framework-guides/using-nodejs-with-github-actions

name: 东东小窝

on:
    workflow_dispatch:
    schedule:
        - cron: "55 16 * * *"
    watch:
        types: [started]
    repository_dispatch:
        types: jd_small_home

jobs:
    build:
        runs-on: ubuntu-latest
        if: github.event.repository.owner.id == github.event.sender.id
        steps:
            - name: 拉取代码
              uses: actions/checkout@v2
            - name: 设置运行环境-Node.js 10.x
              uses: actions/setup-node@v1
              with:
                  node-version: 10.x
            - name: 安装依赖包
              run: |
                  npm install
            - name: "运行 【东东小窝】"
              run: |
                  node execute.js
              env:
                  JD_COOKIE: ${{ secrets.JD_COOKIE }}
                  JD_DEBUG: ${{ secrets.JD_DEBUG }}
                  PUSH_KEY: ${{ secrets.PUSH_KEY }}
                  BARK_PUSH: ${{ secrets.BARK_PUSH }}
                  BARK_SOUND: ${{ secrets.BARK_SOUND }}
                  TG_BOT_TOKEN: ${{ secrets.TG_BOT_TOKEN }}
                  TG_USER_ID: ${{ secrets.TG_USER_ID }}
                  DD_BOT_TOKEN: ${{ secrets.DD_BOT_TOKEN }}
                  DD_BOT_SECRET: ${{ secrets.DD_BOT_SECRET }}
                  SYNCURL: https://github.com/lxk0301/jd_scripts/raw/master/jd_small_home.js
