import { MORPh } from "../Package.js";

export default class Component {
    wrapperClassList = "window";
    componentCSSPath;

    constructor(props) {
        this.orchestrator = null;

        this.props = props;
        this.styleElement = null;

        this.grid = null;
        this.wrapper = null;
        this.inner = null;

        this.currentState = [];
        this.rowHeights = [];
        this.columnWidths = [];
    }

    render() {
        this.inner = '<div>Default Component</div>';
        return this.inner;
    }

    async onMount() {
        if (this.componentCSSPath) {
            await this._injectCSS(this.componentCSSPath);
        }
    }

    async onUnmount() {
        if (this.styleElement) {
            this._removeCSS();
        }
    }

    setSelfState(stateTemplate) {
        this.currentState = stateTemplate;
        const rowCount = stateTemplate.length;
        const columnCount = stateTemplate[0].split(' ').length;

        this.rowHeights = new Array(rowCount).fill('auto');
        this.columnWidths = new Array(columnCount).fill('auto');

        MORPh.updateGridTemplate(this.grid, this.currentState, this.rowHeights, this.columnWidths);
    }
    
    setSelfRowHeight(rowIndex, height) {
        if (rowIndex >= 0 && rowIndex < this.rowHeights.length) {
            this.rowHeights[rowIndex] = height;
            this.grid.style.gridTemplateRows = this.rowHeights.join(' ');
        } else {
            console.warn(`Invalid rowIndex: ${rowIndex}. No changes made.`);
        }
    }

    setSelfColumnWidth(columnIndex, width) {
        if (columnIndex >= 0 && columnIndex < this.columnWidths.length) {
            this.columnWidths[columnIndex] = width;
            this.grid.style.gridTemplateColumns = this.columnWidths.join(' ');
        } else {
            console.warn(`Invalid columnIndex: ${columnIndex}. No changes made.`);
        }
    }

    /**
     * Private method to fetch CSS content from a path and inject it into the <head>.
     * @param {string} cssPath - The path to the CSS file.
     */
    async _injectCSS(cssPath) {
        try {
            const response = await fetch(cssPath);
            if (!response.ok) {
                throw new Error(`Failed to fetch CSS: ${response.statusText}`);
            }

            const cssContent = await response.text();
            this.styleElement = document.createElement('style');
            this.styleElement.type = 'text/css';
            this.styleElement.innerHTML = cssContent;
            document.head.appendChild(this.styleElement);
        } catch (error) {
            console.error(`Error injecting CSS from ${cssPath}:`, error);
        }
    }

    _removeCSS() {
        document.head.removeChild(this.styleElement);
        this.styleElement = null;
    }

    static fetchJSON(url, options = {}) {
        return fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        }).then(response => response.json());
    }
}