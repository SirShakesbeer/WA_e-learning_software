/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from "@workadventure/scripting-api-extra";
import { initAreas } from "./areaManager";
import { loadDialogues } from "./dialogueManager";
import { showAchievement } from "./achievement";


console.log('Script started successfully');


// Waiting for the API to be ready
WA.onInit().then(async () => {
    console.log('Scripting API ready');
    console.log('Player tags: ',WA.player.tags)

    await loadDialogues();
    initAreas();

    //Planungsraum - InfoBoard - Level 1
    WA.room.area.onEnter('infoBoard').subscribe(() => {
        WA.ui.modal.openModal({
            title: "UML-Gewächshaus",
            src: "http://localhost:5173/planungsraum-mini-games/uml-info-1.html",
            position: "center",
            allowApi: false,
            allow: null,
            allowFullScreen: false
        });
    });
    

    //Planungsraum - Vererbung - Level 2 (Platzhalter)
    WA.room.area.onEnter('vererbung').subscribe(() => {
        WA.ui.modal.openModal({
            title: "Vererbung 2",
            src: "http://localhost:5173/planungsraum-mini-games/uml-vererbung-2.html",
            position: "center",
            allowApi: false,
            allow: null,
            allowFullScreen: false
        });
    });

    //Planungsraum - Attribute & Methoden - Level 1
    WA.room.area.onEnter('attrimeth').subscribe(() => {
        WA.ui.modal.openModal({
            title: "Attribute & Methoden 1",
            src: "http://localhost:5173/planungsraum-mini-games/uml-attribute-methoden-1.html", 
            position: "center",
            allowApi: false,
            allow: null,
            allowFullScreen: false
        });
    });

    //Planungsraum - Grundgerüst Klassendiagramm - Level 1
    WA.room.area.onEnter('grundge').subscribe(() => {
        WA.ui.modal.openModal({
            title: "Klassendiagramm Grundlagen 1",
            src: "http://localhost:5173/planungsraum-mini-games/uml-grundgeruest-1.html", 
            position: "center",
            allowApi: false,
            allow: null,
            allowFullScreen: false
        });
    });
    
    //Planungsraum - Kunden-Klassendiagramm - Level 1
    WA.room.area.onEnter('klassendia').subscribe(() => {
        WA.ui.modal.openModal({
            title: "Kunden-Klassendiagramm 1",
            src: "http://localhost:5173/planungsraum-mini-games/uml-kundendiagramm-1.html", 
            position: "center",
            allowApi: false,
            allow: null,
            allowFullScreen: false,
        });
    });

    WA.room.area.onLeave('klassendia').subscribe(() => {
        showAchievement("klassendiagramm");
    })

    // The line below bootstraps the Scripting API Extra library that adds a number of advanced properties/features to WorkAdventure
    bootstrapExtra().then(() => {
        console.log('Scripting API Extra ready');
    }).catch(e => console.error(e));

}).catch(e => console.error(e));


export {};
