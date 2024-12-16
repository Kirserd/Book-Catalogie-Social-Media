// Select Socials
const container = document.querySelector(".container");

// Social States
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
        case 'Overview':
            showOverview();
            stateOverview();
            break;
        case 'Messenger':
            showMessenger();
            stateMessenger();
            break;
        default:
            valid = false;
            break;
    }

    if (valid) { 
        let newSection = document.getElementById('friend-management-new');
        if(currentState !== 'Loading') {
            newSection.classList.add('prio');
        }
    
        cleanupFunctions.push(async () => {
            const toClean = document.getElementById('friend-management');
            toClean.classList.remove('window-anim');
            toClean.classList.add('hide-socials-anim');
            
            await new Promise(resolve => setTimeout(resolve, 450));
    
            toClean.remove();
        });
    
        newSection.id = 'friend-management';
        currentState = state;
    }
}

function showOverview() {
    container.insertAdjacentHTML('beforeend', 
    `<div class="window window-anim" style="grid-area: d;" id="friend-management-new">
        <h2 class="dark-text">Social</h2>
        <hr/>
        <div class="socials-container area-friends">
            <div class="socials-search window">
                <div id="socials-search-btn" class="socials-btn search-bar">
                    <input id="friend-search" type="text" placeholder="Search people..." />
                    <img src="/assets/imgs/search-icon.png" />
                </div>   
                <div class="hidden">  
                    <!-- Search Results -->
                    <div class="search-results" id="search-results">
                        <p class="dark-text">Search for users to add as
                            friends or manage requests.</p>
                    </div>
                </div>
            </div>
            <div class="socials-requests window">
                <button id="socials-requests-btn" class="socials-btn">
                    <img src="/assets/imgs/requests-icon.png" />
                    <p><strong> Requests </strong>(<span id="request-count">0</span>)</p>
                </button>
                <div class="hidden">
                    <!-- Friend Requests Notification -->
                    <div class="friend-requests">
                        <div id="request-list">
                            <!-- Dynamic list of incoming friend requests -->
                        </div>
                    </div>
                </div>
            </div>
            <div class="socials-friends expanded window">
                <button id="socials-friends-btn" class="socials-btn">
                    <p><strong>Friend List</strong></p>
                </button>
                <div>
                    <div class="friends">
                </div>
            </div>
        </div>
    </div>`);
}

function showMessenger() {
    container.insertAdjacentHTML('beforeend', 
        `<div class="msngr window window-anim" style="grid-area: d;" id="friend-management-new">
            <div class="messenger-header">
                <img id="to-overview-btn" class="icon-btn" src="/assets/imgs/back-icon.png">
                <h2 class="dark-text">Messenger</h2>
            </div>
            <hr/>
            <div class="messenger-viewport">
                <div id="messages"></div>
                <div class="lower-deck">
                    <hr/>
                    <div class="input-deck">
                        <input id="message-input" type="text" placeholder="Write message..." />
                        <button id="send-button">Send</button>
                    </div>
                </div>
            </div>
        </div>`);
}

// GLOBAL VARIABLES -------------------------------------------------------------------------------------

let messages;
let messages_id;

// GLOBAL FUNCTIONS -------------------------------------------------------------------------------------

function truncateEmail(email) {
    if (email) {
        return email.split('@')[0]; 
    }
    return '';
}

function convertTimestamp(isoTimestamp) {

    const date = new Date(isoTimestamp);
    return `${date.toLocaleTimeString()}`;
}

//================================================================================================
// STATE OVERVIEW
//================================================================================================

