import { RequestContext } from "../context";
import { GraphQLResolveInfo } from 'graphql';
import { Cache, CacheLookUpResult, CacheSetInput } from "./cache";

export class CacheResolvers {
    private cache: Cache
    constructor(cache: Cache) {
        this.cache = cache
    }

    async set(_: any, args: {input: CacheSetInput}, context: RequestContext, info: GraphQLResolveInfo): Promise<void> {
        await this.cache.set(args.input)
        return
    }

    async get(_: any, args: {key: string}, context: RequestContext, info: GraphQLResolveInfo): Promise<CacheLookUpResult> {
        const cacheLookupResult = await this.cache.get(args.key)

        if (cacheLookupResult.ttl != null) {
            if (cacheLookupResult.ttl < new Date()) {
                return {
                    wasFound: false
                }
            }
        }

        return cacheLookupResult
    }
}