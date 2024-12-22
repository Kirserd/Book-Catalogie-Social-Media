import { setTheme } from './theme.js';

const container = document.querySelector(".container");

var currentState = 'Loading';
let cleanupFunctions = [];

export async function setState(state) {
    if (cleanupFunctions.length > 0) {
        await Promise.all(
            cleanupFunctions.map(
                async cleanup => await cleanup()
            )
        ); 
        cleanupFunctions = [];
    }

    let valid = true;
    switch (state) {
        case 'Dashboard':
            showDashboard();
            stateDashboard();
            break;
        case 'Settings':
            showSettings();
            stateSettings();
            break;
        default:
            valid = false;
            break;
    }

    if (valid) { 
        let newSection = document.getElementById('main-management-new');
        if(currentState !== 'Loading') {
            newSection.classList.add('prio');
        }
    
        cleanupFunctions.push(async () => {
            const toClean = document.getElementById('main-management');
            toClean.classList.remove('window-anim');
            toClean.classList.add('hide-socials-anim');
            
            await new Promise(resolve => setTimeout(resolve, 450));
    
            toClean.remove();
        });
    
        newSection.id = 'main-management';
        currentState = state;
    }
}

function showDashboard() {
    const booksDataContainer = document.getElementById('books-data');

    const books = JSON.parse(booksDataContainer.getAttribute('data-books') || '[]');

    if (books.length > 0) {
        const bookListHTML = books.map(book => `
            <a class="book inner-window" href="/book/${book.id}">
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
            </a>
        `).join('');

        container.insertAdjacentHTML('beforeend', `
            <div class="window window-anim recent-activity" style="grid-area: c;" id="main-management-new">
                <div class="gradient"></div>
                <h2 class="dark-text">My Books</h2>
                <div class="book-list recent-books">
                    ${bookListHTML}
                </div>
            </div>
        `);
    } else {
        container.insertAdjacentHTML('beforeend', `
            <div class="window window-anim recent-activity" style="grid-area: c;" id="main-management-new">
                <div class="gradient"></div>
                <h2 class="dark-text">My Books</h2>
                <p>No books saved yet. Start adding some books!</p>
            </div>
        `);
    }
}
function showSettings() {
    container.insertAdjacentHTML('beforeend', ` 
        <div class="window window-anim settings-container" style="grid-area: c;" id="main-management-new">
            <h2 class="dark-text">Settings</h2>

            <div class="settings-pack inner-window">
                <h3>Theme</h3>
                <div class="settings-entries">
                    <div class="settings-entry">
                        <div class="left">
                            <p>Reset theme</p>
                        </div>
                        <div class="right">
                            <button class="icon-btn hov-s6i hov-si profile-btn inner-window" id="reset-theme-btn">
                                <svg class="icon-btn-img hov-i" xmlns="http://www.w3.org/2000/svg" viewBox="-1.5 -1.5 19 19">
                                    <path fill-rule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2z"/>
                                    <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="settings-entry-subs">
                        <p>Colors</p>
                        <div class="settings-entry sub">
                            <div class="left">
                                <label for="primary-color" id="primary-color-label"><p>Primary</p></label>
                            </div>
                            <div class="right">
                                <input type="color" class="input-color" id="primary-color" name="primary-color" value="#070707" />
                            </div>
                        </div>
                        <div class="settings-entry sub">
                            <div class="left">
                                <label for="secondary-color" id="secondary-color-label"><p>Secondary</p></label>
                            </div>
                            <div class="right">
                                <input type="color" class="input-color" id="secondary-color" name="secondary-color" value="#8b8b8b" />
                            </div>
                        </div>
                        <div class="settings-entry sub">
                            <div class="left">
                                <label for="accent-color" id="accent-color-label"><p>Accent</p></label>
                            </div>
                            <div class="right">
                                <input type="color" class="input-color" id="accent-color" name="accent-color" value="#916d4c"/>
                            </div>
                        </div>
                    </div>
                    <div class="settings-entry-subs">
                        <p>Other</p>
                        <div class="settings-entry sub">
                            <div class="left">
                                <p>Contrast</p>
                            </div>
                            <div class="right">
                                <input class="slider" type="range" min="1" max="100" value="20" id="contrast-range" />
                            </div>
                        </div>
                        <div class="settings-entry sub">
                            <div class="left">
                                <p>More Accents</p>
                            </div>
                            <div class="right">
                                <input class="toggle" type="range" min="0" max="1" value="0" id="more-accents" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    `);
}

