import { Component, Utils, Pages} from "../Package.js";

export default class FeedComponent extends Component {
    wrapperClassList = "window recent-activity";

    render() {
        const booksDataContainer = document.getElementById('books-data');
        const books = JSON.parse(booksDataContainer.getAttribute('data-books') || '[]');
        
        this.inner = `
        <div class="inner-component" id="feed">
            <div class="gradient"></div>
            <h2 class="dark-text">My Books</h2>
            <div class="book-list recent-books">
                ${FeedComponent.bookList(books)}
            </div>
        </div>`;

        return this.inner;
    }

    async onMount() {
        super.onMount();
        this._subscribeEvents();

        Utils.defineGenreBubbles();
        console.log(`Mounted: Feed`);
    }

    async onUnmount() {
        super.onUnmount();
        this._unsubscribeEvents();

        console.log(`Unmounted: Feed`);  
    }

    //#region ============[ PRIVATE ]=================================

    _subscribeEvents() {
        this._handleBookClick = this._handleBookClick.bind(this);
        this.wrapper.addEventListener('click', this._handleBookClick);
    }
    _unsubscribeEvents() {
        this.wrapper.removeEventListener('click', this._handleBookClick);
    }

    _handleBookClick(event) {
        const possibleBook = event.target.parentElement;
        if (possibleBook.classList.contains('book')) {
            const bookId = possibleBook.dataset.bookId;
            if (bookId) {
                this.orchestrator.setData("selectedBookID", bookId);
                Pages.goPage('bookDetails', this.orchestrator);
            }
        }
    }

    //#endregion

    //#region ============[ SUB-COMPONENTS ]==========================

    static bookList(books){
        if (books.length > 0) {
            return books.map(book => FeedComponent.bookCard(book)).join('');
        } else {
            return `
                <p>No books saved yet. Start adding some books!</p>
            `;
        }
    }

    static bookCard(book){
        return `<a class="book inner-window" data-book-id="${book.id}">
                    <div class="cover-container">
                        <img class="book-cover" 
                            src="${book.cover}" 
                            alt="${book.title}" />
                        <div class="gradient"></div>
                        <div class="title-container">
                            <div class="title">
                                <h3>${book.title}</h3>
                            </div>
                        </div>  
                    </div> 
                    <hr />
                    <div class="desc-container">
                        <p class="left"><strong>Author(s)</strong></p>
                        <p class="right">${book.author}</p>
                    </div>
                    <div class="desc-container">
                        <p class="left"><strong>Genre(s)</strong></p>
                        <p class="right genre">${book.genre}</p>
                    </div>
                    <div class="desc-container">
                        <p class="left"><strong>Published</strong></p>
                        <p class="right">${book.publishedYear}</p>
                    </div>
                    <div class="desc-container">
                        <p class="left"><strong>Rating</strong></p>
                        <p class="right">${book.rating}</p>
                    </div>
                    <div class="gradient-accent"></div>
                </a>`;
    }

    //#endregion
}
