import { RequestContext } from "../context";
import { GraphQLResolveInfo } from 'graphql';
import { Cache } from "./cache";

export type CacheSetInput = {
    key: string
    value: string
    ttl: Date | null
}

export type CacheLookUpResult = {
    wasFound: boolean
    value: string | null
    ttl: Date | null
}

export class CacheResolvers {
    private cache: Cache
    constructor(cache: Cache) {
        this.cache = cache
    }

    async set(_: any, args: {input: CacheSetInput}, context: RequestContext, info: GraphQLResolveInfo): Promise<null> {
        let ttl = null
        if (args.input.ttl != null) {
            ttl = Math.floor(args.input.ttl.getTime() / 1000.0)
        }

        await this.cache.set(args.input.key, args.input.value, ttl)

        return null
    }

    async get(_: any, args: {key: string}, context: RequestContext, info: GraphQLResolveInfo): Promise<CacheLookUpResult> {
        let [wasFound, value] = await this.cache.get(args.key)

        // TODO: make void a graphql scalar.
        if (value == null) {
            value = ""
        }
        return {
            wasFound,
            value,
            ttl: new Date(), // TODO: this is just a test.
        }
    }
}