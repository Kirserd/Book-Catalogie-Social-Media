  import { 
    ExampleComponent, 
    MiniSearchComponent, 
    ProfileComponent,
    FeedComponent,
    FriendsComponent,
    BookInfoComponent,
    BookDescComponent,
    NotesComponent,
    BookSocialComponent,
    ExploreComponent
} from "./Package.js";

export default class Pages{
    static currentPage = 'none';
    static subPage = 'none';
    static active = false;

    static goPage(page, orchestrator){
        if(Pages.active)
            return;

        var valid = true;
        Pages.active = true;
        switch(page){
            case 'dashboard':
                if(Pages.currentPage === 'bookDetails')
                    Pages.bookDetailsToDashboard(orchestrator);
                else
                    Pages.noneToDashboard(orchestrator);
                break;
            case 'bookDetails':
                if(Pages.currentPage === 'dashboard')
                    Pages.dashboardToBookDetails(orchestrator);
                break;
            default:
                valid = false;
                break;
        }
        if(valid)
            Pages.currentPage = page;
    }

    static noneToDashboard(orchestrator){
        setTimeout(() => orchestrator.addComponent('a', new ProfileComponent({}), false), 500);
        setTimeout(() => orchestrator.addComponent('b', new MiniSearchComponent({}), false),800);
        setTimeout(() => orchestrator.addComponent('c', new FeedComponent({}), false), 1100);
        setTimeout(() => orchestrator.addComponent('d', new FriendsComponent({}), false), 1400);

        orchestrator.setState([
            'a b b', 
            'a c c',
            'd c c'
        ]);
        orchestrator.setRowHeight(0, '18vh');
        orchestrator.setColumnWidth(0, '22vw'); 
        orchestrator.setRowHeight(1, '18vh');  
        orchestrator.setColumnWidth(1, '22vw');  
        orchestrator.setRowHeight(2, '54vh'); 
        orchestrator.setColumnWidth(2, '22vw'); 
        
        Pages.active = false;
    }
    static bookDetailsToDashboard(orchestrator){
        setTimeout(() => orchestrator.addComponent('a', new ProfileComponent()), 200);
        setTimeout(() => orchestrator.addComponent('b', new MiniSearchComponent()), 400);
        setTimeout(() => orchestrator.addComponent('c', (Pages.subPage === 'explore'? new ExploreComponent() : new FeedComponent())), 600);
        setTimeout(() => orchestrator.addComponent('d', new FriendsComponent()), 800);

        console.log("=========================================\n" 
                  + " Book Details >> Dashboard | Morphing... \n"
                  + "=========================================\n");

        var a = orchestrator.getComponent('a').instance;
        var b = orchestrator.getComponent('b').instance;
        var c = orchestrator.getComponent('c').instance;
        var d = orchestrator.getComponent('d').instance;

        orchestrator.setState([
            '. ay ay ay .',
            'ax a b c zx', 
            'ax a d d zx',
            'ax a d d zx',
            '. zy zy zy .'
        ]);
        orchestrator.setRowHeight(0, '0vh');
        orchestrator.setColumnWidth(0, '0vw'); 
    
        orchestrator.setRowHeight(1, '50vh');
        orchestrator.setColumnWidth(1, '22vw'); 
        orchestrator.setRowHeight(2, '20vh');  
        orchestrator.setColumnWidth(2, '22vw');  
        orchestrator.setRowHeight(3, '20vh'); 
        orchestrator.setColumnWidth(3, '22vw');
        
        orchestrator.setRowHeight(4, '0vh'); 
        orchestrator.setColumnWidth(4, '0vw');

        setTimeout(() => {
            a.setSelfRowHeight(1, '36vh');
            a.setSelfRowHeight(2, '0vh');
            a.setSelfRowHeight(3, '0vh');
            a.setSelfRowHeight(4, '54vh');
        }, 300);

        setTimeout(() => {
            b.setSelfRowHeight(1, '18vh');
            b.setSelfRowHeight(2, '18vh');
            b.setSelfRowHeight(3, '36vh'); 

            c.setSelfRowHeight(0, '18vh');
            c.setSelfRowHeight(1, '18vh');
            c.setSelfRowHeight(2, '54vh');
    
            d.setSelfRowHeight(0, '18vh');
            d.setSelfRowHeight(1, '18vh');
            d.setSelfRowHeight(2, '27vh');
            d.setSelfRowHeight(3, '27vh');
        }, 600);

        setTimeout(() => {
            b.setSelfColumnWidth(1, '22vw');
            b.setSelfColumnWidth(2, '44vw');
            b.setSelfColumnWidth(3, '0vw');

            c.setSelfColumnWidth(1, '22vw');
            c.setSelfColumnWidth(2, '0vw');
            c.setSelfColumnWidth(3, '44vw');

            d.setSelfColumnWidth(0, '0vw');
            d.setSelfColumnWidth(1, '0vw');
            d.setSelfColumnWidth(2, '22vw');
            d.setSelfColumnWidth(3, '0vw');
        }, 900);

        setTimeout(() => {
            c.setSelfRowHeight(1, '72vh');
            c.setSelfRowHeight(2, '0vh');
        }, 1200);

        setTimeout(() => {
            orchestrator.setState([
                'a b b', 
                'a c c',
                'd c c'
            ]);
            orchestrator.setRowHeight(0, '18vh');
            orchestrator.setColumnWidth(0, '22vw'); 
            orchestrator.setRowHeight(1, '18vh');  
            orchestrator.setColumnWidth(1, '22vw');  
            orchestrator.setRowHeight(2, '54vh'); 
            orchestrator.setColumnWidth(2, '22vw'); 
    
            console.log("======================================\n" 
                      + " Book Details >> Dashboard | Complete \n"
                      + "======================================\n");
                              
            Pages.active = false;
        }, 1600);
    }

