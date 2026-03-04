export async function showAchievement(message: string) {
    const url = `http://localhost:5173/achievements/${message}.html`;
    console.log(url);

    WA.ui.modal.openModal({
        title: message,
        src: url,
        allow: "geolocation",
        allowApi: true,
        position: "center"
    });
}
