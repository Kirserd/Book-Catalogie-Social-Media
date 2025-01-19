import { Component } from "../Package.js";

export default class BookDescComponent extends Component {
    render() {
        this.inner = `
        <div class="inner-component" id="book-desc-section">
            <h2 class="dark-text"><strong>Description</strong></h2> 
        </div>`;
        return this.inner;
    }

    updateRender() {
        this.wrapper.classList = this.wrapperClassList;
        
        this.wrapper.innerHTML = `
        <div class="inner-component" id="book-desc-section">
            <div class="gradient"></div>
            <h2 class="dark-text"><strong>Description</strong></h2> 
            <div class="description">
                <p>${this.bookInfo.full_json.volumeInfo.description || "Sorry, no description available for this book."}</p>
            </div>
        </div>`;
    }

    onMount() {
        super.onMount();
        this._fetchBookInfo();
        console.log(`Mounted: BookDescComponent`);
    }

    onUnmount() {
        super.onUnmount();
        console.log(`Unmounted: BookDescComponent`);
    }

    async _fetchBookInfo() {
        const res = await fetch(`/books/${this.orchestrator.getData("selectedBookID")}`);
        this.bookInfo = (await res.json()).book;

        this.updateRender();
    }

}