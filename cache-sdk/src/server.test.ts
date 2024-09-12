import { assert } from 'console'
import { Server } from './server'

describe('Server tests', () => {
    it('test', () => {
        const server = new Server()
        assert(server.start())
    })
})