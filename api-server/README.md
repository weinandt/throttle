# Graphql API for Caching in dynamo

## To Run:
1. Start postgres: `docker-compose up -d`
2. `npm install`
3. Run the DB set up script: `npm run set-up`
5. `npm run start`
6. Click the playground link in the console.


## AWS Links
- DynamoDB NodeJS v3 Docs: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/dynamodb/ 

## TODO
- Have server test postgres connection with dummy query during startup.
- Tenancy
- Delete from cache api
- Set transaction timeouts and request times on postgres
- Write a cli for tenant provisioning and application provisioning.
- Implement feature flags
    - Good use case for batch write to cache and pagniated get.
- Implement token burst and distributed throttle.
- Test out dynamo ttl
    - Removing attribute should prevent from purging
    - Purged attribute should be purged.
    - Updated key without ttl, should have ttl removed.
- Create dynamo db table creation sdk.
    - SDK should provision partition key and TTL name.