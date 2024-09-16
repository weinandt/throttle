export interface TokenBucketParams {
    burst: number
    refillIntervalInMs: number
}

export class TokenBucket {
    constructor(params: TokenBucketParams) {
        if (params == null) {
            throw new Error('token bucket cannot have null parameters')
        }
    }
}