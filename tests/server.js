(function () {
    'use strict';

    // Port number, default 8081
    var PORT = 8081;

    var http = require('http'),
        url = require('url'),
        path = require('path'),
        fs = require('fs'),
        mime = require('mime'),
        queryString = require('querystring'),
        port = PORT;

    var listenCallback = function () {
        console.log('Server running at http://localhost:' + port);
    };

    function corsHeaders (res, req) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || '*');
        res.setHeader('Access-Control-Allow-Methods', '*');
    }

    var server = http.createServer(function (req, res) {
        var urlData = url.parse(req.url),
            theUrl = urlData.pathname,
            someFileName = path.join(process.cwd(), theUrl),
            data = '',
            queryData = queryString.parse(urlData.query),
            startTime = Date.now(),
            endTime;

        req.on('data', function (datum) {
            data += datum;
        });

        req.on('end', function () {

            var sendResponse = function (error) {
                var requestParams = {
                    query: queryData,
                    data: data,
                    headers: req.headers,
                    method: req.method
                };
                if (!error) {
                    corsHeaders(res, req);
                }
                res.writeHead(200, {
                    "Content-Type": 'application/json'
                });
                res.end(JSON.stringify(requestParams));
                var endTime = Date.now();
                console.log('Response time: ' + ((endTime - startTime) / 1000) + ' sec');
            };

            if (theUrl === '/') {
               sendResponse();
            } else if (theUrl.indexOf('timeout') !== -1) {
                var timeout = parseInt(theUrl.split('/').reverse()[0], 10);
                setTimeout(sendResponse, timeout); 
            } else if (theUrl.indexOf('networkError') !== -1) {
                sendResponse(true);
            } else {
                fs.exists(someFileName, function (exists) {
                    var type = mime.lookup(someFileName);
                    if (!exists) {
                        corsHeaders(res, req);
                        res.writeHead(404, {
                            "Content-Type": 'text/plain'
                        });
                        res.write('404 Nothing Here\n');
                        res.end();
                        endTime = Date.now();
                        console.log('Response time: ' + ((endTime - startTime) / 1000) + ' sec');
                        return;
                    }
                    fs.readFile(someFileName, 'binary', function (err, file) {
                        if (err) {
                            corsHeaders(res, req);
                            res.writeHead(500, {
                                "Content-Type": 'text/plain'
                            });
                            res.write(err + '\n');
                            res.end();
                            endTime = Date.now();
                            console.log('Response time: ' + ((endTime - startTime) / 1000) + ' sec');
                            return;
                        }

                        corsHeaders(res, req);
                        res.writeHead(200, {
                            "Content-Type": type
                        });
                        res.write(file, 'binary');
                        res.end();
                        endTime = Date.now();
                        console.log('Response time: ' + ((endTime - startTime) / 1000) + ' sec');
                    });
                });
            }
        });
    });

    server.on('error', function errorHandler (err) {
        var additionalMessage = '';
        if (err.code === 'EADDRINUSE') {
            port += 1;
            additionalMessage = 'Port ' + port + ' unavailable.';
        }
        console.log(additionalMessage);
        server.listen(port, listenCallback);

    });

    server.listen(port, listenCallback);


}());

