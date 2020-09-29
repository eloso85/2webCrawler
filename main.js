const axios = require('axios');
const cheerio = require('cheerio');
const { messaging } = require('firebase-admin');
const { format } = require('path');
const url = "https://www.iban.com/exchange-rates";

fetchData(url).then((res)=>{
    const html = res.data;
    const $ = cheerio.load(html);
    const statsTable = $('.table.table-bordered.table-hover.downloads > tbody > tr');
    statsTable.each(function(){
        let title = $(this).find('td').text();
        console.log(title)
    });
});

async function fetchData(url){
    console.log("Crawling data...")

    let response = await axios(url).catch((err) => console.log(err));

    if (response.status !== 200){
        console.log("Error ocurred while fetching data");
        return;
    }
    return response;
}

let workDir = __dirname+"/dbWorker.js";

const mainFunc = async()=>{
    const url = "https://www.iban.com/exchange-rates";

    let res = await fetchData(url);
    if (!res.data){
        console.log("Invalid data Obj");
        return;
    }

    const html = res.data;

    let dataObj = new Object();

    const $ = cheerio.load(html);

    let dataObj = new Object();

    const statsTable = $('.table.table-bordered.table-hover.downloads > tbody > tr');

    //loop through all tables

    statsTable.each(function(){
        let title = $(this).find('td').text();// get the text in all the table data
        let newStr = title.split("\t");// convert text to (string)
        newStr.shift(); //strip off empty array elemnt at index 
        formatStr(newStr, dataObj);
    })

    return dataObj;

}

mainFunc().then((res)=>{
    //start worker

    const worker = new Worker(workDir);

    console.log("Sending crawled data to dbWorker....");
    // send formatted data to wroker thread

    worker.postMessage(res);
    //listen to message from worker thread

    worker.on("Message", (message)=>{
        console.log(message);
    });
});

function formatStr(arr, dataObj){

    //regex to match all the words before the first digit

    let regExp = /[^A-Z]*(^\D+)/
    let newArr = arr[0].split(regExp);// split array element
    dataObj[newArr[1]] = newArr[2];// store object

}