import { resolvePublicUrl } from "./publicUrl";

type PlayerLanguage = "de" | "en";

const LANGUAGE_VARIABLE_KEY = "preferredLanguage";
const LANGUAGE_TTL_SECONDS = 24 * 3600;
const LANGUAGE_UI_URL = "ui/language-switcher.html";

let languageWebsite: Awaited<ReturnType<typeof WA.ui.website.open>> | undefined;

function isPlayerLanguage(value: unknown): value is PlayerLanguage {
    return value === "de" || value === "en";
}

export async function getPreferredLanguage(): Promise<PlayerLanguage | undefined> {
    const preferredLanguage = await WA.player.state.loadVariable(LANGUAGE_VARIABLE_KEY);
    if (!isPlayerLanguage(preferredLanguage)) {
        return undefined;
    }

    return preferredLanguage;
}

export async function setPreferredLanguage(language: PlayerLanguage): Promise<void> {
    await WA.player.state.saveVariable(LANGUAGE_VARIABLE_KEY, language, {
        public: false,
        persist: true,
        ttl: LANGUAGE_TTL_SECONDS,
        scope: "world",
    });
}

export async function showLanguagePreferenceUi(): Promise<void> {
    const url = resolvePublicUrl(LANGUAGE_UI_URL);

    if (!languageWebsite) {
        languageWebsite = await WA.ui.website.open({
            url,
            visible: true,
            position: { vertical: "top", horizontal: "right" },
            size: { width: "132px", height: "74px" },
            margin: { top: "12px", right: "12px" },
            allowApi: true,
        });
        return;
    }

    languageWebsite.url = url;
    languageWebsite.visible = true;
}

export async function hideLanguagePreferenceUi(): Promise<void> {
    if (!languageWebsite) {
        return;
    }

    languageWebsite.visible = false;
}

export async function ensurePreferredLanguage(defaultLanguage: PlayerLanguage = "de"): Promise<PlayerLanguage> {
    const preferredLanguage = await getPreferredLanguage();
    if (preferredLanguage !== undefined) {
        return preferredLanguage;
    }

    await WA.player.state.saveVariable(LANGUAGE_VARIABLE_KEY, defaultLanguage, {
        public: false,
        persist: true,
        ttl: LANGUAGE_TTL_SECONDS,
        scope: "world",
    });

    return defaultLanguage;
}

export async function syncLanguagePreferenceUiState(): Promise<void> {
    if (!languageWebsite) {
        return;
    }

    const selectedLanguage = (await getPreferredLanguage()) ?? "de";
    languageWebsite.url = `${resolvePublicUrl(LANGUAGE_UI_URL)}?selected=${selectedLanguage}`;
}

export async function initializeLanguagePreferenceUi(): Promise<void> {
    await ensurePreferredLanguage("de");
    await showLanguagePreferenceUi();
    await syncLanguagePreferenceUiState();
}

export type { PlayerLanguage };
