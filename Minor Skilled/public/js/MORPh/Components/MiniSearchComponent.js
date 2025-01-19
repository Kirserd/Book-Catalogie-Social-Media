import { Component, ExploreComponent } from "../Package.js";

export default class MiniSearchComponent extends Component {
    wrapperClassList = "window";

    render() {
        this.inner = `
            <div class="inner-component" id="minisearch">
                <h2 class="dark-text">Explore Books</h2>
                <div class="explore">
                    <input type="text" id="query" placeholder="Search books">
                    <select id="sortBy">
                        <option value="title" selected>By title</option>
                        <option value="author">By author</option>
                        <option value="publisher">By publisher</option>
                    </select>
                    <button id="searchButton" type="button">Search</button>
                </div>
                <div id="results"></div>
            </div>`;
        return this.inner;
    }

    onMount() {
        this._subscribeEvents();
        console.log(`Mounted: MiniSearch`);
    }

    onUnmount() {
        this._unsubscribeEvents();
        console.log(`Unmounted: MiniSearch`);
    }

    _subscribeEvents() {
        const searchButton = document.getElementById("searchButton");
        searchButton.addEventListener("click", this._handleSearch.bind(this));
    }

    _unsubscribeEvents() {
        const searchButton = document.getElementById("searchButton");
        searchButton.removeEventListener("click", this._handleSearch.bind(this));
    }

    async _handleSearch() {
        const query = document.getElementById("query").value;
        const sortBy = document.getElementById("sortBy").value;

        try {
            const response = await fetch(`/books?query=${encodeURIComponent(query)}&sortBy=${encodeURIComponent(sortBy)}`);
            if (!response.ok) {
                throw new Error("Failed to fetch books");
            }
            const books = await response.json();
            this._displayResults(books);
        } catch (error) {
            console.error("Error fetching books:", error);
            this._displayResults([]);
        }
    }

    _displayResults(books){
        this.orchestrator.setData('searchResults', books);
        this.orchestrator.addComponent('c', new ExploreComponent({}), (this.orchestrator.components['c'].instance instanceof ExploreComponent));
    }
}