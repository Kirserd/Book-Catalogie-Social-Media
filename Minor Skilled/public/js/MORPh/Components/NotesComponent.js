import { Component } from "../Package.js";

export default class NotesComponent extends Component {
    wrapperClassList = "window";

    userID;
    notes = [];

    render() {
        const userDataContainer = document.getElementById('user-data');
        const userData = JSON.parse(userDataContainer.getAttribute('data-user') || '{}');
    
        this.userID = userData.user_id;

        this.inner = `
        <div class="inner-component" id="book-notes">
            <h2 class="dark-text">Notes</h2>
        </div>`;

        return this.inner;
    }

    async updateRender() {
        await this._fetchUserNotes();
        this.wrapper.innerHTML = `
            <div class="inner-component" id="notes-section">
                <div class="gradient"></div>
                <h2 class="dark-text">Notes</h2>
                <ul class="notes-container">
                    ${NotesComponent.allNotes(this.notes)}
                </ul>
            </div>`;

        this._unsubscribeEvents(); 
        this._subscribeEvents(); 
    }

    async onMount() {
        super.onMount();
        await this.updateRender();
        console.log(`Mounted: NotesComponent`);
    }

    onUnmount() {
        this._unsubscribeEvents();
        super.onUnmount();
        console.log(`Unmounted: NotesComponent`);
    }

    _subscribeEvents() {
        document.getElementById("add-note-btn")?.addEventListener("click", this._handleAddNoteClick.bind(this));
        document.getElementById("close-add-form")?.addEventListener("click", this._handleCloseAddFormClick.bind(this));
        document.getElementById("save-add-form")?.addEventListener("click", this._handleSaveAddFormClick.bind(this));

        document.querySelectorAll(".edit-btn").forEach(button =>
            button.addEventListener("click", this._handleEditButtonClick.bind(this))
        );

        document.querySelectorAll(".save-btn").forEach(button =>
            button.addEventListener("click", this._handleSaveEditClick.bind(this))
        );

        document.querySelectorAll(".close-btn").forEach(button =>
            button.addEventListener("click", this._handleCloseEditClick.bind(this))
        );

        document.querySelectorAll(".note-delete-btn").forEach(button =>
            button.addEventListener("click", this._handleDeleteNoteClick.bind(this))
        );
        document.querySelectorAll("textarea").forEach((textarea) => {
            textarea.addEventListener("input", () => this._adjustTextareaHeight(textarea));
        });
    }

    _unsubscribeEvents() {
        document.getElementById("add-note-btn")?.removeEventListener("click", this._handleAddNoteClick);
        document.getElementById("close-add-form")?.removeEventListener("click", this._handleCloseAddFormClick);
        document.getElementById("save-add-form")?.removeEventListener("click", this._handleSaveAddFormClick);

        document.querySelectorAll(".edit-btn").forEach(button =>
            button.removeEventListener("click", this._handleEditButtonClick)
        );

        document.querySelectorAll(".save-btn").forEach(button =>
            button.removeEventListener("click", this._handleSaveEditClick)
        );

        document.querySelectorAll(".close-btn").forEach(button =>
            button.removeEventListener("click", this._handleCloseEditClick)
        );

        document.querySelectorAll(".note-delete-btn").forEach(button =>
            button.removeEventListener("click", this._handleDeleteNoteClick)
        );
        document.querySelectorAll("textarea").forEach((textarea) => {
            textarea.removeEventListener("input", () => this._adjustTextareaHeight(textarea));
        });
    }

    async _fetchUserNotes() {
        const res = await fetch(`/books/${this.orchestrator.getData("selectedBookID")}/${this.userID}/notes`);
        this.notes = await res.json();
    }

    _handleAddNoteClick() {
        document.querySelector(".add-form").classList.remove("hidden");
        document.getElementById("add-note-btn").classList.add("hidden");
    }

    _handleCloseAddFormClick() {
        document.querySelector(".add-form").classList.add("hidden");
        document.getElementById("add-note-btn").classList.remove("hidden");
    }

