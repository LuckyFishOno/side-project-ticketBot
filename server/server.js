const cheerio = require('cheerio');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const Ddddocr = require('ddddocr');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(bodyParser.text());

/* global varable */
let golbalCancle = ''
let connectionActive = false;
let sseResponse = null;
let buySuccessRes = false;

app.post('/api/ticket/1', async (req, res) => {
    const { basic, info, advanced } = req.body;
    const { cookie, livenationMode, logingAccountLN, logingPasswordLN, eventUrlLN } = basic;
    const { eventUrl, buyTime, eventNumber, sessionPrice, sessionSeat, ticketCount } = info;
    const { serialMode, serialCard, mooncakeMode, seatWebMode, seatWebUrl, buyTicketQuickPrice, buyTicketQuickSeat, buyTicketQuickTicket } = advanced;

    console.log('收到新的購票請求：');
    console.log('cookie:', cookie);
    
    if(cookie) {
        res.status(200).json({ 'message': '輸入成功' });
        sseResponse.write(`data: ${'----------------------------------------------------'}\n\n`);
        ocr(cookie);
        main(cookie, livenationMode, logingAccountLN, logingPasswordLN, eventUrlLN, eventUrl, buyTime, eventNumber, sessionPrice, sessionSeat, ticketCount, serialMode, serialCard, mooncakeMode, seatWebMode, seatWebUrl, buyTicketQuickPrice, buyTicketQuickSeat, buyTicketQuickTicket);
    } else {
        res.status(200).json({ 'error': '輸入失敗' });
    }
})

app.post('/api/ticket/2', async (req, res) => {
    const cancle = req.body;
    golbalCancle = cancle;

    console.log(golbalCancle);
    console.log('-------------------------------------------');

    if(golbalCancle) 
        res.status(200).json({ 'message': '取消成功' }); 
    else
        res.status(200).json({ 'error': '取消失敗' });
})

app.get('/api/ticket/3', (req, res) => {
    if(buySuccessRes) {
        res.json({'message': 'buySuccess'});
        buySuccessRes = false;
    } else {
        res.json({'error': 'notSuccess'});
        buySuccessRes = false;
    }
})

// 用於儲存 SSE 連線的 response 物件
app.get('/api/ticket/4', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    sseResponse = res; 
    req.on('close', () => {
        sseResponse = null; 
        console.log('Client disconnected from log stream');
    });

    if (connectionActive) { // 檢查連線是否仍然活躍
        sseResponse.write(`data: ${'Connection closed by server'}\n\n`); // 發送關閉訊息
        sseResponse.end(); // 關閉連線
        sseResponse = null;
        connectionActive = false;
        console.log('Server closed connection');
    }
})

app.listen(4000, () => { console.log('Server started on port 4000') })

//-------------------- Glabal Var 不更動 --------------------
const apiKey = '';
const photoChkPath = './images/';
let closeWebDriver = true, lock = false, verifyCode = '', closeBrowser = false, firstTimeLiveN = true, door = true;

