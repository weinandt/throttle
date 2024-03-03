import { RequestContext } from "../context";
import { Book, BookStore } from "./bookStore";
import { GraphQLResolveInfo } from 'graphql';

export class BookResolvers {
    private bookStore: BookStore
    constructor(bookStore: BookStore) {
        this.bookStore = bookStore
    }

    saveBook(_: any, args: {book: Book}, context: RequestContext, info: GraphQLResolveInfo): Book {
        const book = args.book
        this.bookStore.saveBook(book)

        return book
    }

    listBooks(_: any, __: any, context: RequestContext, info: GraphQLResolveInfo): Book[] {
        return this.bookStore.listBooks()
    }
}