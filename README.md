# Throttle

A collection of throttling techniques, implemenations and documentation.

## To Test:
1. `npm install`
2. `npm run test`


# TODO:
- Add refill mechanism, which detects if there has already been a recent refill.
- Add a way to have a parent token bucket, so can do things like only allow x requests per minute, and y requests per day.
- Add a way to clean un-used values from the token bucket.
- Add a way to ask for more tokens from a global cache. if client has run out locally. Pushing from global to local is also an option.
    - Determine if client should rely on round-robin instead and how the universal scalability law applies to asking vs pushing.
- Apply universal scalablity law.
- Can a multi-level lookup tree help with the shared cache state.