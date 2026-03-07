import { bootstrapExtra } from "@workadventure/scripting-api-extra";
import { initAreas } from "./managers/areaManager";
import { loadDialogues } from "./managers/dialogueManager";
import { initializeLanguagePreferenceUi } from "./ui/languagePreference";

export async function initializeSharedSystems(): Promise<void> {
    await initializeLanguagePreferenceUi();
    await loadDialogues();
    initAreas();
}

export async function bootstrapScriptingApiExtra(): Promise<void> {
    try {
        await bootstrapExtra();
        console.log("Scripting API Extra ready");
    } catch (error) {
        console.error(error);
    }
}
