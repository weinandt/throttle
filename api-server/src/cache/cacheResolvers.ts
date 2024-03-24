import { RequestContext } from "../context";
import { GraphQLResolveInfo } from 'graphql';
import { Cache } from "./cache";

export type CacheSetInput = {
    key: string
    value: string
    ttl: number | null
}

export type CacheLookUpResult = {
    wasFound: boolean
    value: string | null
}

export class CacheResolvers {
    private cache: Cache
    constructor(cache: Cache) {
        this.cache = cache
    }

    async set(_: any, args: {input: CacheSetInput}, context: RequestContext, info: GraphQLResolveInfo): Promise<null> {
        await this.cache.set(args.input.key, args.input.value, args.input.ttl)

        return null
    }

    async get(_: any, args: {key: string}, context: RequestContext, info: GraphQLResolveInfo): Promise<CacheLookUpResult> {
        const [wasFound, value] = await this.cache.get(args.key)

        return {
            wasFound,
            value,
        }
    }
}