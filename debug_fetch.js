
const http = require('http');
const fs = require('fs');

const file = fs.createWriteStream("debug_output.html");
http.get("http://localhost:3003/login", function (response) {
    console.log("Status Code:", response.statusCode);
    response.pipe(file);
    file.on('finish', function () {
        file.close(() => {
            console.log("File written");
        });
    });
}).on('error', function (err) {
    fs.unlink("debug_output.html");
    console.error(err);
});
