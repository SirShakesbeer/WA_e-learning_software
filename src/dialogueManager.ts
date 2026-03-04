let dialogueData: Record<string, any> = {};
export const currentArea = { value: "" };

export function setCurrentArea(area: string) {
    currentArea.value = area;
}

export async function loadDialogues() {
    try {
        const response = await fetch('/dialogue/dialogue.json');
        dialogueData = await response.json();
        console.log('Dialogues loaded:', dialogueData);
    } catch (error) {
        console.error('Failed to load dialogue JSON:', error);
    }
}

export async function startConversation(areaName: string, options: { once: boolean }) {
    const dialogue = dialogueData[areaName];
    if (!dialogue || !dialogue.start) {
        WA.chat.sendChatMessage("This character doesn't want to talk right now.");
        return;
    }

    const key = `dialogue_${areaName}`;
    let currentNodeKey = options.once ? "start" : (await WA.player.state.loadVariable(key)) as string;

    if (!currentNodeKey || !dialogue[currentNodeKey]) {
        currentNodeKey = "start";
        if (!options.once) {
            await WA.player.state.saveVariable(key, currentNodeKey, {
                public: false,
                persist: true,
                ttl: 24 * 3600,
                scope: "world"
            });
        }
    }

    const currentNode = dialogue[currentNodeKey];
    WA.chat.sendChatMessage(currentNode.message, { scope: 'bubble' });
}

export async function continueConversation(message: string) {
    const area = currentArea.value;
    const key = `dialogue_${area}`;
    const dialogue = dialogueData[area];
    const currentNodeKey = (await WA.player.state.loadVariable(key)) as string | undefined;

    if (!currentNodeKey || !dialogue?.[currentNodeKey]?.options) return;

    const nextKey = dialogue[currentNodeKey].options[message.toLowerCase()];
    if (!nextKey || !dialogue[nextKey]) {
        WA.chat.sendChatMessage("Sorry, I didn’t understand that. Try something else.");
        return;
    }

    await WA.player.state.saveVariable(key, nextKey, {
        public: false,
        persist: true,
        scope: "world"
    });

    WA.chat.sendChatMessage(dialogue[nextKey].message, { scope: 'bubble' });
}
