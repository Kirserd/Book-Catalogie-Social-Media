import { Component, Utils, Pages} from "../Package.js";

export default class ExploreComponent extends Component {
    wrapperClassList = "window recent-activity";


    render() {
        const books = this.orchestrator?.getData('searchResults')?.books || [];
        this.inner = `
        <div class="inner-component" id="feed">
            <div class="gradient"></div>
            <h2 class="dark-text">Explore</h2>
            <div class="book-list recent-books">
                ${ExploreComponent.bookList(books)}
            </div>
        </div>`;

        return this.inner;
    }

    updateRender(){
        const books = this.orchestrator?.getData('searchResults')?.books || [];
        this.inner = `
        <div class="inner-component" id="feed">
            <div class="gradient"></div>
            <h2 class="dark-text">Explore</h2>
            <div class="book-list recent-books">
                ${ExploreComponent.bookList(books)}
            </div>
        </div>`;

        this.wrapper.innerHTML = this.inner;    
        
        Utils.defineGenreBubbles();
    }

    async onMount() {
        super.onMount();
        this._subscribeEvents();

        Utils.defineGenreBubbles();
        console.log(`Mounted: Explore`);

        this.updateRender();
    }

    async onUnmount() {
        super.onUnmount();
        this._unsubscribeEvents();

        console.log(`Unmounted: Explore`);  
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
                Pages.subPage = 'explore';
                Pages.goPage('bookDetails', this.orchestrator);
            }
        }
    }

    //#endregion

    //#region ============[ SUB-COMPONENTS ]==========================

    static bookList(books) {

        if (books.length > 0) {
            const result = books.map(book => ExploreComponent.bookCard(book)).join('');
            return result;
        } else {
            return `<p>No books found :c</p>`;
        }
    }
    
    static bookCard(book) {
        const { full_json } = book;
        const volumeInfo = full_json?.volumeInfo || {};
        const title = volumeInfo.title || 'Unknown Title';
        const author = volumeInfo.authors?.join(', ') || 'Unknown Author';
        const genre = volumeInfo.categories?.join(', ') || 'Unknown Genre';
        const publishedYear = volumeInfo.publishedDate || 'Unknown Year';
        const rating = book.rating ?? 'Not Rated';
        const cover = volumeInfo.imageLinks?.thumbnail || '';

        return `
            <a class="book inner-window" data-book-id="${book.book_id.trim()}">
                <div class="cover-container">
                    <img class="book-cover" 
                        src="${cover}" 
                        alt="${title}" />
                    <div class="gradient"></div>
                    <div class="title-container">
                        <div class="title">
                            <h3>${title}</h3>
                        </div>
                    </div>  
                </div> 
                <hr />
                <div class="desc-container">
                    <p class="left"><strong>Author(s)</strong></p>
                    <p class="right">${author}</p>
                </div>
                <div class="desc-container">
                    <p class="left"><strong>Genre(s)</strong></p>
                    <p class="right genre">${genre}</p>
                </div>
                <div class="desc-container">
                    <p class="left"><strong>Published</strong></p>
                    <p class="right">${publishedYear}</p>
                </div>
                <div class="desc-container">
                    <p class="left"><strong>Rating</strong></p>
                    <p class="right">${rating}</p>
                </div>
                <div class="gradient-accent"></div>
            </a>`;
    }

    //#endregion
}
