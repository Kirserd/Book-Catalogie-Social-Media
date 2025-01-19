import { 
    Pages,
    MORPh,
    Themes, 
} from "./MORPh/Package.js";

Themes.init();
const orchestrator = new MORPh('morph-container');
Pages.goPage('dashboard', orchestrator);
