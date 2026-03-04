import { startConversation, currentArea, setCurrentArea, continueConversation } from "./dialogueManager";

const chatZones = ['HerrHolze', 'Kaktus', 'HerrTöpfner', 'Waldmann', 'WaldmannGit'];
const triggerZones = ['Kaktus-trigger', 'Waldmann-trigger'];

export function initAreas() {
    for (const chatZone of chatZones) {
        try{
            WA.room.area.onEnter(chatZone).subscribe(() => {
                setCurrentArea(chatZone);
                WA.chat.open();
                startConversation(chatZone, { once: false }); // Mehrfaches Gespräch möglich
            });

            WA.room.area.onLeave(chatZone).subscribe(() => {
                WA.chat.close();
            });
        } catch {
            console.log(`Error: ${chatZone} ist nicht in chatZones definiert oder falsch geschrieben.`)
            continue
        }
    }

    for (const triggerZone of triggerZones) {
        try {
            WA.room.area.onEnter(triggerZone).subscribe(async () => {
                const wasPlayed = await WA.player.state.loadVariable(`trigger_played_${triggerZone}`);
                if (!wasPlayed) {
                    setCurrentArea(triggerZone);
                    WA.chat.open();
                    await startConversation(triggerZone, { once: true }); // Nur einmal
                    await WA.player.state.saveVariable(`trigger_played_${triggerZone}`, true, {
                        public: false,
                        persist: true,
                        scope: "world"
                    });
                }
            });

            WA.room.area.onLeave(triggerZone).subscribe(() => {
                WA.chat.close();
            });
        } catch {
            console.log(`Error: ${triggerZone} ist nicht in triggerZones definiert oder falsch geschrieben.`);
        }
    }

    WA.chat.onChatMessage(async (message) => {
        if (!currentArea.value) return;
        await continueConversation(message);
    });
}
