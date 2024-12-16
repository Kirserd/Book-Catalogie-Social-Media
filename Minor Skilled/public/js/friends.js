import { setState } from './socialsDisplay.js';

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("friend-search");
    const searchResults = document.getElementById("search-results");
    const requestList = document.getElementById("request-list");
    const requestCount = document.getElementById("request-count");
    const friendsContainer = document.querySelector(".friends");

    async function fetchFriends() {
        const res = await fetch("/friends/getFriendList");
        const friends = await res.json();

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

    setInterval(fetchFriends, 10000);
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
    // Handle friend button clicks
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
            const userId = btn.dataset.id;

            await fetch(`/friends/getMessages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ friend_id: userId })
            });
        }
        setState('Messenger');
    });
    

    // Fetch friend requests periodically
    async function fetchRequests() {
        const res = await fetch("/friends/getFriendRequests");
        const requests = await res.json();
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

    // Handle accept/decline
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

    // Poll for requests every 10 seconds
    setInterval(fetchRequests, 10000);
    fetchRequests(); // Initial fetch
});

function truncateEmail(email) {
    if (email) {
        return email.split('@')[0]; 
    }
    return '';
}