import { 
    Pages,
    MORPh,
    Themes, 
} from "./MORPh/Package.js";

Themes.init();
Pages.goPage('dashboard', new MORPh('morph-container'));