    static dashboardToBookDetails(orchestrator){
        console.log("=========================================\n" 
                  + " Dashboard >> Book Details | Morphing... \n"
                  + "=========================================\n");
    
        var a = orchestrator.getComponent('a').instance;
        var b = orchestrator.getComponent('b').instance;
        var c = orchestrator.getComponent('c').instance;
        var d = orchestrator.getComponent('d').instance;
    
        orchestrator.setState([
            '. ay ay ay .',
            'ax a b b zx', 
            'ax a c c zx',
            'ax d c c zx',
            '. zy zy zy .'
        ]);
        orchestrator.setRowHeight(0, '0vh');
        orchestrator.setColumnWidth(0, '0vw'); 
    
        orchestrator.setRowHeight(1, '18vh');
        orchestrator.setColumnWidth(1, '22vw'); 
        orchestrator.setRowHeight(2, '18vh');  
        orchestrator.setColumnWidth(2, '22vw');  
        orchestrator.setRowHeight(3, '54vh'); 
        orchestrator.setColumnWidth(3, '22vw'); 
        
        orchestrator.setRowHeight(4, '0vh'); 
        orchestrator.setColumnWidth(4, '0vw'); 
    
        setTimeout(() => orchestrator.addComponent('a', new BookInfoComponent()), 800);
        setTimeout(() => orchestrator.addComponent('b', new BookDescComponent()), 200);
        setTimeout(() => orchestrator.addComponent('c', new NotesComponent()), 400);
        setTimeout(() => orchestrator.addComponent('d', new BookSocialComponent()), 600);
    
        setTimeout(() => {
            b.setSelfColumnWidth(1, '22vw');
            b.setSelfColumnWidth(2, '22vw');
            b.setSelfColumnWidth(3, '0vw');
    
            c.setSelfColumnWidth(1, '44vw');
            c.setSelfColumnWidth(2, '0vw');
            c.setSelfColumnWidth(3, '22vw');
    
            d.setSelfColumnWidth(1, '44vw');
            d.setSelfColumnWidth(2, '0vw');
            d.setSelfColumnWidth(3, '22vw');
        }, 300);
    
        setTimeout(() => {
            b.setSelfRowHeight(1, '50vh');
            b.setSelfRowHeight(2, '20vh');
            b.setSelfRowHeight(3, '20vh');
    
            c.setSelfRowHeight(1, '0vh');
            c.setSelfRowHeight(2, '25vh');
            c.setSelfRowHeight(3, '25vh');
    
            d.setSelfRowHeight(1, '25vh');
            d.setSelfRowHeight(2, '25vh');
            d.setSelfRowHeight(3, '40vh');
        }, 600);
    
        setTimeout(() => {
            d.setSelfColumnWidth(0, '22vw');
            d.setSelfColumnWidth(1, '44vw');
            d.setSelfColumnWidth(3, '0vw');
        }, 900);
    
        setTimeout(() => {
            a.setSelfRowHeight(1, '45vh');
            a.setSelfRowHeight(2, '45vh');
            a.setSelfRowHeight(3, '0vw');
        }, 1200);
    
        setTimeout(() => {
            orchestrator.setState([
                'a b c', 
                'a d d',
                'a d d'
            ]);
            orchestrator.setRowHeight(0, '50vh');
            orchestrator.setColumnWidth(0, '22vw'); 
            orchestrator.setRowHeight(1, '20vh');  
            orchestrator.setColumnWidth(1, '22vw');  
            orchestrator.setRowHeight(2, '20vh'); 
            orchestrator.setColumnWidth(2, '22vw');
    
            console.log("======================================\n" 
                      + " Dashboard >> Book Details | Complete \n"
                      + "======================================\n");
                           
            Pages.active = false;
        }, 1600);
    }
}