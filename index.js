const morgan = require('morgan');
const request = require('request');
const express = require('express');
const fs = require('fs');

(function () {
    const app1 = express();
    const app2 = express();

    app1.get('/proxy-src-error', (req, res) => {
        const xSrc = request({url: 'http://localhost:1000/errdata', method: 'GET', timeout: 10000});
        const xDst = request({url: 'http://localhost:1002/putdata', method: 'POST', timeout: 10000});
        xSrc.pipe(xDst);
        xSrc.on('error', (err) => {
                console.log(new Date(), err);
                // res.end();
                xDst.emit('error', err);
            }) // unhandled exception if not specified
            .on('data', (chunk) => res.write(chunk))
            .on('end', () => {
                console.log('IS RES COMPLETE?:', res.complete);
                res.end();
            });

        xDst.on('error', (err) => {
                console.log('DST ERR:', err);
                xDst.abort();
                console.log('RESPONSE END');
                res.end();
            })
            .on('abort', () => {
                console.log('DST ABORT');
            })
            .on('data', (chunk) => console.log('DST DATA:', chunk.toString().length))
            .on('complete', (resp) => {
                console.log('DST END', 'complete', resp.statusCode);
            });
    });

    app1.get('/proxy-dst-error', (req, res) => {
        const xSrc = request({url: 'http://localhost:1000/errdata', method: 'GET', timeout: 10000});
        const xDst = request({url: 'http://localhost:1002/errdata', method: 'POST', timeout: 10000});
        xSrc.pipe(xDst);
        xSrc.on('error', (err) => {
                console.log('SRC ERR:', err);
                xSrc.abort();
                res.end();
            })
            .on('data', (chunk) => res.write(chunk))
            .on('end', () => res.end());

        xDst.on('error', (err) => console.log('DST ERR:', err))
            .on('abort', () => console.log('DST ABORT'))
            .on('data', (chunk) => console.log('DST DATA:', chunk.toString().length))
            .on('complete', (resp) => {
                console.log('DST END', 'complete', resp.statusCode);
            });
    });


    app2.post('/putdata', (req, res) => {
        const stream = fs.createWriteStream('temp.log');
        req.pipe(stream);
    });

    app2.post('/errdata', (req, res) => {
        res.status(400);
        res.json({error: true});
    });

    const server1 = app1.listen(1001, () => console.log('app1:', 1001));
    const server2 = app2.listen(1002, () => console.log('app2:', 1002));
})();
