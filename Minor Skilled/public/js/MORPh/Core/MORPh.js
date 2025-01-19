export default class MORPh {
    //#region =============[ STATIC ]==============================
    
    static injectCSS() {
        const css = `
            .morph-container {
                position: relative;
                width: 66vw;
                height: 90vh;
            }

            .morph {
                position: absolute;
                
                top:0%;
                right:0%;
                bottom:0%;
                left:0%;

                display: grid;
                transition: all 0.6s ease-in-out;

                pointer-events: none;
            }

            .window {
                opacity: 1;
                transition: opacity 0.6s ease, transform 0.6s ease;

                pointer-events: all;
            }

            .MORPh-fade-out {
                opacity: 1; 
                animation: fadeOutDown 0.6s forwards; 
            }

            .MORPh-fade-in {
                opacity: 0;  
                transform: translateY(-2rem);  
                animation: fadeInUp 0.6s forwards; 
            }

            @keyframes fadeInUp {
                0% {
                    opacity: 0;
                    transform: translateY(-2rem);
                }
                100% {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes fadeOutDown {
                0% {
                    opacity: 1;
                    transform: translateY(0);
                }
                100% {
                    opacity: 0;
                    transform: translateY(2rem);
                }
            }
        `;

        const style = document.createElement('style');
        style.innerHTML = css;
        document.head.appendChild(style);
    }

    //#endregion

    //#region =============[ CONSTRUCTOR ]=========================
    constructor(targetId) {
        this.target = document.getElementById(targetId);
        this.components = {};

        this.currentState = [];
        this.rowHeights = [];
        this.columnWidths = [];

        this.dataBridge = {};

        if (!this.target) {
            throw new Error(`Target element with ID '${targetId}' not found.`);
        }

        MORPh.injectCSS();
    }
    //#endregion

    //#region =============[ PUBLIC METHODS ]======================

    setState(stateTemplate) {
        this.currentState = stateTemplate;
        const rowCount = stateTemplate.length;
        const columnCount = stateTemplate[0].split(' ').length;

        this.rowHeights = new Array(rowCount).fill('auto');
        this.columnWidths = new Array(columnCount).fill('auto');

        Object.values(this.components).forEach(({ instance }) => {
            if (instance.grid) {
                MORPh.updateGridTemplate(instance.grid, this.currentState, this.rowHeights, this.columnWidths);

                instance.currentState = this.currentState;
            }
        });
    }
    
    /**
     * Set the height of a specific row by index.
     * @param {number} rowIndex - Index of the row to adjust (0-based).
     * @param {string} height - The desired height, e.g., '1fr', '200px'.
     */
    setRowHeight(rowIndex, height) {
        if (rowIndex >= 0 && rowIndex < this.rowHeights.length) {
            this.rowHeights[rowIndex] = height;
            Object.values(this.components).forEach(({ instance }) => {
                instance.grid.style.gridTemplateRows = this.rowHeights.join(' ');
                instance.rowHeights = this.rowHeights;
            });
        } else {
            console.warn(`Invalid rowIndex: ${rowIndex}. No changes made.`);
        }
    }
    /**
     * Set the width of a specific column by index.
     * @param {number} columnIndex - Index of the column to adjust (0-based).
     * @param {string} width - The desired width, e.g., '1fr', '200px'.
     */
    setColumnWidth(columnIndex, width) {
        if (columnIndex >= 0 && columnIndex < this.columnWidths.length) {
            this.columnWidths[columnIndex] = width;
            Object.values(this.components).forEach(({ instance }) => {
                instance.grid.style.gridTemplateColumns = this.columnWidths.join(' ');
                instance.columnWidths = this.columnWidths;
            });
        } else {
            console.warn(`Invalid columnIndex: ${columnIndex}. No changes made.`);
        }
    }

    getComponent(slot){
        return this.components[slot];
    }
    addComponent(slot, component, morph = true) {
        const existingComponent = this.components[slot];

        if (existingComponent) {
            this.removeComponent(slot, morph, () => {
                this._injectComponent(slot, component, morph);
            });
        } else {
            this._injectComponent(slot, component, morph);
        }
    }
    removeComponent(slot, morph = true, callback) {
        const existingComponent = this.components[slot];

        if (!existingComponent) return;

        const { instance, element } = existingComponent;
        instance.onUnmount();

        if (morph && existingComponent) {
            var inner = element.firstElementChild;
            inner.classList.add('MORPh-fade-out');
            setTimeout(() => {
                element.removeChild(inner);
                if (callback) callback();
            }, 600);
        } else {
            element.classList.add('MORPh-fade-out');
            setTimeout(() => {
                this.target.removeChild(instance.grid);
                delete this.components[slot].grid;
                if (callback) callback();
            }, 600);
        }
    }

    morphToState(newState, animationHandler) {
        const oldState = this.currentState;
        this.setState(newState);

        if (animationHandler) {
            animationHandler(oldState, newState, this.components);
        }
    }

    setData(key, value) {
        if (typeof key !== 'string') {
            throw new Error('Key must be a string.');
        }
        this.dataBridge[key] = value;
    }
    getData(key) {
        if (typeof key !== 'string') {
            throw new Error('Key must be a string.');
        }
        return this.dataBridge[key];
    }
    removeData(key) {
        if (typeof key !== 'string') {
            throw new Error('Key must be a string.');
        }
        delete this.dataBridge[key];
    }
    clearDataBridge() {
        this.dataBridge = {};
    }

    //#endregion

    //#region =============[ PRIVATE METHODS ]=====================

    _injectComponent(slot, component, morph) {
        const existingComponent = this.components[slot];
        var grid = null;
        var wrapper = null;

        if(!morph || !existingComponent)
        {
            grid = document.createElement('div');
            grid.className = 'morph';

            MORPh.updateGridTemplate(grid, this.currentState, this.rowHeights, this.columnWidths);

            wrapper = document.createElement('div');
            wrapper.className = component.wrapperClassList;
            wrapper.style.gridArea = slot;
            wrapper.innerHTML = component.render();

            grid.appendChild(wrapper);
            this.target.appendChild(grid);

            var animated = wrapper;
        }
        else{
            
            grid = existingComponent.instance.grid;
            wrapper = existingComponent.element;
            wrapper.innerHTML = component.render();
            
            var animated = wrapper.firstElementChild;
        }

        this.components[slot] = { instance: component, element: wrapper };

        component.orchestrator = this;
        component.grid = grid;
        component.wrapper = wrapper;
        wrapper.classList = component.wrapperClassList;
        
        animated.classList.add('MORPh-fade-in');
        setTimeout(() => { 
            animated.classList.remove('MORPh-fade-in');
        }, 600);

        component.onMount();
    }

    //#endregion

    //#region =============[ STATIC METHODS ]======================

    static updateGridTemplate(componentGrid, currentState, rowHeights, columnWidths) {
        componentGrid.style.gridTemplateAreas = currentState.map(row => `'${row}'`).join(' ');
        componentGrid.style.gridTemplateRows = rowHeights.join(' ');
        componentGrid.style.gridTemplateColumns = columnWidths.join(' ');
    }

    //#endregion
}