import { Component, Utils, MessengerComponent } from "../Package.js";

export default class FriendsComponent extends Component {
    wrapperClassList = "window";
    
    previousFriends = [];
    previousRequests = [];

    friendsIntervalId;
    requestsIntervalId;

    render() {
        this.inner = `
        <div class="inner-component" id="friends">
            <h2 class="dark-text">Social</h2>
            <div class="socials-container">
                ${FriendsComponent.UserSearch()}
                ${FriendsComponent.Requests()}
                ${FriendsComponent.friendList()}
            </div>
        </div>`;

        return this.inner;
    }

    async onMount() {
        super.onMount();
        this._subscribeEvents();
    
        this._showSection('area-friends');
    
        this._fetchFriends();
        this._fetchRequests();
    
        console.log(`Mounted: Friends`);
    }
    
    async onUnmount() {
        super.onUnmount();
        this._unsubscribeEvents();
    
        console.log(`Unmounted: Friends`);
    }

    //#region ============[ PRIVATE ]=================================

    // EVENTS

    _subscribeEvents() {
        this.friendsIntervalId = setInterval(this._fetchFriends.bind(this), 500);
        this.requestsIntervalId = setInterval(this._fetchRequests.bind(this), 10000);

        this._subscribeAreaButtons();
        this._subscribeUserSearch();
        this._subscribeSearchResultsClick();
        this._subscribeFriendsContainerClick();
        this._subscribeRequestListClick();
    }
    _subscribeAreaButtons(){
        const searchButton = document.getElementById('socials-search-btn');
        const requestsButton = document.getElementById('socials-requests-btn');
        const friendsButton = document.getElementById('socials-friends-btn');

        this._onSearchButtonClick = this._onSearchButtonClick.bind(this);
        this._onRequestsButtonClick = this._onRequestsButtonClick.bind(this);
        this._onFriendsButtonClick = this._onFriendsButtonClick.bind(this);

        searchButton.addEventListener('click', this._onSearchButtonClick);
        requestsButton.addEventListener('click', this._onRequestsButtonClick);
        friendsButton.addEventListener('click', this._onFriendsButtonClick);
    }
    _subscribeUserSearch(){
        const searchInput = document.getElementById("friend-search");
        searchInput.addEventListener('input', this._handleSearchInput.bind(this));
    }
    _subscribeSearchResultsClick() {
        const searchResults = document.getElementById("search-results");
        searchResults.addEventListener("click", this._handleSearchResultsClick.bind(this));
    }
    _subscribeFriendsContainerClick() {
        const friendsContainer = document.querySelector(".friends");
        friendsContainer.addEventListener("click", this._handleFriendsContainerClick.bind(this));
    }
    _subscribeRequestListClick() {
        const requestList = document.getElementById("request-list");
        requestList.addEventListener("click", this._handleRequestListClick.bind(this));
    }
    
    _unsubscribeEvents() {
        if (this.friendsIntervalId) {
            clearInterval(this.friendsIntervalId);
            this.friendsIntervalId = null;
        }
        if (this.requestsIntervalId) {
            clearInterval(this.requestsIntervalId);
            this.requestsIntervalId = null;
        }

        this._unsubscribeAreaButtons();
        this._unsubscribeUserSearch();
        this._unsubscribeSearchResultsClick();
        this._unsubscribeFriendsContainerClick();
        this._unsubscribeRequestListClick();
    } 
    _unsubscribeAreaButtons(){
        const searchButton = document.getElementById('socials-search-btn');
        const requestsButton = document.getElementById('socials-requests-btn');
        const friendsButton = document.getElementById('socials-friends-btn');

        searchButton.removeEventListener('click', this._onSearchButtonClick);
        requestsButton.removeEventListener('click', this._onRequestsButtonClick);
        friendsButton.removeEventListener('click', this._onFriendsButtonClick);
    }
    _unsubscribeUserSearch(){
        const searchInput = document.getElementById("friend-search");
        searchInput.removeEventListener('input', this._handleSearchInput);
    }
    _unsubscribeSearchResultsClick() {
        const searchResults = document.getElementById("search-results");
        searchResults.removeEventListener("click", this._handleSearchResultsClick);
    }
    _unsubscribeFriendsContainerClick() {
        const friendsContainer = document.querySelector(".friends");
        friendsContainer.removeEventListener("click", this._handleFriendsContainerClick);
    }
    _unsubscribeRequestListClick() {
        const requestList = document.getElementById("request-list");
        requestList.removeEventListener("click", this._handleRequestListClick);
    }

