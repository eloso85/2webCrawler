//hello.js

const { Worker, isMainThread, parentPort } = require('worker_threads');

if(isMainThread){

    const worker =new Worker(__filename);
    worker.once('message', (message)=>{
        console.log(message);
    });

    worker.postMessage('Main Thread: Hi');

}else{
    parentPort.once('message',(message)=>{
        console.log(message)
        parentPort.postMessage("Worker thread:Hello");
    })
    console.log("Worker says: Hello World"); // prints 'workers says 
}

