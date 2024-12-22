import { SocialsComponent } from '../componentModels/socialsComponent.js';
import { View } from '../viewModels/view.js';

export class MessengerView extends View {

//#region ===========[ PROPERTIES ]=======================

    messagesContainer;
    backButton;
    messageInput;
    sendButton;
    
    constructor(area, parent) {
        super(area, parent);
    }

//#endregion

//#region ===========[ OVERRIDES ]=======================

    show() {
        if (!(this.parent instanceof SocialsComponent)) {
            throw new TypeError('Argument must be an instance of SocialsComponent.');
        }

        document.querySelector(".page").insertAdjacentHTML('beforeend', 
            `<div class="msngr window window-anim" style="grid-area: d;" id="${this.parent.id}-new">
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
    state() {   
        this.variableRefresh();
        this.events();
        this.displayMessages();
        this.fetchMessages();
        this.scrollToBottom();
        setInterval(this.fetchMessages, 5000); 
    }

    variableRefresh(){
        this.messagesContainer = document.getElementById('messages');
        this.backButton = document.getElementById('to-overview-btn');
        this.messageInput = document.getElementById("message-input");
        this.sendButton = document.getElementById("send-button");
    }

    async fetchMessages() {
        try {
            const res = await fetch(`/friends/getMessages?friend_id=${SocialsComponent.messages_id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
    
            if (res.ok) {
                const result = await res.json();
                const newMessages = result.messages;
    
                if (JSON.stringify(newMessages) !== JSON.stringify(messages)) {
                    SocialsComponent.messages = newMessages; 
                    this.displayMessages(); 
                }
            } else {
                console.error("Failed to fetch messages:", res.statusText);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    }
    
    displayMessages(){
        this.messagesContainer.innerHTML = SocialsComponent.messages.map(message =>     
        `<div class="message ${(message.sender_id == SocialsComponent.messages_id)? 'left' : 'right'}">
            <span class="email">${this.parent.truncateEmail(message.email)}</span> 
            <span class="content">${message.content}</span>
            <span class="timestamp">${this.parent.convertTimestamp(message.timestamp)}</span>
            </div>
        `).join("");
    }

    async sendMessage() {
        const content = this.messageInput.value.trim();

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
                body: JSON.stringify({ friend_id: SocialsComponent.messages_id, content }),
            });

            if (res.ok) {
                const result = await res.json();
                SocialsComponent.messages.push(result.message); 
                displayMessages(); 
                scrollToBottom();
                this.messageInput.value = ""; 
            } else {
                console.error("Failed to send message:", res.statusText);
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    }
    
    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    events(){
        this.backButton.addEventListener('click', this.onBackButtonClick);
        this.sendButton.addEventListener("click", this.sendMessage);
    
        this.parent.cleanupFunctions.push(() => this.backButton.removeEventListener('click', this.onBackButtonClick));
        this.parent.cleanupFunctions.push(() => this.sendButton.removeEventListener("click", this.sendMessage));
    }

    onBackButtonClick() {
        this.parent.setView('Overview');
    }

//#endregion

}