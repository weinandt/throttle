import { InMemoryTokenBucketThottler } from './InMemoryTokenBucketThottler'
import assert from 'node:assert'

describe('Token Bucket throttler initialization', () => {
    it('Null parameters not allowed in token bucket.', () => {
        // @ts-ignore
        assert.throws(() => { new InMemoryTokenBucketThottler(null)})
    })
})

describe('Token Bucket throttler should throttle', () => {
    it('If not exceeding burst, should allow', () => {
        const burst = 5
        const refillAmount = 10
        const throttler = new InMemoryTokenBucketThottler({
            burst,
            refillAmount,
            refillIntervalInMs: 1000,
        })

        const shouldThrottle = throttler.shouldThrottle('a')

        assert(!shouldThrottle)
    })
    it('Exceeding burst and refill should not be allowed', () => {
        const burst = 5
        const refillAmount = 10
        const throttler = new InMemoryTokenBucketThottler({
            burst,
            refillAmount,
            refillIntervalInMs: 1000,
        })

        let shouldThrottle = false
        for(let i = 0; i < burst + refillAmount + 1; ++i) {
            shouldThrottle = throttler.shouldThrottle('a')
        }

        assert(shouldThrottle)
    })
    it('Below burst and refill should be allowed', () => {
        const burst = 5
        const refillAmount = 10
        const throttler = new InMemoryTokenBucketThottler({
            burst,
            refillAmount,
            refillIntervalInMs: 1000,
        })

        let shouldThrottle = false
        for(let i = 0; i < burst + refillAmount; ++i) {
            shouldThrottle = throttler.shouldThrottle('a')
        }

        assert(!shouldThrottle)
    })
})