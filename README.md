# Throttle

A collection of throttling techniques, implemenations and documentation.

## Techniques
[In Memory Token Bucket Throttle](src/InMemoryTokenBucketThottler.ts)

Features:

1. Allows burst
1. Removes un-used keys
1. Refills buckets on specified interval

## To Test:
1. `npm install`
2. `npm run test`


# TODO:
- Add a way to have a parent token bucket, so can do things like only allow x requests per minute, and y requests per day.
- Add a way to ask for more tokens from a global cache. if client has run out locally. Pushing from global to local is also an option.
    - Determine if client should rely on round-robin instead and how the universal scalability law applies to asking vs pushing.
    - Apply universal scalablity law.
    - Can a multi-level lookup tree help with the shared cache state.