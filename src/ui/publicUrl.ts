export function resolvePublicUrl(relativePath: string): string {
    return new URL(`../../public/${relativePath}`, import.meta.url).toString();
}
