import { TokenBucket } from './tokenBucket'
import assert from 'node:assert'

describe('Token Bucket', () => {
    it('Null parameters not allowed in token bucket.', () => {
        // @ts-ignore
        assert.throws(() => { new TokenBucket(null)})
    })
})