import { InMemoryTokenBucketThottler } from './InMemoryTokenBucketThottler'
import assert from 'node:assert'
import sinon from 'sinon'

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

// Once node stabilizes the mock test functionality, use that instead of sinon.
// https://nodejs.org/api/test.html#class-mocktimers
describe('Token Bucket time dependent refill tests', () => {
    let clock: sinon.SinonFakeTimers

    beforeEach(() => {
        clock = sinon.useFakeTimers()
    })

    afterEach(() => {
        clock.restore()
    })

    it('Should have more tokens available after consuming all and refill takes place', () => {
        const key = 'a'
        const burst = 5
        const refillAmount = 10
        const refillIntervalInMs = 1000
        const throttler = new InMemoryTokenBucketThottler({
            burst,
            refillAmount,
            refillIntervalInMs,
        })

        // Consuming all tokens
        for(let i = 0; i < burst + refillAmount; i++){
            throttler.shouldThrottle(key)
        }

        // Advancing the time
        clock.tick(refillIntervalInMs)

        // We should now have the refill amount of callbacks left and exceeded should throttle.
        for(let i = 0; i < refillAmount; i++){
            assert(!throttler.shouldThrottle(key))
        }

        assert(throttler.shouldThrottle(key))
    })
    it('Multiple refill periods should give proper amount of tokens', () => {
        const key = 'a'
        const burst = 50 // This needs to allow for multiple refills without overflowing.
        const refillAmount = 10
        const refillIntervalInMs = 1000
        const numRefillIntervals = 2
        const throttler = new InMemoryTokenBucketThottler({
            burst,
            refillAmount,
            refillIntervalInMs,
        })

        // Consuming all tokens
        for(let i = 0; i < burst + refillAmount; i++){
            throttler.shouldThrottle(key)
        }

        // Advancing the time
        clock.tick(numRefillIntervals * refillIntervalInMs)

        // We should now have the refill amount of callbacks left and exceeded should throttle.
        for(let i = 0; i < numRefillIntervals * refillAmount; i++){
            assert(!throttler.shouldThrottle(key))
        }

        assert(throttler.shouldThrottle(key))
    })
    it('Multiple refill periods should not overfill bucket', () => {
        const key = 'a'
        const burst = 1 // This needs to allow for multiple refills without overflowing.
        const refillAmount = 4
        const refillIntervalInMs = 1000
        const numRefillIntervals = 2
        const throttler = new InMemoryTokenBucketThottler({
            burst,
            refillAmount,
            refillIntervalInMs,
        })

        // Consuming all tokens
        for(let i = 0; i < burst + refillAmount; i++){
            throttler.shouldThrottle(key)
        }

        // Advancing the time
        clock.tick(numRefillIntervals * refillIntervalInMs)

        for(let i = 0; i < burst + refillAmount; i++){
            assert(!throttler.shouldThrottle(key))
        }

        assert(throttler.shouldThrottle(key))
    })
    it('Un-used token buckets should be removed from memory', () => {
        const key = 'a'
        const burst = 1
        const refillAmount = 4
        const refillIntervalInMs = 1000
        const throttler = new InMemoryTokenBucketThottler({
            burst,
            refillAmount,
            refillIntervalInMs,
        })

        // Registering the key for a new token bucket
        throttler.shouldThrottle(key)

        // Looking at a private member of the class. This is necessary to show the map reduced in size.
        const map = (throttler as any)['map'] as Map<string, any>
        assert.equal(map.size, 1)

        // Advancing the time one refill period. Object should stay in the map
        clock.tick(refillIntervalInMs)
        assert.equal(map.size, 1)

        // Advancing the time again, no tokens were consumed and token bucket was full, object should be removed.
        clock.tick(refillIntervalInMs)
        assert.equal(map.size, 0)
    })
})