import { BookStore, InMemoryBookStore } from "./bookStore"
import assert from "node:assert"

describe('BookStore Tests', () => {
    it('InMemory Book Store should save book.', () => {
        // Arrange.
        const bookStore: BookStore = new InMemoryBookStore
        const book = {
            Name: "testBookName"
        }

        // Act
        bookStore.saveBook(book)

        // Assert
        assert.deepStrictEqual(bookStore.listBooks()[0], book, "Book did not match expectations")
    })
})