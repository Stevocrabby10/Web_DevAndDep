var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');

http.createServer(function (req, res) 
{
    // Track if response has been sent to avoid multiple responses
    let responseSent = false;
    
    // Helper function to send response safely
    const sendResponse = (statusCode, headers, data) => {
        if (responseSent) return;
        responseSent = true;
        res.writeHead(statusCode, headers);
        res.end(data);
    };
    
    // Helper function to send error response
    const sendError = (statusCode, message) => {
        sendResponse(statusCode, {'Content-Type': 'text/html'}, message);
    };
    
    var q = url.parse(req.url, true);
    var file;
    var viewDir = path.join(__dirname, "../view");
    
    try {
        if (q.pathname == '/') {
            file = path.join(viewDir, "index.html");
        } else {
            // Normalize and resolve the path to prevent directory traversal attacks
            var requestedPath = q.pathname;
            
            // Remove leading slash and normalize path
            if (requestedPath.startsWith('/')) {
                requestedPath = requestedPath.substring(1);
            }
            
            // Resolve the full path and ensure it's within the view directory
            var resolvedPath = path.resolve(viewDir, requestedPath);
            
            // Check if the resolved path is within the view directory
            if (!resolvedPath.startsWith(path.resolve(viewDir))) {
                return sendError(403, "403 Forbidden - Invalid path");
            }
            
            // If no file extension, try adding .html for cleaner URLs
            if (!path.extname(resolvedPath)) {
                resolvedPath = resolvedPath + ".html";
            }
            
            file = resolvedPath;
        }
        
        // Ensure the file is within the view directory
        if (!path.resolve(file).startsWith(path.resolve(viewDir))) {
            return sendError(403, "403 Forbidden - Invalid path");
        }
        
        // files to be sent to the client are on the 'view' folder
        fs.readFile(file, function(err, data){
            if (err) {
                if (err.code === 'ENOENT') {
                    return sendError(404, "404 Not Found");
                } else if (err.code === 'EACCES') {
                    return sendError(403, "403 Forbidden - Access denied");
                } else {
                    console.error('Error reading file:', err);
                    return sendError(500, "500 Internal Server Error");
                }
            }
            
            // Set the correct content type based on file extension
            const contentType = {
                '.html': 'text/html; charset=utf-8',
                '.css': 'text/css; charset=utf-8',
                '.js': 'text/javascript; charset=utf-8',
                '.json': 'application/json; charset=utf-8',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.gif': 'image/gif',
                '.svg': 'image/svg+xml',
                '.ico': 'image/x-icon',
                '.woff': 'font/woff',
                '.woff2': 'font/woff2',
                '.ttf': 'font/ttf',
                '.eot': 'application/vnd.ms-fontobject'
            };
            
            const ext = path.extname(file).toLowerCase();
            const contentTypeHeader = contentType[ext] || 'text/plain; charset=utf-8';
            
            sendResponse(200, {'Content-Type': contentTypeHeader}, data);
        });
    } catch (error) {
        console.error('Server error:', error);
        if (!responseSent) {
            sendError(500, "500 Internal Server Error");
        }
    }
}).listen(3000);
// starts a simple http server locally on port 3000