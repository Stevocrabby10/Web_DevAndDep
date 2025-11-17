var http = require('http');
var url = require('url');
var fs = require('fs');

http.createServer(function (req, res) 
{
    var q = url.parse(req.url, true);
    var file;
    if (q.pathname == '/') {
        file = (__dirname + "/../view" + "/index.html");
        // __dirname is where the current script is, e.g. the 'controller' folder
    } else {
        file = (__dirname + "/../view" + q.pathname);
        // files to be sent to the client are on the 'view' folder
    }

    fs.readFile(file, function(err, data){
        if (err) 
        {
            res.writeHead(404, {'Content-Type': 'text/html'});
            return res.end("404 Not Found");
        }
        
        // Set the correct content type based on file extension
        const contentType = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'text/javascript',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.gif': 'image/gif'
        };
        const ext = file.substring(file.lastIndexOf('.'));
        res.writeHead(200, {'Content-Type': contentType[ext] || 'text/plain'});
        res.write(data);
        return res.end();
    });
}).listen(3000);
// starts a simple http server locally on port 3000