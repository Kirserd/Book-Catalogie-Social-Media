import { Component } from "../Package.js";

export default class ExampleComponent extends Component {
    render() {
        this.inner = `<div>Hello, ${this.props.name}!</div>`;
        return this.inner;
    }

    onMount() {
        console.log(`Mounted: ${this.props.name}`);
    }

    onUnmount() {
        console.log(`Unmounted: ${this.props.name}`);
    }
}