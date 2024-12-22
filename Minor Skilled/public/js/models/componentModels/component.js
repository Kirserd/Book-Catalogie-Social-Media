import { View } from '../viewModels/view.js';

export class Component {

//#region ===========[ PROPERTIES ]=======================

    #currentState = 'Loading';
    cleanupFunctions = [];

    constructor(id, area, views = []) {
        this.container = document.querySelector(".page");
        this.id = id;
        this.area = area;
        this.views = views;
    }

//#endregion

//#region ===========[ CONTROLS ]=========================

    start(){
        this.setView(views[0]);
    }
    exit(){
        this.cleanup();
    }

    async cleanup(){
        if (this.cleanupFunctions.length > 0) {
            await Promise.all(
                this.cleanupFunctions.map(
                    async cleanup => await cleanup()
                )
            ); 
            this.cleanupFunctions = [];
        }
    }
    async setView(name) {
        this.cleanup();

        let view = this.views[name];
        if (!(view instanceof View)) {
            throw new TypeError('Argument must be an instance of View.');
        }

        view.show();
        view.state();

        let newSection = document.getElementById(`${this.id}-new`);
        if(this.#currentState !== 'Loading') {
            newSection.classList.add('prio');
        }
    
        this.cleanupFunctions.push(async () => {
            const toClean = document.getElementById(`${this.id}`);
            toClean.classList.remove('window-anim');
            toClean.classList.add('hide-socials-anim');
            
            await new Promise(resolve => setTimeout(resolve, 450));
    
            toClean.remove();
        });
    
        newSection.id = `${this.id}`;
        this.#currentState = name;
    }  

//#endregion

}

