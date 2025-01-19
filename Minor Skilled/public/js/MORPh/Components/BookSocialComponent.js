import { Component , NotesComponent} from "../Package.js";

export default class BookSocialComponent extends Component {
    wrapperClassList = "window";

    userID;
    notes = [];

    render() {
        const userDataContainer = document.getElementById('user-data');
        const userData = JSON.parse(userDataContainer.getAttribute('data-user') || '{}');
    
        this.userID = userData.user_id;

        this.inner = `
        <div class="inner-component" id="book-social">
            <div class="social-window">
                ${BookSocialComponent.ratingsSection(4.5)}
            </div>
        </div>`;

        return this.inner;
    }

    async updateRender() {
        await this._fetchAllNotes();
        this.inner = `
        <div class="inner-component" id="book-social">
            <div class="social-window">
                ${BookSocialComponent.ratingsSection(4.5)}
                ${BookSocialComponent.contentSection(this.notes)}
            </div>
        </div>`;

        this.wrapper.innerHTML = this.inner;
    }

    onMount() {
        super.onMount();
        console.log(`Mounted: BookSocialComponent`);

        this.updateRender();
    }

    onUnmount() {
        super.onUnmount();
        console.log(`Unmounted: BookSocialComponent`);
    }

    async _fetchAllNotes() {
        const res = await fetch(`/books/${this.orchestrator.getData("selectedBookID")}/notes`);
        this.notes = await res.json();
    }

    static ratingsSection(rating){
        return `           
            <div class="ratings-section">                    
                <div class="ratings-header">
                    <div class="ratings-title">Ratings</div>
                    <br/>
                        ${BookSocialComponent.avgRating(4.5)}
                </div>
                <hr/>
                <div class="rating-bars">
                    ${BookSocialComponent.bar(5)}
                    ${BookSocialComponent.bar(4)}
                    ${BookSocialComponent.bar(3)}
                    ${BookSocialComponent.bar(2)}
                    ${BookSocialComponent.bar(1)}
                </div>
            </div>`;
    }

    static bar(label){
        return `
            <div class="bar">
                <span class="label"><p>${label}</p></span>
                <div class="progress"></div>
            </div>`;
    }

    static avgRating(rating){
        return `                        
            <div class="average-rating">
                <span class="rating">${rating}</span>
                <span class="avg-text">AVG</span>
            </div>`;
    }

    static contentSection(notes){
        return `
            <div class="content-section">
                <ul class="notes-container">
                    ${BookSocialComponent.allNotes(notes)}
                </ul>
            </div>`;
    }

    static allNotes(response) {
        const notes = response.success && Array.isArray(response.notes) ? response.notes : [];
        let allNotes = notes.length > 0
            ? notes.map(BookSocialComponent.noteSection).join("") 
            : `<p>No notes yet. Be first! <3</p>`;

        return allNotes;
    }

    static noteSection(note) {
        return `
            <li class="global-note">
                <div class="note-left note-container">
                    <div class="note-author">
                        <p class="accent-text"><span>${note.author}</span></p>
                    </div>    
                    <div class="note-text window">
                        <p>${note.content}</p>
                    </div>
                </div>
                <div class="note-right">
                    <div class="note-date">
                        ${note.published}
                    </div>
                </div>
            </li>`;
    }
}