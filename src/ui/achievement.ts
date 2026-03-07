import { getPreferredLanguage, type PlayerLanguage } from "./languagePreference";
import { resolvePublicUrl } from "./publicUrl";

type AchievementId = "klassendiagramm" | "klassendiagramm_level2" | "fertigerroboter";

type AchievementLocalization = {
    title: string;
    fileName: string;
};

const achievementLocalizations: Record<PlayerLanguage, Record<AchievementId, AchievementLocalization>> = {
    de: {
        klassendiagramm: {
            title: "KLASSE(n) PROGRAMMIERUNG!",
            fileName: "klassendiagramm.html",
        },
        klassendiagramm_level2: {
            title: "UML Mastery II!",
            fileName: "klassendiagramm_level2.html",
        },
        fertigerroboter: {
            title: "Gruener Daumen!",
            fileName: "fertigerroboter.html",
        },
    },
    en: {
        klassendiagramm: {
            title: "CLASS(y) CODING!",
            fileName: "klassendiagramm_en.html",
        },
        klassendiagramm_level2: {
            title: "UML Mastery II!",
            fileName: "klassendiagramm_level2_en.html",
        },
        fertigerroboter: {
            title: "Green Thumb!",
            fileName: "fertigerroboter_en.html",
        },
    },
};

function resolveAchievementLocalization(achievementId: string, language: PlayerLanguage): AchievementLocalization {
    const localized = achievementLocalizations[language][achievementId as AchievementId];
    if (localized) {
        return localized;
    }

    const fallbackFileName = `${encodeURIComponent(achievementId)}.html`;
    return {
        title: achievementId,
        fileName: fallbackFileName,
    };
}

export async function showAchievement(achievementId: string) {
    const language = (await getPreferredLanguage()) ?? "de";
    const achievement = resolveAchievementLocalization(achievementId, language);
    const url = resolvePublicUrl(`achievements/${achievement.fileName}`);

    WA.ui.modal.openModal({
        title: achievement.title,
        src: url,
        allow: "geolocation",
        allowApi: false,
        position: "center",
        allowFullScreen: false
    });
}