    async _handleSaveAddFormClick() {
        const textarea = document.querySelector(".add-form textarea");
        const rawContent = textarea.value;
        const content = rawContent.replace(/\n/g, "<br>");
        if (content) {
            await fetch(`/books/${this.orchestrator.getData("selectedBookID")}/notes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });
            await this.updateRender();
        }
    }

    _handleEditButtonClick(event) {
        const index = event.target.dataset.index;
        const noteForm = document.querySelectorAll(".edit-form")[index];
        const noteText = document.querySelectorAll(".note-text")[index];
        const textarea = document.querySelectorAll("textarea")[index];
        noteForm.classList.remove("hidden");
        noteText.classList.add("hidden");
        this._adjustTextareaHeight(textarea);
    }

    async _handleSaveEditClick(event) {
        const noteId = event.target.dataset.noteId;
        const textarea = document.querySelector(`textarea[data-note-id="${noteId}"]`);
        const rawContent = textarea.value;
        const content = rawContent.replace(/\n/g, "<br>");
        if (content) {
            await fetch(`/books/${this.orchestrator.getData("selectedBookID")}/notes/${noteId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });
            await this.updateRender();
        }
    }

    _handleCloseEditClick(event) {
        const noteForm = event.target.closest(".edit-form");
        const noteText = noteForm.nextElementSibling;
        noteForm.classList.add("hidden");
        noteText.classList.remove("hidden");
    }

    async _handleDeleteNoteClick(event) {
        const noteId = event.target.dataset.noteId;
        await fetch(`/books/${this.orchestrator.getData("selectedBookID")}/notes/${noteId}`, {
            method: "DELETE",
        });
        await this.updateRender();
    }

    _adjustTextareaHeight(textarea) {
        textarea.style.height = "auto"; 
        textarea.style.height = `${textarea.scrollHeight}px`;
    }

    static allNotes(response) {
        const notes = response.success && Array.isArray(response.notes) ? response.notes : [];
        let allNotes = notes.length > 0
            ? notes.map(NotesComponent.noteSection).join("") 
            : `<p>No notes yet. Add one below!</p>`;

        allNotes += NotesComponent.addNoteSection(); 
        return allNotes;
    }

    static noteSection(note, index) {
        const contentForTextarea = note.content.replace(/<br>/g, "\n");
        return `
            <li class="note-container">
                <div class="edit-container" data-note-id="${note.note_id}">
                    ${NotesComponent.iconButton('edit-btn',`data-index="${index}"`,``,`<path data-index="${index}" d="M158.95-118.67q-17.13 0-28.71-11.57-11.57-11.58-11.57-28.71v-65.66q0-15.74 6.41-30.85 6.41-15.1 17.69-26.13L689.16-829q6.84-5.83 15.11-8.88 8.27-3.04 17.73-3.04 8.39 0 15.81 2.32t15.04 8.47l76.89 76.77q6.57 7.36 9.08 15.44 2.51 8.08 2.51 16.49 0 9.1-3.04 17.41-3.05 8.3-8.88 14.48L281.59-142.77q-11.03 11.28-26.13 17.69-15.11 6.41-30.85 6.41h-65.66Zm555.97-552.18 50.41-50.69-43.12-43.05-50.95 50.08 43.66 43.66Z"/>`)}
                    ${NotesComponent.iconButton('note-delete-btn',`data-note-id="${note.note_id}"`,``,`<path data-note-id="${note.note_id}" d="M233.33-446.67q-14.16 0-23.75-9.61-9.58-9.62-9.58-23.84 0-14.21 9.58-23.71 9.59-9.5 23.75-9.5h493.34q14.16 0 23.75 9.61 9.58 9.62 9.58 23.84 0 14.21-9.58 23.71-9.59 9.5-23.75 9.5H233.33Z"/>`)}
                </div>
                <form class="hidden edit-form">
                    <textarea name="note" data-note-id="${note.note_id}">${contentForTextarea}</textarea>
                    <div class="second-edit-container">
                        ${NotesComponent.iconButton('save-btn',`data-note-id="${note.note_id}"`,``,`<path data-note-id="${note.note_id}" d="m379.33-339.33 355-355q10.19-10 23.76-10 13.58 0 23.58 10.03 10 10.04 10 23.83 0 13.8-10 23.8l-379 379.34q-10 10-23.34 10-13.33 0-23.33-10L177.33-446q-10-10.04-9.5-23.86.5-13.81 10.54-23.81 10.03-10 23.83-10 13.8 0 23.8 10l153.33 154.34Z"/>`)}
                        ${NotesComponent.iconButton('close-btn',``,``,'<path d="M480-433.33 274.67-228q-9.67 9.67-23.34 9.67-13.66 0-23.33-9.67-9.67-9.67-9.67-23.33 0-13.67 9.67-23.34L433.33-480 228-685.33q-9.67-9.67-9.67-23.34 0-13.66 9.67-23.33 9.67-9.67 23.33-9.67 13.67 0 23.34 9.67L480-526.67 685.33-732q9.67-9.67 23.34-9.67 13.66 0 23.33 9.67 9.67 9.67 9.67 23.33 0 13.67-9.67 23.34L526.67-480 732-274.67q9.67 9.67 9.67 23.34 0 13.66-9.67 23.33-9.67 9.67-23.33 9.67-13.67 0-23.34-9.67L480-433.33Z"/>')}
                    </div>
                </form>
                <div class="note-text window" data-index="${index}">
                    <p>${note.content}</p>
                </div>
            </li>`;
    }