function stateOverview() {

    // VARIABLES -------------------------------------------------------------------------------------
    
    const searchButton = document.getElementById('socials-search-btn');
    const requestsButton = document.getElementById('socials-requests-btn');
    const friendsButton = document.getElementById('socials-friends-btn');

    const socialsContainer = document.querySelector('.socials-container');
    const socialsSearch = document.querySelector('.socials-search > .hidden');
    const socialsRequests = document.querySelector('.socials-requests > .hidden');
    const socialsFriends = document.querySelector('.socials-friends > div');

    const searchInput = document.getElementById("friend-search");
    const searchResults = document.getElementById("search-results");
    const requestList = document.getElementById("request-list");
    const requestCount = document.getElementById("request-count");
    const friendsContainer = document.querySelector(".friends");

    let previousFriends = [];
    let previousRequests = [];

    // FUNCTIONS -------------------------------------------------------------------------------------

    function showSection(newAreaClass) {
        if(currentState !== 'Overview')
            return;

        // Hide all sections when switching to 'area-friends'
        if (newAreaClass === 'area-friends') {
            socialsSearch.classList.add('hidden');
            socialsRequests.classList.add('hidden');
        } else {
            // Hide only the 'area-friends' section when switching to other areas
            socialsFriends.classList.add('hidden');
        }

        // Remove old area class
        socialsContainer.classList.remove('area-friends', 'area-search', 'area-requests');

        if (newAreaClass === 'area-friends') {
            socialsFriends.classList.remove('hidden');
        }
        else{
            socialsSearch.classList.remove('hidden');
            socialsRequests.classList.remove('hidden');
        }
        socialsContainer.classList.add(newAreaClass);

        if (newAreaClass === 'area-requests') {
            truncateFriendEntries();
            resetRequestEntries();
        } else {
            resetFriendEntries();
            truncateRequestEntries();
        }
    }

    function truncateFriendEntries() {
        if(currentState !== 'Overview')
            return;

        let friendEntries = document.querySelectorAll('.friend-entry span');
        friendEntries.forEach(entry => {
            if(entry.textContent !== '...'){
                entry.dataset.fullText = entry.textContent; // Store the full text in a dataset
                entry.textContent = '...'; // Display "..."
            }
        });
    }
    function resetFriendEntries() {
        if(currentState !== 'Overview')
            return;

        let friendEntries = document.querySelectorAll('.friend-entry span');
        friendEntries.forEach(entry => {
            if (entry.dataset.fullText) {
                entry.textContent = entry.dataset.fullText; // Restore the full text
            }
        })
    };

    function truncateRequestEntries() {
        if(currentState !== 'Overview')
            return;

        let friendEntries = document.querySelectorAll('.request-entry span');
        friendEntries.forEach(entry => {
            if(entry.textContent !== '...'){
                entry.dataset.fullText = entry.textContent; // Store the full text in a dataset
                entry.textContent = '...'; // Display "..."
            }
        });
    }
    function resetRequestEntries() {
        if(currentState !== 'Overview')
            return;

        let friendEntries = document.querySelectorAll('.request-entry span');
        friendEntries.forEach(entry => {
            if (entry.dataset.fullText) {
                entry.textContent = entry.dataset.fullText; // Restore the full text
            }
        })
    };

    async function fetchFriends() {
        const res = await fetch("/friends/getFriendList");
        const friends = await res.json();

        if (JSON.stringify(friends) !== JSON.stringify(previousFriends)) {
            previousFriends = friends;
            if (friends.length > 0) {
                friendsContainer.innerHTML = friends.map(friend => `
                    <div class="friend-entry">
                        <span>${truncateEmail(friend.email)}</span>
                        <div class="decision-btns">
                            <button class="socials-entry-btn messenger-btn" data-id="${friend.id}">
                                <img class="socials-entry-img" src="/assets/imgs/messenger-icon.png" />
                            </button>
                            <button class="socials-entry-btn friend-btn" data-id="${friend.id}" data-status="friend">
                                <img class="socials-entry-img" src="/assets/imgs/remove-friend-icon.png" />
                            </button>
                        </div>
                    </div>
                `).join("");
            } else {
                friendsContainer.innerHTML = `<p class="dark-text">No friends found.</p>`;
            }
        }
    }
    async function fetchRequests() {
        const res = await fetch("/friends/getFriendRequests");
        const requests = await res.json();
    
        if (JSON.stringify(requests) !== JSON.stringify(previousRequests)) {
            previousRequests = requests; 
            requestCount.textContent = requests.length;
            if (requests.length > 0) {
                requestList.innerHTML = requests.map(request => `
                    <div class="request-entry">
                        <span>${truncateEmail(request.email)}</span>
                        <div class="decision-btns">
                            <button class="accept-btn socials-entry-btn" data-id="${request.id}">
                                <img class="socials-entry-img" src="/assets/imgs/add-friend-icon.png" />
                            </button>
                            <button class="decline-btn socials-entry-btn" data-id="${request.id}">
                                <img class="socials-entry-img" src="/assets/imgs/remove-friend-icon.png" />
                            </button>
                        </div>
                    </div>
                `).join("");
            } else {
                requestList.innerHTML = `<p class="dark-text">No new requests.</p>`;
            }
        }
    }

    function onStart() {
    
        setInterval(fetchFriends, 500);
        fetchFriends();

        searchInput.addEventListener("input", async () => {
            const query = searchInput.value.trim();
            if (!query) {
                searchResults.innerHTML = `<p class="dark-text">Start typing to search for users.</p>`;
                return;
            }
        
            const res = await fetch(`/friends/search?email=${query}`);
            const users = await res.json();
        
            if (users.length === 0) {
                searchResults.innerHTML = `<p class="dark-text">No users found.</p>`;
                return;
            }
        
            searchResults.innerHTML = users.map(user => `
                <div class="friend-entry">
                    <span>${truncateEmail(user.email)}</span>
                    <button class="socials-entry-btn friend-btn" data-id="${user.id}" data-status="${user.status}">
                    <img class="socials-entry-img" src= 
                        ${user.status === "friend" ? "/assets/imgs/remove-friend-icon.png" :
                         user.status === "requested" ? "/assets/imgs/cancel-friend-icon.png" :
                         "/assets/imgs/add-friend-icon.png"}
                    />
                    </button>
                </div>
            `).join("");
        });
        
        searchResults.addEventListener("click", async (e) => {
            if (!e.target.classList.contains("friend-btn")) return;
    
            const btn = e.target;
            const userId = btn.dataset.id;
            const status = btn.dataset.status;
    
            if (status === "friend") {
                await fetch(`/friends/removeFriend`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ friend_id: userId })
                });
                btn.dataset.status = "not_friend";
                btn.innerHTML = `
                <img 
                    class="socials-entry-img" 
                    src="/assets/imgs/add-friend-icon.png"
                />`;
                btn.dataset.status = "not_friend";
            } else if (status === "not_friend") {
                await fetch(`/friends/request`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ friend_id: userId })
                });
                btn.dataset.status = "requested";
                btn.innerHTML = `
                <img 
                    class="socials-entry-img" 
                    src="/assets/imgs/cancel-friend-icon.png" 
                />`;
            } else {
                await fetch(`/friends/cancel`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ receiver_id: userId })
                });
                btn.dataset.status = "not_friend";
                btn.innerHTML = `
                <img 
                    class="socials-entry-img" 
                    src="/assets/imgs/add-friend-icon.png"
                />`;
            }
        });
    
        friendsContainer.addEventListener("click", async (e) => {
            if (e.target.classList.contains("friend-btn")) {
    
                const btn = e.target;
                const userId = btn.dataset.id;
                const status = btn.dataset.status;
    
                if (status === "friend") {
                    await fetch(`/friends/removeFriend`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ friend_id: userId })
                    });
                    btn.dataset.status = "not_friend";
                    btn.innerHTML = `
                    <img 
                        class="socials-entry-img" 
                        src="/assets/imgs/add-friend-icon.png"
                    />`;
                    btn.dataset.status = "not_friend";
                } else if (status === "not_friend") {
                    await fetch(`/friends/request`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ friend_id: userId })
                    });
                    btn.dataset.status = "requested";
                    btn.innerHTML = `
                    <img 
                        class="socials-entry-img" 
                        src="/assets/imgs/cancel-friend-icon.png" 
                    />`;
                } else {
                    await fetch(`/friends/cancel`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ receiver_id: userId })
                    });
                    btn.dataset.status = "not_friend";
                    btn.innerHTML = `
                    <img 
                        class="socials-entry-img" 
                        src="/assets/imgs/add-friend-icon.png"
                    />`;
                }
            } else if (e.target.classList.contains("messenger-btn")) {
    
                const btn = e.target;
                messages_id = btn.dataset.id;
        
                const res = await fetch(`/friends/getMessages?friend_id=${messages_id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
        
                if (res.ok) {
                    let result = await res.json();
                    messages = result.messages;
                    setState('Messenger');
                } else {
                    console.error("Failed to fetch messages:", res.statusText);
                }
            }
        });
    
        requestList.addEventListener("click", async (e) => {
            const btn = e.target;
            if (!btn.classList.contains("accept-btn") && !btn.classList.contains("decline-btn")) return;
    
            const requestId = btn.dataset.id;
            if (btn.classList.contains("accept-btn")) {
                await fetch(`/friends/accept`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ sender_id: requestId })
                });
            } else {
                await fetch(`/friends/decline`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ sender_id: requestId  })
                });
            }
    
            fetchRequests();
        });
    
        setInterval(fetchRequests, 10000);
        fetchRequests(); 
    };


    // EVENTS -------------------------------------------------------------------------------------

    searchButton.addEventListener('click', onSearchButtonClick);
    requestsButton.addEventListener('click', onRequestsButtonClick);
    friendsButton.addEventListener('click', onFriendsButtonClick);

    cleanupFunctions.push(() => searchButton.removeEventListener('click', onSearchButtonClick));
    cleanupFunctions.push(() => requestsButton.removeEventListener('click', onRequestsButtonClick));
    cleanupFunctions.push(() => friendsButton.removeEventListener('click', onFriendsButtonClick));

    function onSearchButtonClick() {
        if (currentState !== 'Overview') return;
        showSection('area-search');
    }
    function onRequestsButtonClick() {
        if (currentState !== 'Overview') return;
        showSection('area-requests');
    }
    function onFriendsButtonClick() {
        if (currentState !== 'Overview') return;
        showSection('area-friends');
    }

    onStart();
}

//================================================================================================
// STATE MESSENGER
//================================================================================================

function stateMessenger() {
    
    // VARIABLES -------------------------------------------------------------------------------------
    
    const messagesContainer = document.getElementById('messages');
    const backButton = document.getElementById('to-overview-btn');
    const messageInput = document.getElementById("message-input");
    const sendButton = document.getElementById("send-button");

    // FUNCTIONS -------------------------------------------------------------------------------------

    async function fetchMessages() {
        try {
            const res = await fetch(`/friends/getMessages?friend_id=${messages_id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
    
            if (res.ok) {
                const result = await res.json();
                const newMessages = result.messages;
    
                // Compare newMessages with the current messages buffer
                if (JSON.stringify(newMessages) !== JSON.stringify(messages)) {
                    messages = newMessages; // Update the buffer only if data has changed
                    displayMessages(); // Refresh the UI
                }
            } else {
                console.error("Failed to fetch messages:", res.statusText);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    }
    
    function displayMessages(){
        messagesContainer.innerHTML = messages.map(message =>     
        `<div class="message ${(message.sender_id == messages_id)? 'left' : 'right'}">
            <span class="email">${truncateEmail(message.email)}</span> 
            <span class="content">${message.content}</span>
            <span class="timestamp">${convertTimestamp(message.timestamp)}</span>
            </div>
        `).join("");
    }

    async function sendMessage() {
        const content = messageInput.value.trim();

        if (!content) {
            console.warn("Message is empty!");
            return;
        }

        try {
            const res = await fetch(`/friends/addMessage`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ friend_id: messages_id, content }),
            });

            if (res.ok) {
                const result = await res.json();
                messages.push(result.message); 
                displayMessages(); 
                scrollToBottom();
                messageInput.value = ""; 
            } else {
                console.error("Failed to send message:", res.statusText);
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    }
    
    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function onStart(){
        displayMessages();
        fetchMessages();
        scrollToBottom();
        setInterval(fetchMessages, 5000); 
    }

    // EVENTS -------------------------------------------------------------------------------------

    backButton.addEventListener('click', onBackButtonClick);
    sendButton.addEventListener("click", sendMessage);

    cleanupFunctions.push(() => backButton.removeEventListener('click', onBackButtonClick));
    cleanupFunctions.push(() => sendButton.removeEventListener("click", sendMessage));

    function onBackButtonClick() {
        if (currentState !== 'Messenger') return;
        setState('Overview');
    }

    onStart();
}

//================================================================================================
// INIT
//================================================================================================

setState('Overview');