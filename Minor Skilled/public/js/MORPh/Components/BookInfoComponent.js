import { Utils, Pages, Component } from "../Package.js";

export default class BookInfoComponent extends Component {
    wrapperClassList = "window no-overflow";
    
    subscribed = false;
    bookID;
    bookInfo = {};
    static isBookSaved;

    render() {
        this.inner = `
        <div class="inner-component" id="book-details-start-section"></div>`;

        return this.inner;

    }

    async updateRender() {
        this.wrapper.classList = this.wrapperClassList;

        this.wrapper.innerHTML = `
        <div class="inner-component" id="book-details-start-section">
            <br>
            ${BookInfoComponent.returnButton()}
            ${await BookInfoComponent.saveToggle(this.bookID)}
            <div class="gradient"></div>
            ${BookInfoComponent.coverSection(this.bookInfo)}
            ${BookInfoComponent.descContainer("Author(s)", this.bookInfo.full_json.volumeInfo.authors?.join(', ') || 'Unknown Author')}
            ${BookInfoComponent.descContainer("Genre(s)", this.bookInfo.full_json.volumeInfo.categories?.join(', ') || 'Unknown Genre', "genre")}
            <br />
            ${BookInfoComponent.descContainer("Language", this.bookInfo.full_json.volumeInfo.language)}
            ${BookInfoComponent.descContainer("Publisher", this.bookInfo.publisher)}
            ${BookInfoComponent.descContainer("Published", this.bookInfo.full_json.volumeInfo.publishedDate)}
            <hr />
            ${BookInfoComponent.descContainer("Rating", this.bookInfo.rating ?? 'Not Rated')}
            ${BookInfoComponent.descContainer("Maturity", this.bookInfo.full_json.volumeInfo.maturityRating)}
        </div>`;

        Utils.defineGenreBubbles();
        if(this.subscribed)
            this._unsubscribeEvents();
        this._subscribeEvents();
    }

    onMount() {
        super.onMount();
        this._fetchBookInfo();
        console.log(`Mounted: BookInfoComponent`);
    }

    onUnmount() {
        super.onUnmount();
        this._unsubscribeEvents();
        console.log(`Unmounted: BookInfoComponent`);
    }
  
    _subscribeEvents() {
        this._handleReturnClick = this._handleReturnClick.bind(this);
        this._handleSaveClick = this._handleSaveClick.bind(this);
        document.getElementById('dashboard-btn').addEventListener('click', this._handleReturnClick); 
        document.getElementById('book-save-toggle').addEventListener('click', this._handleSaveClick); 
        this.subscribed = true;
    }
    _unsubscribeEvents() {
        document.getElementById('dashboard-btn').removeEventListener('click', this._handleReturnClick);
        document.getElementById('book-save-toggle').removeEventListener('click', this._handleSaveClick);
        this.subscribed = false;
    }
    _handleReturnClick(event) {
        event.preventDefault();
        Pages.goPage('dashboard', this.orchestrator);
    }

