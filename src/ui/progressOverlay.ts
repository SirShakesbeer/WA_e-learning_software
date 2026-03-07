import { resolvePublicUrl } from "./publicUrl";

export type ProgressOverlayState = {
    done: number;
    total: number;
    level: number;
    levelLabel: string;
    totalLevels: number;
};

export class ProgressOverlay {
    private website: Awaited<ReturnType<typeof WA.ui.website.open>> | undefined;

    async render(state: ProgressOverlayState): Promise<void> {
        const percent = state.total === 0 ? 0 : Math.round((state.done / state.total) * 100);
        const progressUrl = resolvePublicUrl(
            `ui/planung-progress.html?done=${state.done}&total=${state.total}&percent=${percent}&level=${state.level}&levelLabel=${encodeURIComponent(state.levelLabel)}&totalLevels=${state.totalLevels}`
        );

        if (!this.website) {
            this.website = await WA.ui.website.open({
                url: progressUrl,
                allowApi: false,
                visible: true,
                position: { vertical: "middle", horizontal: "left" },
                size: { width: "92px", height: "240px" },
                margin: { left: "12px" },
            });
            return;
        }

        this.website.url = progressUrl;
        this.website.visible = true;
    }
}
