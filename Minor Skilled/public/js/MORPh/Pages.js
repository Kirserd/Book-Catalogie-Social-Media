import { 
    ExampleComponent, 
    MiniSearchComponent, 
    ProfileComponent,
    FeedComponent,
    FriendsComponent
} from "./Package.js";

export default class Pages{
    static currentPage = 'none';

    static goPage(page, orchestrator){
        var valid = true;
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
        
        setTimeout(() => orchestrator.addComponent('a', new ProfileComponent({}), false), 300);
        setTimeout(() => orchestrator.addComponent('b', new MiniSearchComponent({}), false), 600);
        setTimeout(() => orchestrator.addComponent('c', new FeedComponent({}), false), 900);
        setTimeout(() => orchestrator.addComponent('d', new FriendsComponent({}), false), 1200);
    }
    static bookDetailsToDashboard(orchestrator){ 
        console.log("=========================================\n" 
                  + " Book Details >> Dashboard | Morphing... \n"
                  + "=========================================\n");

        var a = orchestrator.getComponent('a').instance;
        var b = orchestrator.getComponent('b').instance;
        var c = orchestrator.getComponent('c').instance;
        var d = orchestrator.getComponent('d').instance;

        setTimeout(() => orchestrator.addComponent('a', new ProfileComponent({})), 200);
        setTimeout(() => orchestrator.addComponent('b', new MiniSearchComponent({})), 400);
        setTimeout(() => orchestrator.addComponent('c', new FeedComponent({})), 200);
        setTimeout(() => orchestrator.addComponent('d', new FriendsComponent({})), 800);

        orchestrator.setState([
            '. ay ay ay .',
            'ax a b c zx', 
            'ax a d d zx',
            'ax a d d zx',
            '. zy zy zy .'
        ]);

        //TODO: intermediate steps

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
        }, 2200);
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
    
        setTimeout(() => orchestrator.addComponent('a', new ExampleComponent({name: 'BookInfo'})), 800);
        setTimeout(() => orchestrator.addComponent('b', new ExampleComponent({name: 'Ratings'})), 200);
        setTimeout(() => orchestrator.addComponent('c', new ExampleComponent({name: 'Notes'})), 400);
        setTimeout(() => orchestrator.addComponent('d', new ExampleComponent({name: 'Social'})), 600);
    
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
            b.setSelfRowHeight(1, '40vh');
            b.setSelfRowHeight(2, '25vh');
            b.setSelfRowHeight(3, '25vh');
    
            c.setSelfRowHeight(1, '0vh');
            c.setSelfRowHeight(2, '20vh');
            c.setSelfRowHeight(3, '20vh');
    
            d.setSelfRowHeight(1, '20vh');
            d.setSelfRowHeight(2, '20vh');
            d.setSelfRowHeight(3, '50vh');
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
            orchestrator.setRowHeight(0, '40vh');
            orchestrator.setColumnWidth(0, '22vw'); 
            orchestrator.setRowHeight(1, '25vh');  
            orchestrator.setColumnWidth(1, '22vw');  
            orchestrator.setRowHeight(2, '25vh'); 
            orchestrator.setColumnWidth(2, '22vw');
    
            console.log("======================================\n" 
                      + " Dashboard >> Book Details | Complete \n"
                      + "======================================\n");
        }, 2200);
    }
}