// GLOBAL VARIABLES -------------------------------------------------------------------------------------

let currentTheme = { // >> FALLBACK VANILLA DARK
    c1: '#070707', 
    c2: '#8b8b8b',
    a: '#916d4c',
    contrast: 20,
    moreAccents: 0 
} 

const settingsButton = document.getElementById('settings-btn');
const homeButton = document.getElementById('home-btn');

// GLOBAL FUNCTIONS -------------------------------------------------------------------------------------

// GLOBAL EVENTS -------------------------------------------------------------------------------------

homeButton.addEventListener('click', onHomeButtonClick);
settingsButton.addEventListener('click', onSettingsButtonClick);

function onHomeButtonClick() {
    if (currentState === 'Dashboard') return;
    setState('Dashboard');
}
function onSettingsButtonClick() {
    if (currentState === 'Settings') return;
    setState('Settings');
}

//================================================================================================
// STATE DASHBOARD
//================================================================================================

function stateDashboard() {

    // VARIABLES -------------------------------------------------------------------------------------

    // FUNCTIONS -------------------------------------------------------------------------------------

    function createGenreBubbles() {
        document.querySelectorAll(".desc-container .right.genre").forEach((genreElement) => {
            const genresText = genreElement.textContent.trim(); 
            const genresArray = genresText.split(","); 
            
            const uniqueGenres = new Set();
    
            genresArray.forEach((genre) => {
                const shortGenre = genre.split("/")[0].trim(); 
                uniqueGenres.add(shortGenre); 
            });
    
            genreElement.textContent = "";
    
            const wrapper = document.createElement("div");
            wrapper.classList.add("genre-wrapper");
            genreElement.appendChild(wrapper);
    
            const maxWrapperHeight = parseFloat(
                getComputedStyle(wrapper).getPropertyValue("max-height")
            );
    
            let totalHeight = 0;
            let isTruncated = false;
    
            Array.from(uniqueGenres).forEach((shortGenre) => {
                if (isTruncated) return; 
    
                const bubble = document.createElement("p");
                bubble.classList.add("genre-bubble");
                bubble.textContent = shortGenre;
                wrapper.appendChild(bubble); 
    
                const currentHeight = wrapper.scrollHeight;
    
                if (currentHeight > maxWrapperHeight) {
                    wrapper.removeChild(bubble);
                    const ellipsisBubble = document.createElement("p");
                    ellipsisBubble.classList.add("genre-bubble", "ellipsis-bubble");
                    ellipsisBubble.textContent = "...";
                    wrapper.appendChild(ellipsisBubble);
                    isTruncated = true;
                }
            });
        });
    }
    function truncateEmail(email) {
        if (email) {
            return email.split('@')[0]; 
        }
        return '';
    }
    function truncateEmails(){
        const emailElement = document.querySelector('.accent-text');
        const fullEmail = emailElement?.textContent.trim(); 
        if (fullEmail) {
            emailElement.textContent = truncateEmail(fullEmail); 
        }
    }

    function onStart() {
        truncateEmails();
        createGenreBubbles();
    };

    // EVENTS -------------------------------------------------------------------------------------

    onStart();
}

//================================================================================================
// STATE SETTINGS
//================================================================================================

function stateSettings() {
    
    // VARIABLES -------------------------------------------------------------------------------------  
    
    const c1 = document.querySelector("#primary-color");
    const c2 = document.querySelector("#secondary-color");
    const a = document.querySelector("#accent-color");
    const contrast = document.querySelector("#contrast-range");
    const moreAccents = document.querySelector("#more-accents");

    // FUNCTIONS -------------------------------------------------------------------------------------

    function updateTheme() {
        setTheme(c1.value, c2.value, a.value, contrast.value, moreAccents.value);
    }

    function onStart(){
        
        c1.value = currentTheme.c1;
        c2.value = currentTheme.c2;
        a.value = currentTheme.a;
        contrast.value = currentTheme.contrast;
        moreAccents.value = currentTheme.moreAccents;

        c1.addEventListener("input", updateTheme, false);
        c2.addEventListener("input", updateTheme, false);
        a.addEventListener("input", updateTheme, false);
        contrast.addEventListener("input", updateTheme, false);
        moreAccents.addEventListener("input", updateTheme, false);
    }

    // EVENTS -------------------------------------------------------------------------------------

    onStart();
}

//================================================================================================
// EXPORT FUNCTIONS
//================================================================================================


    setState('Dashboard');