async function main(cookie, livenationMode, logingAccountLN, logingPasswordLN, eventUrlLN, eventUrl, buyTime, eventNumber, sessionPrice, sessionSeat, ticketCount, serialMode, serialCard, mooncakeMode, seatWebMode, seatWebUrl, buyTicketQuickPrice, buyTicketQuickSeat, buyTicketQuickTicket) {

    let verifyCodeManual = false,
    buyTicketQuickMode = false,
    serialAnswer = 'yes',
    // 使用字串尋找開啟 true
    priceSeatFindMode = false,
    price = '4800',
    seat = '',
    //測試、刷票用
    buyTimeTest = false,
    buyTimeQuick = false,
    // true 開啟延遲
    delayEvent_1 = false,
    delayEventTime_1 = 1149,
    delayEvent_2 = false,
    delayEventTime_2 = 1000,
    delaySeat = false,
    delaySeatTime = 279,
    delaySubmit = false,
    delaySubmitTime = 252;

    if(serialCard != '')
        serialMode = true;
    if(serialMode == true)
        seatWebMode = false;
    if(verifyCodeManual == true)
        closeWebDriver = false;
    if(buyTicketQuickMode == true) {
        firstTimeLiveN = false;
        buyTimeQuick = true;
        buyTimeTest = false;
    }
    if(mooncakeMode == true) {
        seatWebMode = false;
        priceSeatFindMode = false;
    }

    console.log('### Start Main Bot ###');
    await sendMsg('### Start Main Bot ###');
    
    const cookies = {
    'url': 'https://tixcraft.com/',
    'name': 'SID',
    'value': cookie
    };
    // bot 偽裝
    puppeteer.use(StealthPlugin());
    //瀏覽器設定
    const browser = await puppeteer.launch({
        headless: closeWebDriver,
        ignoreHTTPSErrors: true,
        args: [
            `--window-size=${300},${750}`,
            '--no-sandbox',
            '--allow-running-insecure-content'
        ]
    });
    // 開新視窗
    const mainPage = await browser.newPage();
    // 警告視窗處理
    mainPage.on('dialog', async dialog => {
        log = dialog.message();
        await dialog.accept();
        console.log(log);
        await sendMsg(log);
    })
    // 帳號登入處理
    await mainPage.setCookie(cookies);

    //--------------------------------------------------------------

    label: try {
        await mainPage.goto('https://tixcraft.com/', { waitUntil: ['domcontentloaded'] });
        await setDelayTime(1000);

        // 截圖確認是否登入成功
        let loginChk = await mainPage.$('body');
        await loginChk.screenshot({   
            path:`${photoChkPath}loginChk.png`
        });

        await setDelayTime(100);
        if(golbalCancle == 'botStop') {
            door = false;
            console.log('Canceled');
            golbalCancle = '';
            await browser.close();
            await sendMsg('Bot Canceled !');
            break label;
        }

        await sendMsg('Tixcraft Login Success !');

        // 接受 cookie 什麼的，若有 error 下面四行註解
        try {
            await mainPage.waitForSelector('button#onetrust-accept-btn-handler', {visible: true});
            await mainPage.click('button#onetrust-accept-btn-handler');
            await mainPage.waitForSelector('button.close-alert', {visible: true});
            await mainPage.click('button.close-alert');

            await setDelayTime(100);
            if(golbalCancle == 'botStop') {
                door = false;
                console.log('Canceled');
                golbalCancle = '';
                await browser.close();
                await sendMsg('Bot Canceled !');
                break label;
            }

        } catch(err) {
            console.log('Accept Cookie Error and Pass');
        }

        await setDelayTime(100);
        if(golbalCancle == 'botStop') {
            door = false;
            console.log('Canceled');
            golbalCancle = '';
            await browser.close();
            await sendMsg('Bot Canceled !');
            break label;
        }

        // 調整語言
        await setDelayTime(1500);
        await mainPage.goto('https://tixcraft.com/user/changelanguage/lang/en-US');

        await setDelayTime(100);
        if(golbalCancle == 'botStop') {
            door = false;
            console.log('Canceled');
            golbalCancle = '';
            await browser.close();
            await sendMsg('Bot Canceled !');
            break label;
        }

        // liveNation 登入
        if(livenationMode == true) {
            await setDelayTime(1500);
            await mainPage.goto('https://www.livenation.com.tw/login');
            await mainPage.type('input#email', logingAccountLN);
            await setDelayTime(1000);
            await mainPage.type('input#password', logingPasswordLN);
            await setDelayTime(1000);
            await mainPage.click('button.form__submit');
            await setDelayTime(5000);
            await mainPage.goto(`https://www.livenation.com.tw/${eventUrlLN}`);
            await setDelayTime(5000);

            await sendMsg('Live Nation Login Success !');

            let loginLNChk = await mainPage.$('body');
            await loginLNChk.screenshot({   
                path:`${photoChkPath}loginLNChk.png`
            });

            await setDelayTime(100);
            if(golbalCancle == 'botStop') {
                door = false;
                console.log('Canceled');
                golbalCancle = '';
                await browser.close();
                await sendMsg('Bot Canceled !');
                break label;
            }

            if(firstTimeLiveN == true) {
                while(true) {
                    const now = new Date();
                    let minute = now.getMinutes();
                    let second = now.getSeconds();
                    if(minute==58) {
                        await mainPage.reload({ waitUntil: ['domcontentloaded'] });
                        await setDelayTime(3000);
                        break;
                    }
                    await setDelayTime(1000);
                }
            }
            await setDelayTime(3000);
            await mainPage.waitForSelector('.haia-ltr-1x7ocgf .haia-ltr-12nocra a', {visible: true});
            await mainPage.click('.haia-ltr-1x7ocgf .haia-ltr-12nocra a');
        }
        await setDelayTime(3000);
        await mainPage.bringToFront();
        await setDelayTime(3000);

        let debug2Chk = await mainPage.$('body');
        await debug2Chk.screenshot({   
            path:`${photoChkPath}debug2Chk.png`
        });

        await setDelayTime(3000);

        await setDelayTime(100);
        if(golbalCancle == 'botStop') {
            door = false;
            console.log('Canceled');
            golbalCancle = '';
            await browser.close();
            await sendMsg('Bot Canceled !');
            break label;
        }

        await mainPage.waitForSelector('body', {visible: true});
        let eventUrlTC = `https://tixcraft.com/activity/detail/${eventUrl}`
        eventUrlTC = eventUrlTC.replace(/detail/, 'game');
        await mainPage.goto(eventUrlTC);
        await setDelayTime(3000);

        //截圖確認是否正確場次
        let eventChk = await mainPage.$('body');
        await eventChk.screenshot({ 
            path:`${photoChkPath}eventChk.png`
        });
        await setDelayTime(10);


        let buyTimeHour = parseInt(buyTime.substring(0, 2));
        let buyTimeMinute = parseInt(buyTime.substring(3, 5));
        let buyTimeSecond = 0;

        // 時間
        await time(buyTimeHour, buyTimeMinute, buyTimeTest, buyTimeQuick);

        await setDelayTime(100);
        if(golbalCancle == 'botStop') {
            door = false;
            console.log('Canceled');
            golbalCancle = '';
            await browser.close();
            await sendMsg('Bot Canceled !');
            break label;
        }

        let timeCount = 0;
            
        //console.time();
        /////////////////////////////////////////// 時間記錄開始
        await setDelayTime(25);

        let gotoEventCount = 1;
        let gotoSeatChk = false;
        
        gotoEvent: while(door) {

            if(golbalCancle == 'botStop') {
                break;
            }

            await sendMsg('Start Buy Ticket');

            await sendMsg('Waiting...');

            // 如果直接回到選座位頁面，gotoSeatChk 就為 true
            if(gotoSeatChk == false) {
                if(seatWebMode == true) {

                    if(delayEvent_2 == true)
                        await setDelayTime(delayEventTime_2);

                    await mainPage.goto(seatWebUrl, { waitUntil: ['domcontentloaded'] });
                    await mainPage.waitForSelector('body', {visible: true});
                    body = await mainPage.content();
                    $ = cheerio.load(body);
                    let homeChk = $('#latest-selling-tab').text();

                    if(homeChk != '') {
                        if(gotoEventCount == 0)
                            gotoEventCount++
                        else if(gotoEventCount > 0) {
                            gotoEventCount++;
                            await setDelayTime(300);
                        }
                        console.log('----- Reloading Seat Page -----');
                        await sendMsg('----- Reloading Seat Page -----');
                        continue gotoEvent;
                    }

                } else if(seatWebMode == false) {
                    await mainPage.goto(eventUrlTC, { waitUntil: ['domcontentloaded'] });

                    if(delayEvent_1 == true)
                        await setDelayTime(delayEventTime_1);

                    await mainPage.waitForSelector('body', {visible: true});
                    body = await mainPage.content();
                    $ = cheerio.load(body);
                    let gameListText = $('#gameList.grid-view').text();
                    let findTicket_1 = gameListText.match(new RegExp('Find tickets', 'g'));
                    findTicket_1 = findTicket_1 ? findTicket_1.length : 0;

                    if(findTicket_1==0) {
                        if(gotoEventCount == 0)
                            gotoEventCount++
                        else if(gotoEventCount > 0) {
                            gotoEventCount++;
                            await setDelayTime(300);
                        }
                        console.log('----- Reloading Event Page -----');
                        await sendMsg('----- Reloading Seat Page -----');
                        continue gotoEvent;
                    }

                    await mainPage.click(`tr.gridc.fcTxt:nth-child(${eventNumber}) button`);
                }
            }

            // 檢查有沒有回答問題頁面
            if(serialMode == true) {
                await mainPage.waitForSelector('body', {visible: true});
                body = await mainPage.content();
                $ = cheerio.load(body);
                let questionPageText = $('#form-ticket-verify h4').next().text();
                questionPageText = questionPageText.replace(/\n/ig, '');

                if(questionPageText != '') {
                    if(serialCard == '') {
                        let question = questionPageText;
                        async function callChatGPT() {
                            const url = "https://api.openai.com/v1/chat/completions";
                            const headers = {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${apiKey}`,
                            };
                            const data = {
                                model: "gpt-4o",
                                messages: [
                                    { role: "system", content: "You are a helpful assistant." },
                                    { role: "user", content: question },
                                ],
                            };
                            const response = await axios.post(url, data, { headers });
                            const result = await response.data.choices[0].message.content;
                            serialAnswer = result;
                            console.log(serialAnswer);
                            serialAnswer = serialAnswer.replace(/\W/ig, '');
                            console.log(serialAnswer);
                        }
                        await callChatGPT();
                    } else {
                        serialCard = serialAnswer;
                    }
                    await mainPage.waitForSelector('input[name=checkCode]', {visible: true});
                    await mainPage.type('input[name=checkCode]', serialAnswer);
                    await mainPage.waitForSelector('button[type=submit]', {visible: true});
                    await mainPage.click('button[type=submit]');
                }
            }
            
            if(delaySeat == true)
                await setDelayTime(delaySeatTime);

            // 座位字串尋找
            if(priceSeatFindMode == true) {
                await mainPage.waitForSelector('.zone.area-list', {visible: true});
                body = await mainPage.content();
                $ = cheerio.load(body);
                let areaText = $('.zone.area-list').html();
                areaText = areaText.split('zone-label');
                for(let i=0; i<areaText.length; i++) {
                    areaText[i] = areaText[i].split('</b></div><ul id=');
                    if(i>0)
                        areaText[i][1] = areaText[i][1].split('</font></li><li><span');
                }
                areaText[0] = '';
                let priceChk = -1;
                let seatChk = -1;
                if(price != '') {
                    for(let i=1; i<areaText.length; i++) {
                        let temp = areaText[i][0].match(new RegExp(price, 'g'));
                        temp = temp ? temp.length : 0;
                        if(temp > 0) {
                            priceChk = i;
                            break;
                        }
                    }
                }
                if(seat != '') {
                    for(let i=0; i<areaText[priceChk][1].length; i++) {
                        let temp = areaText[priceChk][1][i].match(new RegExp(seat, 'g'));
                        temp = temp ? temp.length : 0;
                        if(temp > 0) {
                            seatChk = i + 1;
                            break;
                        }
                    }
                }
                if(priceChk < 0)
                    priceChk = '';
                else
                    priceChk = priceChk.toString();
                sessionPrice = priceChk;
                
                if(seatChk < 0)
                    seatChk = '';
                else
                    seatChk = seatChk.toString();
                sessionSeat = seatChk;
            }
            
            lock = true;

            let reloadCount = 0;
            let temp1 = sessionPrice;
            let temp2 = sessionSeat;

            gotoSeat: while(true) {

                if(golbalCancle == 'botStop') {
                    break;
                }

                await mainPage.waitForSelector('.zone.area-list', {visible: true});
                body = await mainPage.content();
                $ = cheerio.load(body);

                let secondCount = 0;
                let Ticket = '';
                if(temp1 != '') {
                    sessionPrice = parseInt(temp1) - 1;
                    sessionPrice = sessionPrice.toString();
                } else {
                    sessionPrice = temp1.toString();
                }
                sessionSeat = temp2.toString();

                // moonCakeMode 月餅模式 true 會跳過選座位，直接到驗證碼頁面
                if(mooncakeMode == false) {
                    // 先檢查選完座位是否跳回選場次頁面
                    let chooseSeatFail = $('#latest-selling-tab').text();
                    if(chooseSeatFail != '') {
                        gotoSeatChk = false;
                        continue gotoEvent;
                    }

                    console.log('origin sessionPrice = ' + (parseInt(sessionPrice) + 1));
                    console.log('origin sessionSeat = ' + sessionSeat);

                    // 檢查所選票價
                    while(true) {
                        sessionPrice = sessionPrice.toString();
                        sessionSeat = sessionSeat.toString();
                        if(sessionPrice!='' && sessionSeat!='') {
                            Ticket = $(`ul#group_${sessionPrice} li:nth-child(${sessionSeat})`).text();
                            let noTicket_1 = Ticket.match(new RegExp('Sold out', 'g'));
                            noTicket_1 = noTicket_1 ? noTicket_1.length : 0;
                            if(noTicket_1>0 && Ticket!='') {
                                sessionSeat = parseInt(sessionSeat);
                                sessionSeat++;
                            } else if(noTicket_1==0 && Ticket!='') {
                                break;
                            } else if(Ticket == '') {
                                sessionSeat = '';
                                sessionPrice = parseInt(sessionPrice);
                                sessionPrice++;
                                break;
                            }
                        } else if(sessionPrice!='' && sessionSeat=='') {
                            Ticket = $(`ul#group_${sessionPrice}`).text();
                            let anyTicket_1 = Ticket.match(new RegExp('seat', 'g'));
                            anyTicket_1 = anyTicket_1 ? anyTicket_1.length : 0;
                            let manyTicket_1 = Ticket.match(new RegExp('Available', 'g'));
                            manyTicket_1 = manyTicket_1 ? manyTicket_1.length : 0;
                            if((anyTicket_1>0 || manyTicket_1>0) || secondCount==2) {
                                break;
                            } else if(anyTicket_1==0 && manyTicket_1==0) {
                                sessionPrice = parseInt(sessionPrice);
                                sessionPrice++;
                                secondCount++;
                            } 
                        } else if(sessionPrice == '') {
                            break;
                        }
                    }

                    console.log('now sessionPrice = ' + (parseInt(sessionPrice)+1));
                    console.log('now sessionSeat = ' + sessionSeat);
                    console.log('--------------------------------');

                    if(sessionPrice!='' && sessionSeat!='')
                        Ticket = $(`ul#group_${sessionPrice} li:nth-child(${sessionSeat})`).text();
                    else if(sessionPrice!='' && sessionSeat=='')
                        Ticket = $(`ul#group_${sessionPrice}`).text();
                    else if(sessionPrice=='' && sessionSeat=='') 
                        Ticket = $('ul.area-list li a').text();
                        
                    console.log(Ticket);
                    console.log('--------------------------------');

                    if(Ticket == '') {
                        await setDelayTime(300);
                        await mainPage.reload({ waitUntil: ['domcontentloaded'] });
                        console.log('------reloading------ ' + reloadCount++);
                        await sendMsg('------reloading------ ' + reloadCount++);
                        continue gotoSeat;
                    }

                    let anyTicket_1 = Ticket.match(new RegExp('seat', 'g'));
                    anyTicket_1 = anyTicket_1 ? anyTicket_1.length : 0;
                    let manyTicket_1 = Ticket.match(new RegExp('Available', 'g'));
                    manyTicket_1 = manyTicket_1 ? manyTicket_1.length : 0;
                    if(anyTicket_1==0 && manyTicket_1==0) {
                        await setDelayTime(300);
                        await mainPage.reload({ waitUntil: ['domcontentloaded'] });
                        console.log('------reloading------ ' + reloadCount++);
                        await sendMsg('------reloading------ ' + reloadCount++);
                        continue gotoSeat;
                    }
                    
                    // 座位選擇
                    await mainPage.waitForSelector('body', {visible: true});
                    await mainPage.waitForSelector('ul.area-list li a', {visible: true});
                    if(sessionPrice == '') {
                        if(sessionSeat == '') {
                            await mainPage.click('ul.area-list li a');    // 由上往下優先，通常優先最貴的
                        } else if(sessionSeat != '') {
                            await mainPage.click(`ul.area-list li:nth-child(${sessionSeat}) a`);    //最貴的第幾個
                        }
                    } else if(sessionPrice != '') {
                        if(sessionSeat == '') {
                            await mainPage.click(`ul#group_${sessionPrice} a`);    // 指定票價的從上到下有票就刷
                        } else if(sessionSeat != '') {
                            await mainPage.click(`ul#group_${sessionPrice} li:nth-child(${sessionSeat}) a`);    // 指定票價的第幾個
                        }
                    }
                }

                await mainPage.waitForSelector('body', {visible: true});
                body = await mainPage.content();
                $ = cheerio.load(body);
                let chooseSeatFailText = $('#gameList.grid-view').text();
                let chooseSeatFail_1 = chooseSeatFailText.match(new RegExp('Find tickets', 'g'));
                chooseSeatFail_1 = chooseSeatFail_1 ? chooseSeatFail_1.length : 0;
                let chooseSeatFail_3 = $('#latest-selling-tab').text();
                if(chooseSeatFail_1>0 || chooseSeatFail_3!='') {
                    gotoSeatChk = false;
                    continue gotoEvent;
                } 

                let codeFailCount = 0;
                gotoSubmit: while(true) {

                    if(golbalCancle == 'botStop') {
                        break;
                    }
                    
                    // 驗證碼頁面
                    if(verifyCodeManual == false) {
                        await mainPage.waitForSelector('body', {visible: true});
                        await mainPage.waitForSelector('select', {visible: true});
                        await mainPage.select('select', ticketCount);
                        await mainPage.waitForSelector('input[type=checkbox]', {visible: true});
                        await mainPage.click('input[type=checkbox]');

                        // 清空一遍 input
                        await mainPage.$eval('input#TicketForm_verifyCode', node => node.value = '');
                        // 再次確認是否有選到票
                        let finalTicketCount = await mainPage.$eval('select.form-select', node => node.value);
                        if(finalTicketCount == '0')
                            await mainPage.select('select', '2');
                        // 再次確認是否有選到票
                        finalTicketCount = await mainPage.$eval('select.form-select', node => node.value);    
                        if(finalTicketCount == '0') {
                            await mainPage.select('select', '1');
                            ticketCount = '2';
                        }

                        // 驗證碼處理
                        while(true) {
                            if(verifyCode != '')
                                break;
                            await setDelayTime(1);
                        }

                        verifyCode = verifyCode.replace(/[^a-z]/gi, '');
                        console.log('Origin verifyCode = ' + verifyCode);
                        let temp = '';
                        let dealCount = 0;

                        if(verifyCode.length > 4) {
                            dealCount = 1;
                            verifyCode = verifyCode.split('');
                            for(let i=0; i<verifyCode.length; i++) {
                                if(verifyCode[i+1] == verifyCode[i])
                                    verifyCode[i+1] = '';
                            }
                            for(let i=0; i<verifyCode.length; i++)
                                temp += verifyCode[i];
                        } else
                            temp = verifyCode;
                        
                        console.log('Now verifyCode = ' + temp);
                        await sendMsg('VerifyCode : ' + temp);
                        await sendMsg('Waiting...');

                        if(temp.length == 4)
                            await mainPage.type('input#TicketForm_verifyCode', temp);
                        else 
                            await mainPage.type('input#TicketForm_verifyCode', 'x');
                        
                        if(codeFailCount == 0) {
                            if(delaySubmit == true) {
                                await setDelayTime(delaySubmitTime);
                            }
                        }
                       
                        if(timeCount == 0) {
                            ///////////////////////////////// 時間記錄結束 1.3s
                            //console.timeEnd();    
                            timeCount++;
                        }
                        
                        // 送出
                        await mainPage.waitForSelector('button.btn-green', {visible: true});
                        await mainPage.keyboard.press('Enter');
                        // 一定要清空
                        verifyCode = '';

                    } else if(verifyCodeManual == true) {
                        await mainPage.waitForSelector('body', {visible: true});
                        await mainPage.waitForSelector('select', {visible: true});
                        await mainPage.select('select', ticketCount);
                        await mainPage.waitForSelector('input[type=checkbox]', {visible: true});
                        await mainPage.click('input[type=checkbox]');
                        for(let i=0; i<250; i++)
                            await mainPage.click('input#TicketForm_verifyCode.greyInput', { clickCount: 1 });
                        while(true) {
                            await mainPage.waitForSelector('body', {visible: true});
                            body = await mainPage.content();
                            $ = cheerio.load(body);
                            // 判斷轉圈圈頁面
                            let response = $('#response.well').text();    
                            if(response != '') {
                                // 看到轉圈圈跳出，做最後頁面判斷
                                break;
                            }
                            await setDelayTime(100);
                        }
                    }

                    // 刷票參數帶入
                    sessionPrice = buyTicketQuickPrice;
                    sessionSeat = buyTicketQuickSeat;
                    ticketCount = buyTicketQuickTicket;

                    // Submit 後判斷
                    while(true) {
                        await setDelayTime(300);
                        await mainPage.waitForSelector('body', {visible: true});
                        body = await mainPage.content();
                        $ = cheerio.load(body);
                        // 判斷是否驗證碼輸入失敗跳到場次頁面
                        let verifyCode_Fail_to_Event_Text = $('#gameList.grid-view').text();
                        let buyFail_toEvent_1 = verifyCode_Fail_to_Event_Text.match(new RegExp('Find tickets', 'g'));
                        buyFail_toEvent_1 = buyFail_toEvent_1 ? buyFail_toEvent_1.length : 0;

                        if(buyFail_toEvent_1 > 0) {
                            gotoSeatChk = false;
                            continue gotoEvent; 
                        } 

                        // 判斷驗證碼頁面
                        let verifyCodeCorrectDecide = $('.mgt-8.fcRed.remark-word').text();
                        if(verifyCodeCorrectDecide=='-- The verification code consists of only alphabetic letters and can be refreshed by clicking on its image.') {
                            // 設為 1 重新跑 OCR
                            lock = true;
                            // 驗證碼錯誤，跳回 check3 重新填寫驗證碼
                            codeFailCount = codeFailCount + 1;
                            continue gotoSubmit;        
                        } else if(verifyCodeCorrectDecide == '') {
                            // 進入轉圈圈頁面
                            await setDelayTime(1000);
                            while(true) {
                                await mainPage.waitForSelector('body', {visible: true});
                                body = await mainPage.content();
                                $ = cheerio.load(body);
                                // 判斷轉圈圈頁面
                                let response = $('#response.well').text();    
                                if(response == '') {
                                    // 轉圈圈結束跳出，做最後頁面判斷
                                    break;
                                }
                                await setDelayTime(500);
                            }

                            await setDelayTime(500);
                            await mainPage.waitForSelector('body', {visible: true});
                            body = await mainPage.content();
                            $ = cheerio.load(body);
                            // 判斷場次頁面
                            let last_BuyFail_toEventText = $('#gameList.grid-view').text();    
                            let last_BuyFail_toEvent_1 = last_BuyFail_toEventText.match(new RegExp('Find tickets', 'g'));
                            last_BuyFail_toEvent_1 = last_BuyFail_toEvent_1 ? last_BuyFail_toEvent_1.length : 0;
                            // 判斷座位頁面
                            let last_buyFail_toSeat = $('ul.area-list').text();
                            // 判斷專區頁面
                            let last_buyFail_toSerial = $('#form-ticket-verify h4.promo-title').text();
                            // 判斷首頁頁面
                            let last_buyFail_toHome = $('#latest-selling-tab').text();
                            // 判斷確認票券頁面
                            let buySuccess = $('.black-heading.text-uppercase').text();
                            
                            if(last_buyFail_toSeat=='' && last_BuyFail_toEvent_1>0) {
                                // 跳回選場次頁面 1
                                gotoSeatChk = false;
                                continue gotoEvent;
                            }  else if(last_buyFail_toSeat!='' && last_BuyFail_toEvent_1==0) {
                                // 跳回選座位頁面 1
                                gotoSeatChk = true;
                                continue gotoEvent;
                            } else if(last_buyFail_toSeat=='' && last_BuyFail_toEvent_1==0 && buySuccess!='') {
                                // 跳回選場次頁面 1
                                gotoSeatChk = false;
                                continue gotoEvent;
                            } else if(last_buyFail_toSerial != '') {
                                //跳回專區頁面
                                seatWebMode = false;
                                gotoSeatChk = false;
                                continue gotoEvent;
                            } else if(last_buyFail_toHome != '') {
                                // 跳回選場次頁面
                                gotoSeatChk = false;
                                continue gotoEvent;
                            } else
                                break;
                        }
                    }
                    break;
                }
                break;
            }
            break;
        }

        if(golbalCancle=='botStop' && door==true) {
            await browser.close();
            console.log('Canceled');
            await sendMsg('Bot Canceled !');
            break label;
        } else if(golbalCancle!='botStop' && door==true){
            console.log('Success');
            console.log('Success');
            console.log('Success');
            await sendMsg('Success');
            await sendMsg('Success');
            await sendMsg('Success');
            await setDelayTime(1000);
            buySuccessRes = true;

            if(verifyCodeManual == false) {
                let doneChk = await mainPage.$('body');
                await doneChk.screenshot({ 
                    path:`${photoChkPath}doneChk.png`
                });
                await setDelayTime(10);
            }

            await setDelayTime(3000);
            console.log('Close Browser');
            await browser.close();
            closeBrowser = false;
            lock = false;
            verifyCode = ''; 
            firstTimeLiveN = true;
            door = true;
        }
        golbalCancle = '';

    } catch(e) {
        console.log('***************** ERROR *****************');
        console.log(e);
        console.log('***************** ERROR *****************');
        await browser.close();
        
        buyTimeQuick = true;
        buyTimeTest = false;
        firstTimeLiveN = false;
        delayEvent_1 = false
        delayEvent_2 = false
        delaySeat = false
        delaySubmit = false
        sessionPrice = buyTicketQuickPrice;
        sessionSeat = buyTicketQuickSeat;
        ticketCount = buyTicketQuickTicket;
        if(serialMode == true)
            seatWebMode = false;
        else
            seatWebMode = true;
        if(golbalCancle == '')
            main(cookie, livenationMode, logingAccountLN, logingPasswordLN, eventUrlLN, eventUrl, buyTime, eventNumber, sessionPrice, sessionSeat, ticketCount, serialMode, serialCard, mooncakeMode, seatWebMode, seatWebUrl, buyTicketQuickPrice, buyTicketQuickSeat, buyTicketQuickTicket);
    }
}

async function ocr(cookie) {

    console.log('### Start OCR Bot ###');
    sseResponse.write(`data: ${'### Start OCR Bot ###'}\n\n`);

    const cookies = {
        'url': 'https://tixcraft.com/',
        'name': 'SID',
        'value': cookie
    };
    
    puppeteer.use(StealthPlugin());
        
    const browser = await puppeteer.launch({
            headless: closeWebDriver,
            ignoreHTTPSErrors: true,
            args: [
                `--window-size=${100},${100}`,
                '--no-sandbox',
                '--allow-running-insecure-content'
            ]
        });
    
    const mainPage = await browser.newPage();
    
    mainPage.on('dialog', async dialog => {
        log=dialog.message();
        await dialog.accept();
        console.log(log);
    })
    await mainPage.setCookie(cookies);

    //--------------------------------------------------------------

    await mainPage.goto('https://tixcraft.com/');
    await setDelayTime(1000);
    await mainPage.goto('https://tixcraft.com/ticket/captcha');

    if(golbalCancle == 'botStop') {
        door = false;
    }

    while(door) {
        while(true) {

            if(golbalCancle == 'botStop') {
                door = false;
                break;
            }

            await setDelayTime(1);

            if(lock == true)
                break;

            if(closeBrowser == true) {
                await setDelayTime(1000);
                break;
            }
        }

        if(closeBrowser == true) {
            await setDelayTime(1000);
            break;
        }

        if(golbalCancle == 'botStop') {
            break;
        }

        mainPage.reload({ waitUntil: ['domcontentloaded'] });
        await mainPage.waitForSelector('img', {visible: true});
        let temp = '';
        let form = await mainPage.$('img');
        await form.screenshot({ 
            path:'./../client/src/global/verifyCode.png'
        });
        await Ddddocr.create().then(async ddddocr => { 
            temp = await ddddocr.classification('./../client/src/global/verifyCode.png');
        });
        verifyCode = temp;
        lock = false;
    }
    await browser.close();
    golbalCancle = '';
}

async function time(buyTimeHour, buyTimeMinute, buyTimeTest, buyTimeQuick) {
    return new Promise(async (resolve) => {
        const intervalId = setInterval(() => {
            const now = new Date();
            const hour = now.getHours();
            const minute = now.getMinutes();
            const second = now.getSeconds();

            const currentTime = `${hour} : ${minute} : ${second}`;
            sseResponse.write(`data: ${currentTime}\n\n`);
            console.log(currentTime);

            let shouldBreak = false;
            if(buyTimeTest == true) {
                if(second%10 == 0) {
                    shouldBreak = true;
                }
            } else if(buyTimeQuick == true) {
                if(second%2 == 0) {
                    shouldBreak = true;
                }
            } else if(buyTimeHour > 0) {
                if(hour==buyTimeHour && minute==buyTimeMinute && second==0) {
                    shouldBreak = true;
                }
            }

            if(golbalCancle == 'botStop') {
                clearInterval(intervalId);
                resolve();
            }

            if (shouldBreak){
                console.log('倒數結束');
                clearInterval(intervalId);
                resolve();
                door = true;
            }
        }, 1000);
    });
}

async function setDelayTime(delayTime) {
    try {
        await mainPage.waitForTimeout(delayTime);
    } catch(e) {
        await new Promise(r => setTimeout(r, delayTime));
    }
}

async function sendMsg(msg) {
    sseResponse.write(`data: ${msg}\n\n`);
}
