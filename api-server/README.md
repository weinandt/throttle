# Graphql API for Caching in dynamo

## To Run:
1. Start postgres: `docker-compose up -d`
2. `npm install`
3. Run the DB set up script: `npm run set-up`
5. `npm run start`
6. Click the playground link in the console.

## TODO
- Have server test postgres connection with dummy query during startup.
- Determine if composite primary key is best, or if single column string key (dynamo way) is faster.
    - Determine how the ordering of the composite key works.
- Add proper error handling.
- Auth
- Tenancy
- Delete from cache api
- Determine if you should use docker-compose or test-containers: https://node.testcontainers.org/modules/postgresql/ 