import { Component, Utils, FeedComponent, SettingsComponent, ExploreComponent } from "../Package.js";

export default class ProfileComponent extends Component {
    wrapperClassList = "window profile-window";
    
    homeButton = null;
    exploreButton = null;
    settingsButton = null;

    render() {
        const userDataContainer = document.getElementById('user-data');
        const user = JSON.parse(userDataContainer.getAttribute('data-user') || '[]');
        this.inner = `<div class="inner-component" id="profile">
                        <div class="banner">
                        </div>
                        
                        <div class="profile-layer">
                            ${ProfileComponent.profilePic()}
                            ${ProfileComponent.profileHeader(user)}

                            <div class="profile">
                                <div class="profile-btns">
                                    ${ProfileComponent.profileButton('home-btn', 'Home', '<svg class="icon-btn-img hov-i" xmlns="http://www.w3.org/2000/svg" viewBox="-3 -2 19 19"><path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L8 2.207l6.646 6.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293z"/><path d="m8 3.293 6 6V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V9.293z"/></svg>')}
                                    ${ProfileComponent.profileButton('explore-btn', 'Explore', '<svg class="icon-btn-img hov-i" xmlns="http://www.w3.org/2000/svg" viewBox="0 -1000 960 960"><path d="M382.12-330.5q-102.19 0-173.86-71.67-71.67-71.68-71.67-173.83t71.67-173.83q71.67-71.67 173.83-71.67 102.15 0 173.82 71.67 71.68 71.68 71.68 173.86 0 40.86-12.02 76.3-12.03 35.43-33.07 64.95l212.09 212.33q12.67 12.91 12.67 28.94 0 16.04-12.91 28.71-12.68 12.67-29.33 12.67t-29.32-12.67L523.85-375.59q-29.76 21.05-65.44 33.07-35.67 12.02-76.29 12.02Zm-.03-83q67.84 0 115.17-47.33 47.33-47.32 47.33-115.17t-47.33-115.17q-47.33-47.33-115.17-47.33-67.85 0-115.18 47.33-47.32 47.32-47.32 115.17t47.32 115.17q47.33 47.33 115.18 47.33Z"/></svg>')}
                                    ${ProfileComponent.profileButton('collection-btn', 'Collection', '<svg class="icon-btn-img hov-i" xmlns="http://www.w3.org/2000/svg" viewBox="0 -1124 1124 1124"><path d="M320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320ZM160-80q-33 0-56.5-23.5T80-160v-520q0-17 11.5-28.5T120-720q17 0 28.5 11.5T160-680v520h520q17 0 28.5 11.5T720-120q0 17-11.5 28.5T680-80H160Zm360-475q0 12 10 17.5t20-.5l49-30q10-6 21-6t21 6l49 30q10 6 20 .5t10-17.5v-245H520v245Z"/></svg>')}
                                    ${ProfileComponent.profileButton('settings-btn', 'Settings', '<svg class="icon-btn-img hov-i" xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 21 21"><path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/></svg>')}
                                </div>
                            </div>
                        </div>
                    </div>`;
        return this.inner;
    }

    onMount() {
        this._subscribeButtons();

        console.log(`Mounted: Profile`);
    }

    onUnmount() {
        this._unsubscribeButtons();

        console.log(`Unmounted: Profile`);
    }

    //#region ============[ PRIVATE ]=================================

    _subscribeButtons(){
        this._onHomeButtonClick = this._onHomeButtonClick.bind(this);
        this._onSettingsButtonClick = this._onSettingsButtonClick.bind(this);
        this._onExploreButtonClick = this._onExploreButtonClick.bind(this);

        this.settingsButton = document.getElementById('settings-btn');
        this.homeButton = document.getElementById('home-btn');
        this.exploreButton = document.getElementById('explore-btn');

        this.homeButton.addEventListener('click', this._onHomeButtonClick);
        this.settingsButton.addEventListener('click', this._onSettingsButtonClick);
        this.exploreButton.addEventListener('click', this._onExploreButtonClick);
    }

