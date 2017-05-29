const morgan = require('morgan');
const request = require('request');
const express = require('express');
const promiseRetry = require('promise-retry');
const fs = require('fs');

(function () {
    const app0 = express();

    app0.get('/errdata', (req, res, next) => {
        let i = 0;
        res.setHeader('Transfer-Encoding', 'chunked');
        res.write('[');
        const descriptor = setInterval(
            () => {
                if (++i > 3) {
                    clearInterval(descriptor);
                    console.log(new Date(), 'close conn');
                    // res.connection.write(
                    //     'HTTP/1.1 500 Let\'s ruin that response!\r\n' +
                    //     'Content-Type: text/plain\r\n' +
                    //     'Transfer-Encoding: chunked\r\n\r\n'
                    // );
                    res.connection.write('HTTP/1.1 500 INVALID_END_OF_STREAM');
                    res.end();
                    return;
                }

                res.write(JSON.stringify({i: i, item: i}));
                res.write(',');
            },
            1000);
    });

    const server0 = app0.listen(1000, () => console.log('app0:', 1000));
})();

process.on('uncaughtException', (e) => {
    console.log('GLOBAL EXCEPTION:', e);
});
