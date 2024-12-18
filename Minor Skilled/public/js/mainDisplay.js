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
            <p>settings will be hier :3</p>
        </div>
    `);
}

// GLOBAL VARIABLES -------------------------------------------------------------------------------------

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

    function onStart() {
    
    };


    // EVENTS -------------------------------------------------------------------------------------

    onStart();
}

//================================================================================================
// STATE SETTINGS
//================================================================================================

function stateSettings() {
    
    // VARIABLES -------------------------------------------------------------------------------------  

    // FUNCTIONS -------------------------------------------------------------------------------------

    function onStart(){
        
    }

    // EVENTS -------------------------------------------------------------------------------------

    onStart();
}

//================================================================================================
// INIT
//================================================================================================

setState('Dashboard');