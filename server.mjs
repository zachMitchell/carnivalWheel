import { createServer } from "http";
import { readFileSync } from "fs";

const mimeTypes = {
    "html": "text/html",
    "png": "image/png",
    "svg": "image/svg+xml",
    "js": "application/javascript",
    "css": "text/css",
    "mp3": "audio/mp3"
}

createServer((req, res)=>{
    var path = new URL(req.url, "https://"+req.headers.host).pathname;
    var extension = path.substring(path.lastIndexOf('.')+1, path.length);

    res.statusCode = 200;
    //Do the thing or just crash
    try{
        res.setHeader('Content-Type', mimeTypes[extension]);
        res.end(readFileSync("."+path))
    }
    catch(e){
        console.error('-_-', e);
        res.statusCode = 404;
        res.end("Not Found");
    }

}).listen(3000)