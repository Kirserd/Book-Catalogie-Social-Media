//#region ===========[ IMPORTS ]==========================

import { DashboardPage } from './models/pageModels/dashboardPage.js';
import { BookDetailsPage } from './models/pageModels/bookDetailsPage.js';

//#endregion

//#region ===========[ PROPERTIES ]=======================

const pages = {
    dashboard: new DashboardPage(),
    bookDetails: new BookDetailsPage(),
};
  
let currentPage = null;

//#endregion

//#region ===========[ MANAGEMENT ]=======================

function changePage(pageName) {
  const newPage = pages[pageName];
  if (!newPage) return;

  if (currentPage) {
    currentPage.onExit();
  }

  currentPage = newPage;
  currentPage.onEnter();
}

changePage('dashboard');

//#endregion