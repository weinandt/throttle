import { ServerConfig, startServer } from "./server";
import http from "node:http"

const serverConfig: ServerConfig = {
    port: 3000
}

startServer(serverConfig).then((httpServer: http.Server) => {
    console.log(`Server started. Playground at: http://localhost:${serverConfig.port}/playground`)
})