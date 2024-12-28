import { Component } from "../Package.js";

export default class MiniSearchComponent extends Component {
    wrapperClassList = "window";

    render() {
        this.inner = `
            <div class="inner-component" id="minisearch">
                <h2 class="dark-text">Explore Books</h2>
                <form method="GET" action="/search">
                    <div class="explore">
                        <input type="text" name="query" placeholder="Search books">
                        <select name="sortBy">
                            <option value="intitle" selected >By title</option>
                            <option value="inauthor" >By author</option>
                            <option value="inpublisher" >By publisher</option>
                        </select>
                        <button type="submit">Search</button>
                    </div>
                </form>
            </div>`;
            return this.inner;
        }

    onMount() {
        console.log(`Mounted: MiniSearch`);
    }

    onUnmount() {
        console.log(`Unmounted: MiniSearch`);
    }
}