/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapScriptingApiExtra, initializeSharedSystems } from "./sharedInit";


console.log('Script started successfully');


// Waiting for the API to be ready
WA.onInit().then(async () => {
    console.log('Scripting API ready');
    console.log('Player tags: ',WA.player.tags)

    await initializeSharedSystems();
    await bootstrapScriptingApiExtra();

}).catch(e => console.error(e));

export {};
