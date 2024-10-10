export interface TokenBucketParams {
    /**
     * Additional tokens which can exceed the normal rate if the bucket has capacity.
     * Set to 0 if you do not want burst.
     */
    burst: number

    /**
     * How frequently all the token buckets will be iterated and refilled.
     */
    refillIntervalInMs: number

    /**
     * How many tokens will be added to the bucket during a refill.
     */
    refillAmount: number
}

class TokenBucket {
    tokensLeft: number = 0
}

export class InMemoryTokenBucketThottler {
    private map = new Map<string, TokenBucket>()
    private burst: number
    private refillIntervalInMs: number
    private refillAmount: number

    constructor(params: TokenBucketParams) {
        if (params == null) {
            throw new Error('token bucket cannot have null parameters')
        }

        this.burst = params.burst
        this.refillIntervalInMs = params.refillIntervalInMs
        this.refillAmount = params.refillAmount

        // SetInterval can be used here as refillBuckets does no async work.
        // If refillBuckets were async, setTimeout should be used and re-newed every timeout to avoid too many invocations.
        const timeoutTracker = setInterval(() => { this.refillBuckets() }, this.refillIntervalInMs)
        timeoutTracker.unref() // Allowing the process to exit.
    }

    private initializeKey(key: string): TokenBucket {
        const tokenBucket = new TokenBucket()

        // Initial capacity will be burst + refillAmount
        tokenBucket.tokensLeft = this.burst + this.refillAmount
        this.map.set(key, tokenBucket)

        return tokenBucket
    }

    private refillBuckets() {
        for (let [key, tokenBucket] of this.map) {
            const unusedTokens = tokenBucket.tokensLeft

            // If no tokens were used, we should remove the token bucket to save on memory.
            if (unusedTokens == this.refillAmount + this.burst) {
                this.map.delete(key)
                continue
            }

            let newTokens = unusedTokens + this.refillAmount

            // Checking for overflow or if exceeded burst
            if (newTokens < 1 || newTokens > (this.refillAmount + this.burst)) {
                newTokens = this.refillAmount + this.burst
            }

            tokenBucket.tokensLeft = newTokens
        }
    }

    public shouldThrottle(key: string): boolean {
        let tokenBucket = this.map.get(key)
        if(tokenBucket == null) {
            tokenBucket = this.initializeKey(key)
        }

        if (tokenBucket.tokensLeft == 0) {
            return true
        }

        // Using a token and not throttling.
        tokenBucket.tokensLeft = tokenBucket.tokensLeft - 1

        return false
    }
}