    static iconButton(classes="", datas="", id="", path="") {
        return `
        <button type="button" class="${classes} icon-btn hov-s6i hov-si" ${id!==""? `id="${id}"` : ''} ${datas}>
            <svg class="icon-btn-img hov-i" ${datas} xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                ${path}
            </svg>
        </button>`;
    }

    static addNoteSection() {
        return `
            <div class="add-container">
                ${NotesComponent.iconButton('',``,`add-note-btn`,'<path d="M446.67-446.67H233.33q-14.16 0-23.75-9.61-9.58-9.62-9.58-23.84 0-14.21 9.58-23.71 9.59-9.5 23.75-9.5h213.34v-213.34q0-14.16 9.61-23.75 9.62-9.58 23.84-9.58 14.21 0 23.71 9.58 9.5 9.59 9.5 23.75v213.34h213.34q14.16 0 23.75 9.61 9.58 9.62 9.58 23.84 0 14.21-9.58 23.71-9.59 9.5-23.75 9.5H513.33v213.34q0 14.16-9.61 23.75-9.62 9.58-23.84 9.58-14.21 0-23.71-9.58-9.5-9.59-9.5-23.75v-213.34Z"/>')}
                <form class="hidden add-form">
                    <textarea name="note" placeholder="Add a note..."></textarea>
                    <div class="second-edit-container">
                    ${NotesComponent.iconButton('',``,`save-add-form`,'<path d="m379.33-339.33 355-355q10.19-10 23.76-10 13.58 0 23.58 10.03 10 10.04 10 23.83 0 13.8-10 23.8l-379 379.34q-10 10-23.34 10-13.33 0-23.33-10L177.33-446q-10-10.04-9.5-23.86.5-13.81 10.54-23.81 10.03-10 23.83-10 13.8 0 23.8 10l153.33 154.34Z"/>')}
                    ${NotesComponent.iconButton('',``,`close-add-form`,'<path d="M480-433.33 274.67-228q-9.67 9.67-23.34 9.67-13.66 0-23.33-9.67-9.67-9.67-9.67-23.33 0-13.67 9.67-23.34L433.33-480 228-685.33q-9.67-9.67-9.67-23.34 0-13.66 9.67-23.33 9.67-9.67 23.33-9.67 13.67 0 23.34 9.67L480-526.67 685.33-732q9.67-9.67 23.34-9.67 13.66 0 23.33 9.67 9.67 9.67 9.67 23.33 0 13.67-9.67 23.34L526.67-480 732-274.67q9.67 9.67 9.67 23.34 0 13.66-9.67 23.33-9.67 9.67-23.33 9.67-13.67 0-23.34-9.67L480-433.33Z"/>')}

                    </div>
                </form>
            </div>`;
    }
    
}