    // FUNCTIONS

    _onSearchButtonClick() {
        this._showSection('area-search');
    }
    _onRequestsButtonClick() {
        this._showSection('area-requests');
    }
    _onFriendsButtonClick() {
        this._showSection('area-friends');
    }

    _showSection(newAreaClass) {
        const socialsContainer = document.querySelector('.socials-container');
        const socialsSearch = document.querySelector('.socials-search > .hiding-target');
        const socialsRequests = document.querySelector('.socials-requests > .hiding-target');
        const socialsFriends = document.querySelector('.socials-friends > .hiding-target');

        if (newAreaClass === 'area-friends') {
            socialsSearch.classList.add('hidden');
            socialsRequests.classList.add('hidden');
        } else {
            socialsFriends.classList.add('hidden');
        }

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
            this._truncateFriendEntries();
            this._resetRequestEntries();
        } else {
            this._resetFriendEntries();
            this._truncateRequestEntries();
        }
    }

    _truncateFriendEntries() {
        let friendEntries = document.querySelectorAll('.friend-entry span');
        friendEntries.forEach(entry => {
            if(entry.textContent !== '...'){
                entry.dataset.fullText = entry.textContent;
                entry.textContent = '...'; 
            }
        });
    }
    _resetFriendEntries() {
        let friendEntries = document.querySelectorAll('.friend-entry span');
        friendEntries.forEach(entry => {
            if (entry.dataset.fullText) {
                entry.textContent = entry.dataset.fullText;
            }
        })
    };
    _truncateRequestEntries() {
        let friendEntries = document.querySelectorAll('.request-entry span');
        friendEntries.forEach(entry => {
            if(entry.textContent !== '...'){
                entry.dataset.fullText = entry.textContent; 
                entry.textContent = '...';
            }
        });
    }
    _resetRequestEntries() {
        let friendEntries = document.querySelectorAll('.request-entry span');
        friendEntries.forEach(entry => {
            if (entry.dataset.fullText) {
                entry.textContent = entry.dataset.fullText;
            }
        })
    };

    async _fetchFriends() {
        const friendsContainer = document.querySelector(".friends");

        const res = await fetch("/friends/getFriendList");
        const friends = await res.json();

        if (JSON.stringify(friends) !== JSON.stringify(this.previousFriends)) {
            this.previousFriends = friends;
            if (friends.length > 0) {
                friendsContainer.innerHTML = friends.map(friend => `
                    <div class="friend-entry inner-window">
                        <span>${Utils.truncateEmail(friend.email)}</span>
                        <div class="decision-btns">
                            <button class="socials-entry-btn messenger-btn" data-id="${friend.id}">
                                <svg class="socials-entry-img" xmlns="http://www.w3.org/2000/svg" viewBox="-1.8 -1.8 20 20">
                                    <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.5a1 1 0 0 0-.8.4l-1.9 2.533a1 1 0 0 1-1.6 0L5.3 12.4a1 1 0 0 0-.8-.4H2a2 2 0 0 1-2-2zm3.5 1a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1z"/>
                                </svg>
                            </button>
                            <button class="socials-entry-btn friend-btn" data-id="${friend.id}" data-status="friend">
                                <svg class="socials-entry-img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                                    <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M11 12h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1 0-1m0-7a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                                    <path d="M2 13c0 1 1 1 1 1h5.256A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1 1.544-3.393Q8.844 9.002 8 9c-5 0-6 3-6 4"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                `).join("");
            } else {
                friendsContainer.innerHTML = `<p class="dark-text">No friends found.</p>`;
            }
        }
    }
    async _fetchRequests() {
        const requestList = document.getElementById("request-list");
        const requestCount = document.getElementById("request-count");

        const res = await fetch("/friends/getFriendRequests");
        const requests = await res.json();
    
        if (JSON.stringify(requests) !== JSON.stringify(this.previousRequests)) {
            this.previousRequests = requests; 
            requestCount.textContent = requests.length;
            if (requests.length > 0) {
                requestList.innerHTML = requests.map(request => `
                    <div class="request-entry inner-window">
                        <span>${Utils.truncateEmail(request.email)}</span>
                        <div class="decision-btns">
                            <button class="accept-btn socials-entry-btn" data-id="${request.id}">
                                <svg class="socials-entry-img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                                    <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0m-2-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                                    <path d="M2 13c0 1 1 1 1 1h5.256A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1 1.544-3.393Q8.844 9.002 8 9c-5 0-6 3-6 4"/>
                                </svg>
                            </button>
                            <button class="decline-btn socials-entry-btn" data-id="${request.id}">
                                <svg class="socials-entry-img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                                    <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M11 12h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1 0-1m0-7a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                                    <path d="M2 13c0 1 1 1 1 1h5.256A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1 1.544-3.393Q8.844 9.002 8 9c-5 0-6 3-6 4"/>
                                </svg>
                        </div>
                    </div>
                `).join("");
            } else {
                requestList.innerHTML = `<p class="dark-text">No new requests.</p>`;
            }
        }
    }
    async _handleSearchInput(){
        const searchInput = document.getElementById("friend-search");
        const searchResults = document.getElementById("search-results");

        const query = searchInput.value.trim();

        if (!query) {
            searchResults.innerHTML = `<p class="dark-text">Start typing to search for users.</p>`;
            return;
        }

        try {
            const res = await fetch(`/friends/search?email=${query}`);
            const users = await res.json();

            if (users.length === 0) {
                searchResults.innerHTML = `<p class="dark-text">No users found.</p>`;
                return;
            }

            searchResults.innerHTML = users.map(user => `
                <div class="friend-entry inner-window">
                    <span>${Utils.truncateEmail(user.email)}</span>
                    <button class="socials-entry-btn friend-btn" data-id="${user.id}" data-status="${user.status}">
                    <svg class="socials-entry-img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                        ${this._getUserIcon(user.status)}
                    </svg> 
                    </button>
                </div>
            `).join("");
        } catch (error) {
            console.error('Error fetching users:', error);
            searchResults.innerHTML = `<p class="dark-text">Error fetching users. Please try again later.</p>`;
        }
    }
    async _handleSearchResultsClick(e) {
        if (!e.target.classList.contains("friend-btn")) return;
    
        const btn = e.target;
        const userId = btn.dataset.id;
        const status = btn.dataset.status;
    
        try {
            if (status === "friend") {
                await fetch(`/friends/removeFriend`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ friend_id: userId })
                });
                btn.dataset.status = "not_friend";
                btn.innerHTML = `<svg class="socials-entry-img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${this._getUserIcon("not_friend")}</svg>`;
            } else if (status === "not_friend") {
                await fetch(`/friends/request`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ friend_id: userId })
                });
                btn.dataset.status = "requested";
                btn.innerHTML = `<svg class="socials-entry-img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${this._getUserIcon("requested")}</svg>`
            } else if (status === "requested") {
                await fetch(`/friends/cancel`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ receiver_id: userId })
                });
                btn.dataset.status = "not_friend";
                btn.innerHTML = `<svg class="socials-entry-img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${this._getUserIcon("not_friend")}</svg>`;
            }
        } catch (error) {
            console.error("Error updating friend status:", error);
        }
    }
    async _handleFriendsContainerClick(e) {
        if (e.target.classList.contains("friend-btn")) {
            await this._handleFriendButtonClick(e.target);
        } else if (e.target.classList.contains("messenger-btn")) {
            await this._handleMessengerButtonClick(e.target);
        }
    }
    async _handleFriendButtonClick(btn) {
        const userId = btn.dataset.id;
        const status = btn.dataset.status;
    
        try {
            if (status === "friend") {
                await fetch(`/friends/removeFriend`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ friend_id: userId })
                });
                btn.dataset.status = "not_friend";
                btn.innerHTML = `<svg class="socials-entry-img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${this._getUserIcon("not-friend")}</svg>`
            } else if (status === "not_friend") {
                await fetch(`/friends/request`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ friend_id: userId })
                });
                btn.dataset.status = "requested";
                btn.innerHTML = `<svg class="socials-entry-img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${this._getUserIcon("requested")}</svg>`
            } else if (status === "requested") {
                await fetch(`/friends/cancel`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ receiver_id: userId })
                });
                btn.dataset.status = "not_friend";
                btn.innerHTML = `<svg class="socials-entry-img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${this._getUserIcon("not-friend")}</svg>`
            }
        } catch (error) {
            console.error("Error updating friend status:", error);
        }
    }
    async _handleMessengerButtonClick(btn) {
        const messagesId = btn.dataset.id;
    
        try {
            const res = await fetch(`/friends/getMessages?friend_id=${messagesId}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });
    
            if (res.ok) {
                const result = await res.json();
                this.orchestrator.setData('messagesID', messagesId);
                this.orchestrator.setData('messages', result.messages);
                this.orchestrator.addComponent('d', new MessengerComponent({}), false);
            } else {
                console.error("Failed to fetch messages:", res.statusText);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    }
    async _handleRequestListClick(e) {
        const btn = e.target;
    
        if (btn.classList.contains("accept-btn")) {
            await this._handleAcceptRequest(btn.dataset.id);
        } else if (btn.classList.contains("decline-btn")) {
            await this._handleDeclineRequest(btn.dataset.id);
        }
    }
    async _handleAcceptRequest(requestId) {
        try {
            await fetch(`/friends/accept`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sender_id: requestId })
            });
            this._fetchRequests();
        } catch (error) {
            console.error("Error accepting friend request:", error);
        }
    }
    async _handleDeclineRequest(requestId) {
        try {
            await fetch(`/friends/decline`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sender_id: requestId })
            });
            this._fetchRequests();
        } catch (error) {
            console.error("Error declining friend request:", error);
        }
    }

    _getUserIcon(status) {
        if (status === "friend") {
            return '<path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M11 12h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1 0-1m0-7a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/><path d="M2 13c0 1 1 1 1 1h5.256A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1 1.544-3.393Q8.844 9.002 8 9c-5 0-6 3-6 4"/>';
        } else if (status === "requested") {
            return '<path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0m-9 8c0 1 1 1 1 1h5.256A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1 1.544-3.393Q8.844 9.002 8 9c-5 0-6 3-6 4"/><path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m-.646-4.854.646.647.646-.647a.5.5 0 0 1 .708.708l-.647.646.647.646a.5.5 0 0 1-.708.708l-.646-.647-.646.647a.5.5 0 0 1-.708-.708l.647-.646-.647-.646a.5.5 0 0 1 .708-.708"/>';
        } else {
            return '<path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0m-2-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/><path d="M2 13c0 1 1 1 1 1h5.256A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1 1.544-3.393Q8.844 9.002 8 9c-5 0-6 3-6 4"/>';
        }
    }

    //#endregion

    //#region ============[ SUB-COMPONENTS ]==========================

    static UserSearch(){
        return `<div class="socials-search window">
                    <div id="socials-search-btn" class="socials-btn search-bar">
                        <input id="friend-search" type="text" placeholder="Search people..." />
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                            <path d="M382.12-330.5q-102.19 0-173.86-71.67-71.67-71.68-71.67-173.83t71.67-173.83q71.67-71.67 173.83-71.67 102.15 0 173.82 71.67 71.68 71.68 71.68 173.86 0 40.86-12.02 76.3-12.03 35.43-33.07 64.95l212.09 212.33q12.67 12.91 12.67 28.94 0 16.04-12.91 28.71-12.68 12.67-29.33 12.67t-29.32-12.67L523.85-375.59q-29.76 21.05-65.44 33.07-35.67 12.02-76.29 12.02Zm-.03-83q67.84 0 115.17-47.33 47.33-47.32 47.33-115.17t-47.33-115.17q-47.33-47.33-115.17-47.33-67.85 0-115.18 47.33-47.32 47.32-47.32 115.17t47.32 115.17q47.33 47.33 115.18 47.33Z"/>
                        </svg>
                    </div>   
                    <div class="hiding-target">  
                        <div class="search-results" id="search-results">
                            <p class="dark-text">Search for users to add as
                                friends or manage requests.</p>
                        </div>
                    </div>
                </div>`;
    }

    static Requests(){
        return `<div class="socials-requests window">
                    <button id="socials-requests-btn" class="socials-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 21 21">
                            <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2m.995-14.901a1 1 0 1 0-1.99 0A5 5 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901"/>
                        </svg>
                        <p><strong> Requests </strong>(<span id="request-count">0</span>)</p>
                    </button>
                    <div class="hiding-target">
                        <div class="friend-requests">
                            <div id="request-list">
                            </div>
                        </div>
                    </div>
                </div>`;
    }

    static friendList(){
        return `<div class="socials-friends window">
                    <button id="socials-friends-btn" class="socials-btn">
                        <p><strong>Friend List</strong></p>
                    </button>
                    <div class="hiding-target">
                        <div class="friends">
                    </div>
                </div>`;
    }

    //#endregion
}