/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from "@workadventure/scripting-api-extra";
import { createBoxes, destroyBoxesByType, boxes, CorrectBox, BuggyBox, PushCommitBox } from "./pushBox";
import { initTargetArea } from "./targetZoneManager";
import { initAreas } from "./areaManager";
import { loadDialogues } from "./dialogueManager";
import { showAchievement } from "./achievement";

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

// Waiting for the API to be ready
WA.onInit().then(async () => {
    console.log('Scripting API ready');
    console.log('Player tags: ',WA.player.tags)

    await loadDialogues();
    initAreas();
    
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

    // The line below bootstraps the Scripting API Extra library that adds a number of advanced properties/features to WorkAdventure
    bootstrapExtra().then(() => {
        console.log('Scripting API Extra ready');
    }).catch(e => console.error(e));

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

    // ► Prüfen: liegt irgendeine Buggy‑Box in der Zone?
    const buggyInStage = staged.some(b => b instanceof BuggyBox);
    if (buggyInStage) {
        displayFeedback("Buggy box is staged, remove it before committing.");
        return;
    }

    // ► Sind ALLE Correct‑Boxen reingeschoben?
    const allCorrectBoxes     = boxes.filter((b): b is CorrectBox => b instanceof CorrectBox);
    const stagedCorrectBoxes  = staged.filter((b): b is CorrectBox => b instanceof CorrectBox);

    if (allCorrectBoxes.length > 0 && stagedCorrectBoxes.length === allCorrectBoxes.length) {
        destroyBoxesByType("CorrectBox");
        createBoxes(PushCommitN, PushCommitX, PushCommitY, undefined, true);
    } else if (stagedCorrectBoxes.length < allCorrectBoxes.length) {
        displayFeedback("Not all correct boxes are staged.");
    }
}

function checkPushCommitZone() {
    // ► Sind ALLE Boxen in der Push-Commit-Zone?
    if (!pushCommitZone) return;

    const pushed = pushCommitZone.getBoxesInside();

    const allCommitBoxes = boxes.filter((b): b is PushCommitBox => b instanceof PushCommitBox);
    if (allCommitBoxes.length > 0 && pushed.length === allCommitBoxes.length) {
        destroyBoxesByType("PushCommitBox");
        showAchievement("fertigerroboter");
    } else if (pushed.length < allCommitBoxes.length) {
        displayFeedback("Not all boxes are pushed to the commit zone.");
    }
}

function displayFeedback(message: string) {
    WA.ui.displayActionMessage({
        message: message,
        callback: () => {}
    });
}

export {};