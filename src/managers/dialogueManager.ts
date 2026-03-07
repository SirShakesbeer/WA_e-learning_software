import dialogueJson from "../../public/dialogue/dialogue.json";
import dialogueEnJson from "../../public/dialogue/dialogue.en.json";
import { getPreferredLanguage } from "../ui/languagePreference";

let dialogueData: Record<string, any> = dialogueJson as Record<string, any>;
export const currentArea = { value: "" };

async function getLocalizedDialogueData() {
    const preferredLanguage = await getPreferredLanguage();
    const data = (preferredLanguage === "en" ? dialogueEnJson : dialogueJson) as Record<string, any>;
    return {
        data,
        language: preferredLanguage ?? "de",
    };
}

export function setCurrentArea(area: string) {
    currentArea.value = area;
}

export async function loadDialogues() {
    try {
        const localized = await getLocalizedDialogueData();
        dialogueData = localized.data;
        console.log('Dialogues loaded:', dialogueData);
    } catch (error) {
        console.error('Failed to load dialogue JSON:', error);
    }
}

export async function startConversation(areaName: string, options: { once: boolean }) {
    const localized = await getLocalizedDialogueData();
    const dialogueDataForLanguage = localized.data;
    const language = localized.language;
    const dialogue = dialogueDataForLanguage[areaName];
    if (!dialogue || !dialogue.start) {
        WA.chat.sendChatMessage(
            language === "en"
                ? "This character doesn't want to talk right now."
                : "Dieser Charakter moechte gerade nicht sprechen."
        );
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
    const localized = await getLocalizedDialogueData();
    const dialogueDataForLanguage = localized.data;
    const language = localized.language;
    const area = currentArea.value;
    const key = `dialogue_${area}`;
    const dialogue = dialogueDataForLanguage[area];
    const currentNodeKey = (await WA.player.state.loadVariable(key)) as string | undefined;

    if (!currentNodeKey || !dialogue?.[currentNodeKey]?.options) return;

    const nextKey = dialogue[currentNodeKey].options[message.toLowerCase()];
    if (!nextKey || !dialogue[nextKey]) {
        WA.chat.sendChatMessage(
            language === "en"
                ? "Sorry, I didn't understand that. Try something else."
                : "Entschuldigung, das habe ich nicht verstanden. Versuche etwas anderes."
        );
        return;
    }

    await WA.player.state.saveVariable(key, nextKey, {
        public: false,
        persist: true,
        scope: "world"
    });

    WA.chat.sendChatMessage(dialogue[nextKey].message, { scope: 'bubble' });
}
