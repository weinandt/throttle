# Auth Server for Client Credentials (S2S/M2M) OAuth

## To Run
1. `npm install`
2. `node server.js`
3. Make a curl request for a token. The server is set up for a single client with an id of `foo` and a secret of `bar`. The auth header is constructed by base64 encoding `foo:bar`:

```bash
  curl --request POST \
    --url 'http://localhost:3000/token' \
    --header 'content-type: application/x-www-form-urlencoded' \
    --header 'Authorization: Basic Zm9vOmJhcg==' \
    --data grant_type=client_credentials \
    --data resource=urn:api \
    --data scope=read
```