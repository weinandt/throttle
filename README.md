# throttle-cache

Implementation of cache and throttling mechanisms

## To Run Test
1. Go to AWS Console and create a dynamo table, specifing a partition key.



## TODO:
1. Create a simple webserver which sends requests to dynamo
2. Is the dynamo client http2 compatible?
3. Implement auth in the server.
    - How do do multi-tenancy
4. Implement throttling.
5. Should the server be http or http2 server?
    - How does that work with aws alb.