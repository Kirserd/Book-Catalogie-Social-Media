//import { ProfileComponent } from '..profileComponent.js';
//import { MiniExploreComponent } from '..miniExploreComponent.js';
//import { HomeComponent } from '..homeComponent.js';
import { SocialsComponent } from '../componentModels/socialsComponent.js';

import { Page } from './page.js';

export class DashboardPage extends Page {
    constructor() {
      super('Dashboard');
      //this.addComponent(new ProfileComponent('A'));
      //this.addComponent(new MiniExploreComponent('B'));
      //this.addComponent(new HomeComponent('C'));
      this.addComponent(new SocialsComponent('friend-management', 'D'));
    }
}