    _unsubscribeButtons(){
        this.homeButton.removeEventListener('click', this._onHomeButtonClick);
        this.settingsButton.removeEventListener('click', this._onSettingsButtonClick);
        this.exploreButton.removeEventListener('click', this._onExploreButtonClick);

        this.settingsButton = null;
        this.homeButton = null;
        this.exploreButton = null;
    }

    _onHomeButtonClick() {
        if(!(this.orchestrator.components['c'].instance instanceof FeedComponent))
            this.orchestrator.addComponent('c', new FeedComponent({}), false);
    }
    _onExploreButtonClick() {
        if(!(this.orchestrator.components['c'].instance instanceof ExploreComponent))
            this.orchestrator.addComponent('c', new ExploreComponent({}), false);
    }
    _onSettingsButtonClick() {
        if(!(this.orchestrator.components['c'].instance instanceof SettingsComponent))
            this.orchestrator.addComponent('c', new SettingsComponent({}), false);
    }

    //#endregion

    //#region ============[ SUB-COMPONENTS ]==========================

    static profilePic(){
        return `<div class="profile-pic">
        <a href="/auth">
                    <button class="icon-btn hov-s6i hov-si blank-btn" id="logout-btn">
                        <svg class="icon-btn-img hov-i" xmlns="http://www.w3.org/2000/svg" viewBox="-1 1 15 15">
                            <path fill-rule="evenodd" d="M10 3.5a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 1 1 0v2A1.5 1.5 0 0 1 9.5 14h-8A1.5 1.5 0 0 1 0 12.5v-9A1.5 1.5 0 0 1 1.5 2h8A1.5 1.5 0 0 1 11 3.5v2a.5.5 0 0 1-1 0z"/>
                            <path fill-rule="evenodd" d="M4.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H14.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708z"/>
                        </svg>
                    </button>
                    </a>
                    <img class="profile-pic-img" src="assets/imgs/nopic.png" alt="Profile Picture" class="dark-text profile-picture">
                </div>`;
    }
    static profileHeader(user){
        return `<div class="profile-header">
                    <h2 class="dark-text">  Welcome, <span class="accent-text">${Utils.truncateEmail(user.email)}</span></h2>
                    <button class="icon-btn hov-s6i hov-si blank-btn" id="user-settings-btn">
                        <svg class="icon-btn-img hov-i" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                            <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0m-9 8c0 1 1 1 1 1h5.256A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1 1.544-3.393Q8.844 9.002 8 9c-5 0-6 3-6 4m9.886-3.54c.18-.613 1.048-.613 1.229 0l.043.148a.64.64 0 0 0 .921.382l.136-.074c.561-.306 1.175.308.87.869l-.075.136a.64.64 0 0 0 .382.92l.149.045c.612.18.612 1.048 0 1.229l-.15.043a.64.64 0 0 0-.38.921l.074.136c.305.561-.309 1.175-.87.87l-.136-.075a.64.64 0 0 0-.92.382l-.045.149c-.18.612-1.048.612-1.229 0l-.043-.15a.64.64 0 0 0-.921-.38l-.136.074c-.561.305-1.175-.309-.87-.87l.075-.136a.64.64 0 0 0-.382-.92l-.148-.045c-.613-.18-.613-1.048 0-1.229l.148-.043a.64.64 0 0 0 .382-.921l-.074-.136c-.306-.561.308-1.175.869-.87l.136.075a.64.64 0 0 0 .92-.382zM14 12.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0"/>
                        </svg>
                    </button>
                </div>`;
    }
    static profileButton(id, label, svg){
        return `<button class="icon-btn hov-s6i hov-si profile-btn inner-window" id="${id}">
                    ${svg}
                    <hr />
                    <p>${label}</p>
                </button>`;
    }

    //#endregion
}
