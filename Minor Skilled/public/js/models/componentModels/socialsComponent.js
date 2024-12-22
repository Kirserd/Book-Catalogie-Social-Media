import { Component } from '../componentModels/component.js';
import { MessengerView } from '../viewModels/messengerView.js';
import { OverviewView } from '../viewModels/overviewView.js';

export class SocialsComponent extends Component {

//#region ===========[ PROPERTIES ]=======================

    static messages_id = -1;
    static messages = [];

    constructor(id, area) {
        super(id, area);
        
        this.views['Overview'] = new OverviewView(this.area, this);
        this.views['Messenger'] = new MessengerView(this.area, this);
    }

//#endregion

//#region ===========[ OVERRIDES ]========================

    start() {
        this.setView('Overview');
    }

//#endregion

//#region ===========[ FUNCTIONS ]=======================

    truncateEmail(email) {
        if (email) {
            return email.split('@')[0]; 
        }
        return '';
    }

    convertTimestamp(isoTimestamp) {
        const date = new Date(isoTimestamp);
        return `${date.toLocaleTimeString()}`;
    }

//#endregion

}
