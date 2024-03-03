export type RequestContext = {
    userId: string
}

export function createExpressContext(req: Express.Request): RequestContext {
    return {
        userId: "staticUserId"
    }
}