    async _handleSaveClick(event) {
        event.preventDefault();

        const method = BookInfoComponent.isBookSaved ? 'DELETE' : 'POST';
        const response = await fetch(`/books/${this.bookID}`, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    
        if (response.ok) {
            await this.updateRender();
        } else {
            console.error('Failed to save/remove book:', await response.text());
        }
    }

    async _fetchBookInfo() {
        this.bookID = this.orchestrator.getData("selectedBookID");
        const res = await fetch(`/books/${this.bookID}`);
        this.bookInfo = (await res.json()).book;

        await this.updateRender();
    }

    static returnButton(){
        return `
            <div class="return-btn-container-pivot">
                <div class="return-btn-container">
                    <button class="icon-btn hov-s6i hov-si blank-btn" id="dashboard-btn">
                            <svg class="icon-btn-img hov-i" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                                <path d="m419.71-480.67 166.15 166.15q10.52 10.52 10.18 24.94-.33 14.41-10.85 25.44-10.52 11.02-25.52 11.1-15 .08-25.69-10.94l-191.1-191.09q-5.72-5.39-8.49-11.85-2.77-6.45-2.77-13.75 0-7.29 2.77-13.75 2.77-6.45 8.49-12.17l191.77-191.77q10.68-10.68 25.68-10.6 15 .08 25.53 11.1 10.52 11.03 10.52 25.78 0 14.75-10.52 25.27L419.71-480.67Z"/>
                            </svg>
                    </button>
                </div>
            </div>
        `;
    }

    static async saveToggle(bookID){
        const res = await fetch(`/books/${bookID}/saved`);
        BookInfoComponent.isBookSaved  = (await res.json()).isBookSaved;

        const notSaved = `
        <svg class="icon-btn-img hov-i" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
            <path d="M685.31-683.74h-66.5q-7.14 0-11.86-4.76t-4.72-11.77q0-6.17 4.72-11.04 4.72-4.87 11.86-4.87h66.5v-67.22q0-5.85 4.76-10.85 4.76-5.01 11.77-5.01 6.67 0 11.29 5.01 4.61 5 4.61 10.85v67.22h67.22q6.37 0 11.11 5.04 4.75 5.05 4.75 10.96 0 7.21-4.75 11.82-4.74 4.62-11.11 4.62h-67.22v66.5q0 7.14-4.78 11.86-4.79 4.71-11.22 4.71-7.2 0-11.82-4.71-4.61-4.72-4.61-11.86v-66.5ZM480.19-285.33l-157.64 67.7q-29.4 12-54.85-4.51-25.44-16.52-25.44-48.18v-471.89q0-23.17 16.93-40.11 16.94-16.94 40.12-16.94h223.88q11.5 0 18.35 11.12 6.85 11.12 1.49 23.5-7.06 14.91-10.15 31.2-3.08 16.28-3.08 33.12 0 67.85 44.83 116.62 44.84 48.78 110.51 54.38 1.46.53 3.09.53 1.62.01 2.93.01 10.66.77 18.62 8.32 7.96 7.56 7.96 18.49v231.65q0 31.66-25.44 48.18-25.45 16.51-54.13 4.51l-157.98-67.7Z"/>
        </svg>`;
        const saved = `
        <svg class="icon-btn-img hov-i" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
            <path d="m438-482.78-45.51-45.02q-4.37-4.41-11.38-4.52-7.01-.12-11.38 4.26-5.09 5.12-5.09 12.11 0 6.99 5.09 11.36l47.38 47.77q8.16 8.22 20.39 8.22t20.45-8.24l133.04-132.94q4.37-4.4 4.56-11.14.19-6.73-4.56-12.14-5.03-4.38-11.96-4.38-6.93 0-11.27 4.31L438-482.78Zm42.17 197.45-157.62 67.7q-29.4 12-54.85-4.86-25.44-16.87-25.44-47.83v-471.89q0-23.25 16.64-40.15t40.41-16.9h361.38q23.77 0 40.41 16.9 16.64 16.9 16.64 40.15v471.89q0 30.96-25.44 47.83-25.45 16.86-54.13 4.86l-158-67.7Z"/>
        </svg>`;
        
        return `
            <div class="save-toggle-container-pivot">
                <div class="save-toggle-container">
                    <button class="icon-btn hov-s6i hov-si blank-btn" id="book-save-toggle">
                            ${BookInfoComponent.isBookSaved? saved : notSaved}
                    </button>
                </div>
            </div>
        `;
    }

    static coverSection(bookInfo) {
        return `
            <div class="cover-container">
                <img class="book-cover" 
                src="${bookInfo.full_json.volumeInfo.imageLinks?.thumbnail || '/img/placeholder.png'}" 
                alt="${bookInfo.title}" />
                <div class="gradient"></div>
                <div class="title-container">
                    <div class="title">
                        <h3>${bookInfo.title}</h3>
                    </div>
                </div>  
            </div>`;
    }

    static descContainer(label, value, additionalClass = "") {
        return `
            <div class="desc-container">
                <p class="left"><strong>${label}</strong></p>
                <p class="right ${additionalClass}">${value}</p>
            </div>`;
    }
}
