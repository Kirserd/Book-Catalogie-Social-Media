import { Component, FriendsComponent, Utils } from "../Package.js";

export default class MessengerComponent extends Component {
    wrapperClassList = "window msngr";

    fetchInterval;

    render() {
        this.inner = `<div class="inner-component" id="messenger">
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
                      </div>`;
        return this.inner;
    }

    onMount() {
        this._subscribeEvents();

        this._displayMessages(true);
        this._fetchMessages(true);
        
        console.log(`Mounted: Messenger`);
    }

    onUnmount() {
        this._unsubscribeEvents();

        console.log(`Unmounted: Messenger`);
    }

    //#region ============[ PRIVATE ]=================================

    _subscribeEvents(){
        const backButton = document.getElementById('to-overview-btn');
        const sendButton =document.getElementById("send-button");

        this._onBackButtonClick = this._onBackButtonClick.bind(this);
        this._sendMessage = this._sendMessage.bind(this);
        this._fetchMessages = this._fetchMessages.bind(this);

        if (backButton) {
            backButton.addEventListener('click', this._onBackButtonClick);
        }

        if (sendButton) {
            sendButton.addEventListener("click", this._sendMessage);
        }

        this.fetchInterval = setInterval(this._fetchMessages, 5000);
    }
    _unsubscribeEvents(){
        const backButton = document.getElementById('to-overview-btn');
        const sendButton = document.getElementById("send-button");

        if (backButton) {
            backButton.removeEventListener('click', this._onBackButtonClick);
        }

        if (sendButton) {
            sendButton.removeEventListener("click", this._sendMessage);
        }
        clearInterval(this.fetchInterval);
    }

    _displayMessages(scrollToBottom = false) {
        const messagesContainer = document.getElementById('messages');

        if (!messagesContainer) {
            console.error("Messages container not found");
            return;
        }

        messagesContainer.innerHTML = MessengerComponent.messageList(
            this.orchestrator.getData('messages'),
            this.orchestrator.getData('messagesID')
        );

        if(scrollToBottom)
            this._scrollToBottom();
    }
    _scrollToBottom() {
        const messagesContainer = document.getElementById('messages');

        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }
    _onBackButtonClick() {
        this.orchestrator.addComponent('d', new FriendsComponent({}), false);
    }

    async _fetchMessages(scrollToBottom = false) {
        try {
            const messagesID = this.orchestrator.getData('messagesID');
            const url = `/friends/getMessages?friend_id=${messagesID}`;
            
            const result = await this.constructor.fetchJSON(url, { method: "GET" });
            const newMessages = result.messages;
    
            if (JSON.stringify(newMessages) !== JSON.stringify(this.orchestrator.getData('messages'))) {
                this.orchestrator.setData('messages', newMessages);
                this._displayMessages(scrollToBottom);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    }
    async _sendMessage() {
        const messageInput = document.getElementById("message-input");
    
        if (!messageInput) {
            console.error("Message input field not found");
            return;
        }
    
        const content = messageInput.value.trim();
    
        if (!content) {
            console.warn("Message is empty!");
            return;
        }
    
        try {
            const url = `/friends/addMessage`;
            const body = { friend_id: this.orchestrator.getData('messagesID'), content };
            
            await this.constructor.fetchJSON(url, {
                method: "POST",
                body: JSON.stringify(body),
            });

            this._fetchMessages(true);
            messageInput.value = "";
        } catch (error) {
            console.error("Error sending message:", error);
        }
    }

    //#endregion

    //#region ============[ SUB-COMPONENTS ]==========================

    static messageList(messages, messagesID){
        return messages.map(message => MessengerComponent.message(
            message, 
            messagesID
        )).join('');
    }

    static message(message, messagesID){
        return `
                <div class="message ${(message.sender_id == messagesID) ? 'left' : 'right'}">
                    <span class="email">${Utils.truncateEmail(message.email)}</span> 
                    <span class="content">${message.content}</span>
                    <span class="timestamp">${Utils.convertTimestamp(message.timestamp)}</span>
                </div>
        `;
    }

    //#endregion
}
