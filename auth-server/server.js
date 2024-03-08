import Provider from 'oidc-provider';

const configuration = {
    clients: [{
        client_id: 'foo',
        client_secret: 'bar',
        redirect_uris: [],
        response_types: [],
        grant_types: ['client_credentials']
    }],
    features: {
        clientCredentials: {
            enabled: true,
        },
        resourceIndicators: {
            enabled: true,
            getResourceServerInfo(ctx, resourceIndicator) {
                if (resourceIndicator ==='urn:api') {
                    return {
                        scope: 'read',
                        audience: 'urn:api',
                        accessTokenTTL: 1 * 60 * 60, // 1 hour
                        accessTokenFormat: 'jwt'
                    }
                }
        
                throw new errors.InvalidTarget()
            }
        }
    }
}

const oidc = new Provider('http://localhost:3000', configuration);

oidc.listen(3000, () => {
    console.log('oidc-provider listening on port 3000, check http://localhost:3000/.well-known/openid-configuration');
});