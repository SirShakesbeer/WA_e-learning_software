/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from "@workadventure/scripting-api-extra";

import { initAreas } from "./areaManager";
import { loadDialogues } from "./dialogueManager";


console.log('Script started successfully');


// Waiting for the API to be ready
WA.onInit().then(async () => {
    console.log('Scripting API ready');
    console.log('Player tags: ',WA.player.tags)

    await loadDialogues();
    initAreas();

    WA.room.area.onEnter('noWay').subscribe(() => {
        WA.chat.open();
        WA.chat.sendChatMessage('Du solltest lieber Arbeiten gehen, es ist zu früh für Feierabend', {scope: 'local'});
        /*
        currentPopup = WA.ui.openPopup("noWayPopup", "Du solltest lieber Arbeiten gehen, es ist zu früh für Feierabend", []);
        WA.room.area.onLeave('noWay').subscribe(closePopup)
        */
    })
    WA.room.area.onLeave('noWay').subscribe(() => {
        WA.chat.close();
    })
    

    //Versuch eine Pflanze zum sprechen zu bringen
    WA.room.area.onEnter('susPlant').subscribe(() => {
        WA.chat.open();
        WA.chat.sendChatMessage('Du fühlst dich beobachtet?', {scope: 'local'});
    })
    WA.room.area.onLeave('susPlant').subscribe(() => {
        WA.chat.close();
    })

//Lables fuer Tueren
    WA.room.area.onEnter('roomLable1').subscribe(() => {
        WA.chat.open();
        WA.chat.sendChatMessage('Hier steht welches Zimmer es ist', {scope: 'local'});
    })
    WA.room.area.onLeave('roomLable1').subscribe(() => {
        WA.chat.close();
    })


    WA.room.area.onEnter('roomLable2').subscribe(() => {
        WA.chat.open();
        WA.chat.sendChatMessage('Hier steht welches Zimmer es ist', {scope: 'local'});
    })
    WA.room.area.onLeave('roomLable2').subscribe(() => {
        WA.chat.close();
    })


    WA.room.area.onEnter('roomLable3').subscribe(() => {
        WA.chat.open();
        WA.chat.sendChatMessage('Hier steht welches Zimmer es ist', {scope: 'local'});
    })
    WA.room.area.onLeave('roomLable3').subscribe(() => {
        WA.chat.close();
    })

    // The line below bootstraps the Scripting API Extra library that adds a number of advanced properties/features to WorkAdventure
    bootstrapExtra().then(() => {
        console.log('Scripting API Extra ready');
    }).catch(e => console.error(e));

}).catch(e => console.error(e));

export {};
