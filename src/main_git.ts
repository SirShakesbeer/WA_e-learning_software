/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapScriptingApiExtra, initializeSharedSystems } from "./sharedInit";
import { createBoxes, destroyBoxesByType, getBoxes } from "./gameplay/pushBox";
import { evaluateBoxRules, failIfZoneContainsKind, initTargetArea, requireAllOfKindInZone } from "./managers/targetZoneManager";
import { showAchievement } from "./ui/achievement";

console.log('Script started successfully');

//let currentPopup: any = undefined;

const testN = 2;
const testX = 10;
const testY = 5;

const gitN = 5;
const gitX = 10;
const gitY = 13;

const PushCommitN = 1;
const PushCommitX = 21;
const PushCommitY = 14;

const commitZone = await initTargetArea("commitZone");
const pushCommitZone = await initTargetArea("pushCommitZone");

const commitRules = [
    failIfZoneContainsKind("buggy", "Buggy box is staged, remove it before committing."),
    requireAllOfKindInZone("correct", "Not all correct boxes are staged."),
];

const pushCommitRules = [
    requireAllOfKindInZone("pushCommit", "Not all boxes are pushed to the commit zone."),
];

// Waiting for the API to be ready
WA.onInit().then(async () => {
    console.log('Scripting API ready');
    console.log('Player tags: ',WA.player.tags)

    await initializeSharedSystems();
    
    WA.room.area.onEnter('pc').subscribe(() => {
        /*
        currentPopup = WA.ui.openPopup("pcPopup", "AAAAAAAAAA", []);
        console.log('hallo');
        */
        WA.ui.modal.openModal({
            title: "Git Guide",
            src: 'https://git-scm.com/docs/git-add',
            allow: "geolocation",
            allowApi: true,
            position: "center",
            allowFullScreen: false
        });
    })

    await createBoxes(testN, testX, testY);
    await createBoxes(gitN, gitX, gitY, 0);

    WA.room.area.onEnter("buttonPressZone").subscribe(() => {
        checkCommitZone();
    });

    WA.room.area.onEnter("buttonPushCommitZone").subscribe(() => {
        checkPushCommitZone();
    });

    await bootstrapScriptingApiExtra();

}).catch(e => console.error(e));

/*
function closePopup(){
    if (currentPopup !== undefined) {
        currentPopup.close();
        currentPopup = undefined;
    }
    console.log('tschaui');
}
*/

function checkCommitZone() {
    if (!commitZone) return;

    // ► alle Boxen, die aktuell *in der Zone* stehen
    const staged = commitZone.getBoxesInside();

    const ruleResult = evaluateBoxRules({ allBoxes: getBoxes(), zoneBoxes: staged }, commitRules);
    if (!ruleResult.isValid) {
        if (ruleResult.message) {
            displayFeedback(ruleResult.message);
        }
        return;
    }

    destroyBoxesByType("correct");
    createBoxes(PushCommitN, PushCommitX, PushCommitY, undefined, true);
}

function checkPushCommitZone() {
    // ► Sind ALLE Boxen in der Push-Commit-Zone?
    if (!pushCommitZone) return;

    const pushed = pushCommitZone.getBoxesInside();

    const ruleResult = evaluateBoxRules({ allBoxes: getBoxes(), zoneBoxes: pushed }, pushCommitRules);
    if (!ruleResult.isValid) {
        if (ruleResult.message) {
            displayFeedback(ruleResult.message);
        }
        return;
    }

    destroyBoxesByType("pushCommit");
    showAchievement("fertigerroboter");
}

function displayFeedback(message: string) {
    WA.ui.displayActionMessage({
        message: message,
        callback: () => {}
    });
}

export {};