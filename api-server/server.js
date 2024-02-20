import http from "node:http"

const requestListener = function (req, res) {
    try {
        res.setHeader("Content-Type", "application/json");
        switch (req.url) {
            case "/cache":
                res.writeHead(200);
                res.end(JSON.stringify({ "justATest": 1 }));
                break
            default:
                res.writeHead(404);
                res.end(JSON.stringify({ error: "Resource not found" }));
        }
    }
    catch (error) {
        console.log("Fatal error in an api: " + error)
        res.writeHead(500)
        res.end(JSON.stringify({ error: "Internal error" }));
    }
}

const server = http.createServer(requestListener);

const port = 3000
server.listen(3000, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
