import { onStart as themeStart } from '../../theme.js';
import { Component } from '../componentModels/component.js';

export class Page {

  #subscribersOnEnter = [];
  #subscribersOnExit = [];
  #isActive = false; 

  #target = document.getElementById('injection-target');

  constructor(name) {
    this.name = name;
    this.onEnterDelegate(() => {
        themeStart();
    });
  }

  addComponent(component){
    if (!(component instanceof Component)) {
      throw new TypeError('Argument must be an instance of Component.');
    }

    this.onEnterDelegate(() => {
      component.start();
    });
    this.onExitDelegate(() => {
      component.exit();
    });
  }

  /**
   * Subscribes a callback to the onEnter event.
   * @param {Function} callback - Function to execute when the page enters.
   */
  onEnterDelegate(callback) {
    if (typeof callback === 'function') {
      this.#subscribersOnEnter.push(callback);
    } else {
      console.error('subscribeOnEnter expects a function.');
    }
  }
  /**
   * Subscribes a callback to the onExit event.
   * @param {Function} callback - Function to execute when the page exits.
   */
  onExitDelegate(callback) {
    if (typeof callback === 'function') {
      this.#subscribersOnExit.push(callback);
    } else {
      console.error('subscribeOnExit expects a function.');
    }
  }

  /**
   * Triggers the onEnter event for all subscribers.
   */
  onEnter() {
    if (this.#isActive) return;

    this.#target.innerHTML = `<div id="${this.name}" class="page"></div>`;

    this.#isActive = true;
    this.#subscribersOnEnter.forEach(callback => callback());
  }
  /**
   * Triggers the onExit event for all subscribers.
   */
  onExit() {
    if (!this.#isActive) return;

    let pageHTML = document.getElementById(this.name);
    pageHTML.classList.add("fade-out-anim");

    this.#isActive = false;
    this.#subscribersOnExit.forEach(callback => callback());
  }
}