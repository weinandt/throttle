export class Server {
    start(): boolean {
        console.log('in the server')
        return true
    }
}

const server = new Server()
server.start()