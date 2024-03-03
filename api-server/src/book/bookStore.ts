// TODO: figure out how to auto-gen this from schema
export type Book = {
    Name: string
}

export interface BookStore {
    listBooks(): Book[]
    saveBook(book: Book): void
}

export class InMemoryBookStore {
    private store: Book[] = []

    listBooks(): Book[] {
        return this.store
    }

    saveBook(book: Book): void {
        this.store.push(book)

        return
    }
}
