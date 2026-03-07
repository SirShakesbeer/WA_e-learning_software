/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapScriptingApiExtra, initializeSharedSystems } from "./sharedInit";
import { showAchievement } from "./ui/achievement";
import { resolvePublicUrl } from "./ui/publicUrl";
import { ProgressOverlay } from "./ui/progressOverlay";


console.log('Script started successfully');

type MiniGame = {
    area: string;
    title: string;
    relativePath: string;
};

type LevelConfig = {
    id: number;
    label: string;
    achievement: string;
    achievementArea: string;
    miniGames: MiniGame[];
};

const levels: LevelConfig[] = [
    {
        id: 1,
        label: 'Level 1',
        achievement: 'klassendiagramm',
        achievementArea: 'infoBoard',
        miniGames: [
            { area: 'infoBoard', title: 'UML-Gewächshaus 1', relativePath: 'planungsraum-mini-games/uml-info-1.html' },
            { area: 'attrimeth', title: 'Attribute & Methoden 1', relativePath: 'planungsraum-mini-games/uml-attribute-methoden-1.html' },
            { area: 'grundge', title: 'Klassendiagramm Grundlagen 1', relativePath: 'planungsraum-mini-games/uml-grundgeruest-1.html' },
            { area: 'klassendia', title: 'Kunden-Klassendiagramm 1', relativePath: 'planungsraum-mini-games/uml-kundendiagramm-1.html' },
        ],
    },
    {
        id: 2,
        label: 'Level 2',
        achievement: 'klassendiagramm_level2',
        achievementArea: 'infoBoard',
        miniGames: [
            { area: 'infoBoard', title: 'UML-Gewächshaus 2', relativePath: 'planungsraum-mini-games/uml-info-2.html' },
            { area: 'vererbung', title: 'Vererbung 2', relativePath: 'planungsraum-mini-games/uml-vererbung-2.html' },
            { area: 'aggrekompo', title: 'Aggregation & Komposition 2', relativePath: 'planungsraum-mini-games/uml-aggregation-komposition-2.html' },
            { area: 'interface', title: 'Interface 2', relativePath: 'planungsraum-mini-games/uml-interface-2.html' },
            { area: 'attrimeth', title: 'Attribute & Methoden 2', relativePath: 'planungsraum-mini-games/uml-attribute-methoden-2.html' },
            { area: 'klassendia', title: 'Kunden-Klassendiagramm 2', relativePath: 'planungsraum-mini-games/uml-kundendiagramm-2.html' },
        ],
    },
];

const progressVariablePrefix = 'planung_progress';

let currentLevelIndex = 0;
let completedMiniGames = new Set<string>();
const progressOverlay = new ProgressOverlay();
const claimedAchievementsInSession = new Set<number>();

const interactiveAreas = new Set<string>(
    levels.flatMap((level) => [level.achievementArea, ...level.miniGames.map((miniGame) => miniGame.area)])
);
const miniGameAreaArmed = new Set<string>(interactiveAreas);

function sleep(ms: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function getLevelCompletedVariable(levelId: number): string {
    return `${progressVariablePrefix}_level_${levelId}_completed`;
}

function getCurrentLevel(): LevelConfig {
    return levels[Math.min(Math.max(currentLevelIndex, 0), levels.length - 1)];
}

function isCurrentLevelComplete(): boolean {
    const currentLevel = getCurrentLevel();
    return currentLevel.miniGames.length > 0 && completedMiniGames.size === currentLevel.miniGames.length;
}

async function renderProgressOverlay() {
    const currentLevel = getCurrentLevel();
    await progressOverlay.render({
        done: completedMiniGames.size,
        total: currentLevel.miniGames.length,
        level: currentLevel.id,
        levelLabel: currentLevel.label,
        totalLevels: levels.length,
    });
}

async function markMiniGameCompleted(miniGameArea: string) {
    if (completedMiniGames.has(miniGameArea)) {
        return;
    }

    completedMiniGames.add(miniGameArea);
}

function findMiniGameForCurrentLevel(area: string): MiniGame | undefined {
    const currentLevel = getCurrentLevel();
    return currentLevel.miniGames.find((miniGame) => miniGame.area === area);
}

function resetLevelProgress() {
    completedMiniGames = new Set<string>();
}

async function claimCurrentLevelAchievementIfReady(area: string): Promise<boolean> {
    const currentLevel = getCurrentLevel();
    if (area !== currentLevel.achievementArea) {
        return false;
    }

    if (!isCurrentLevelComplete()) {
        return false;
    }

    if (claimedAchievementsInSession.has(currentLevel.id)) {
        return false;
    }

    claimedAchievementsInSession.add(currentLevel.id);

    await WA.player.state.saveVariable(getLevelCompletedVariable(currentLevel.id), true, {
        public: false,
        persist: true,
        scope: 'world',
    });

    await sleep(200);
    await showAchievement(currentLevel.achievement);

    const hasNextLevel = currentLevelIndex < levels.length - 1;
    if (hasNextLevel) {
        currentLevelIndex += 1;
        resetLevelProgress();
        await renderProgressOverlay();
    }

    return true;
}

function openMiniGame(miniGame: MiniGame) {
    if (completedMiniGames.has(miniGame.area)) {
        return;
    }

    if (!miniGameAreaArmed.has(miniGame.area)) {
        return;
    }

    miniGameAreaArmed.delete(miniGame.area);

    WA.ui.modal.openModal({
        title: miniGame.title,
        src: resolvePublicUrl(miniGame.relativePath),
        position: 'center',
        allowApi: false,
        allow: null,
        allowFullScreen: false,
    }, async () => {
        await markMiniGameCompleted(miniGame.area);
        await renderProgressOverlay();
    });
}

async function handleAreaEnter(area: string) {
    const claimed = await claimCurrentLevelAchievementIfReady(area);
    if (claimed) {
        return;
    }

    const miniGame = findMiniGameForCurrentLevel(area);
    if (!miniGame) {
        return;
    }

    openMiniGame(miniGame);
}


// Waiting for the API to be ready
WA.onInit().then(async () => {
    console.log('Scripting API ready');
    console.log('Player tags: ',WA.player.tags)

    await initializeSharedSystems();

    currentLevelIndex = 0;
    resetLevelProgress();
    await renderProgressOverlay();

    for (const area of interactiveAreas) {
        WA.room.area.onEnter(area).subscribe(() => {
            void handleAreaEnter(area);
        });

        WA.room.area.onLeave(area).subscribe(() => {
            miniGameAreaArmed.add(area);
        });
    }

    await bootstrapScriptingApiExtra();

}).catch(e => console.error(e));


export {};
