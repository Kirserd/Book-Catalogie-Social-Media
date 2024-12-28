import { Component, Themes } from "../Package.js";

export default class SettingsComponent extends Component {
    wrapperClassList = "window settings-container";

    render() {
        this.inner = `
            <div class="inner-component" id="settings">
                <h2 class="dark-text">Settings</h2>
                <div class="settings-pack inner-window">
                    <h3>Theme</h3>
                    <div class="settings-entries">
                        ${SettingsComponent.createButtonEntry(
                            "Reset theme",
                            "reset-theme-btn",
                            `"-1.5 -1.5 19 19"`,
                            `<path fill-rule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2z"/>` + 
                            `<path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466"/>`
                        )}
                        ${SettingsComponent.createSettingsSubsection("Colors", 
                            SettingsComponent.createColorEntry("Primary", "primary-color", "#070707") +
                            SettingsComponent.createColorEntry("Secondary", "secondary-color", "#8b8b8b") +
                            SettingsComponent.createColorEntry("Accent", "accent-color", "#916d4c") 
                        )}
                        ${SettingsComponent.createSettingsSubsection("Other", 
                            SettingsComponent.createSliderEntry("Contrast", "contrast-range", 1, 100, 20) + 
                            SettingsComponent.createToggleEntry("More Accents", "more-accents", 0)
                        )}
                    </div>
                </div>
            </div>
        `;
        return this.inner;
    }

    onMount() {
        this._subscribeEvents();
        this._syncThemeEntries();

        console.log(`Mounted: Settings`);
    }

    onUnmount() {
        this._unsubscribeEvents();

        console.log(`Unmounted: Settings`);
    }

    //#region ============[ PRIVATE ]=================================

    _subscribeEvents(){
        const c1 = document.querySelector("#primary-color");
        const c2 = document.querySelector("#secondary-color");
        const a = document.querySelector("#accent-color");
        const contrast = document.querySelector("#contrast-range");
        const moreAccents = document.querySelector("#more-accents");

        c1.addEventListener("input", this._updateTheme, false);
        c2.addEventListener("input", this._updateTheme, false);
        a.addEventListener("input", this._updateTheme, false);
        contrast.addEventListener("input", this._updateTheme, false);
        moreAccents.addEventListener("input", this._updateTheme, false);
    }

    _unsubscribeEvents(){
        const c1 = document.querySelector("#primary-color");
        const c2 = document.querySelector("#secondary-color");
        const a = document.querySelector("#accent-color");
        const contrast = document.querySelector("#contrast-range");
        const moreAccents = document.querySelector("#more-accents");

        c1.removeEventListener("input", this._updateTheme, false);
        c2.removeEventListener("input", this._updateTheme, false);
        a.removeEventListener("input", this._updateTheme, false);
        contrast.removeEventListener("input", this._updateTheme, false);
        moreAccents.removeEventListener("input", this._updateTheme, false);
    }

    _updateTheme() {
        const c1 = document.querySelector("#primary-color");
        const c2 = document.querySelector("#secondary-color");
        const a = document.querySelector("#accent-color");
        const contrast = document.querySelector("#contrast-range");
        const moreAccents = document.querySelector("#more-accents");

        Themes.setTheme(
            c1.value,
            c2.value,
            a.value,
            contrast.value,
            moreAccents.value
        );
    }
    
    _syncThemeEntries() {
        const c1 = document.querySelector("#primary-color");
        const c2 = document.querySelector("#secondary-color");
        const a = document.querySelector("#accent-color");
        const contrast = document.querySelector("#contrast-range");
        const moreAccents = document.querySelector("#more-accents");

        c1.value = Themes.currentTheme.c1;
        c2.value = Themes.currentTheme.c2;
        a.value = Themes.currentTheme.a;
        contrast.value = Themes.currentTheme.contrast;
        moreAccents.value = Themes.currentTheme.moreAccents;
    }

    //#endregion

    //#region ============[ SUB-COMPONENTS ]==========================
    
    static createButtonEntry(title, buttonId, viewBox, iconPath) {
        return `
            <div class="settings-entry">
                <div class="left">
                    <p>${title}</p>
                </div>
                <div class="right">
                    <button class="icon-btn hov-s6i hov-si profile-btn inner-window" id="${buttonId}">
                        <svg class="icon-btn-img hov-i" xmlns="http://www.w3.org/2000/svg" viewBox=${viewBox}>
                            ${iconPath}
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }
    static createColorEntry(labelText, inputId, inputValue) {
        return `
            <div class="settings-entry sub">
                <div class="left">
                    <label for="${inputId}" id="${inputId}-label"><p>${labelText}</p></label>
                </div>
                <div class="right">
                    <input type="color" class="input-color" id="${inputId}" name="${inputId}" value="${inputValue}" />
                </div>
            </div>
        `;
    }
    static createSliderEntry(labelText, inputId, min, max, value) {
        return `
            <div class="settings-entry sub">
                <div class="left">
                    <p>${labelText}</p>
                </div>
                <div class="right">
                    <input class="slider" type="range" min="${min}" max="${max}" value="${value}" id="${inputId}" />
                </div>
            </div>
        `;
    }
    static createToggleEntry(labelText, inputId, value) {
        return `
            <div class="settings-entry sub">
                <div class="left">
                    <p>${labelText}</p>
                </div>
                <div class="right">
                    <input class="toggle" type="range" min="0" max="1" value="${value}" id="${inputId}" />
                </div>
            </div>
        `;
    }

    static createSettingsSubsection(title, content) {
        return `
            <div class="settings-entry-subs">
                <p>${title}</p>
                ${content}
            </div>
        `;
    }

    //#endregion
}
