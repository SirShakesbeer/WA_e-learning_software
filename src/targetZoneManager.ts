// targetZoneManager.ts
import { boxes, PushBox } from "./pushBox";
import type { Area } from "@workadventure/iframe-api-typings";

const TILE = 32;

export async function initTargetArea(targetZone: string) {
    const targetArea = await WA.room.area.get(targetZone); // Tiled‑Objekt holen
    if (!targetArea) {
        console.error(`Area '${targetZone}' nicht gefunden!`);
        return;
    }
    return new TargetZoneManager(targetArea);
}

/** Erlaubt beides: Koordinaten‑Objekt ODER fertiges WA.Area aus .get() */
export type TargetZoneInput =
  | { x: number; y: number; width: number; height: number }
  | Area;

/**
 * Verwalter einer Zielzone, egal ob sie aus Tiled stammt
 * (via WA.room.area.get) oder zur Laufzeit per Koordinaten definiert wurde.
 */
export class TargetZoneManager {
  private rect: { x: number; y: number; width: number; height: number };

  constructor(input: TargetZoneInput) {
    // unify: wir speichern nur die reinen Zahlenwerte
    this.rect = {
      x: input.x,
      y: input.y,
      width: input.width,
      height: input.height,
    };
  }

  /** Prüft, ob linke‑obere Ecke der Box in der Zone liegt */
  public isBoxInside(box: PushBox): boolean {
    const px = box.x * TILE;
    const py = box.y * TILE;
    return (
      px >= this.rect.x &&
      px < this.rect.x + this.rect.width &&
      py >= this.rect.y &&
      py < this.rect.y + this.rect.height
    );
  }

  /** Gibt alle Boxen zurück, die aktuell in der Zone stehen */
  public getBoxesInside(): PushBox[] {
    return boxes.filter((b) => this.isBoxInside(b));
  }

  /** Rätsel gelöst, wenn *alle* Boxen in der Zone sind */
  public isSolved(): boolean {
    return boxes.length > 0 && this.getBoxesInside().length === boxes.length;
  }
}
