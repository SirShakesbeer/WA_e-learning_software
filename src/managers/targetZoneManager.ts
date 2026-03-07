// targetZoneManager.ts
import { BoxKind, getBoxes, PushBox } from "../gameplay/pushBox";
import type { Area } from "@workadventure/iframe-api-typings";

const TILE = 32;

export async function initTargetArea(targetZone: string, getCurrentBoxes: () => ReadonlyArray<PushBox> = getBoxes) {
    const targetArea = await WA.room.area.get(targetZone); // Tiled‑Objekt holen
    if (!targetArea) {
        console.error(`Area '${targetZone}' nicht gefunden!`);
        return;
    }
  return new TargetZoneManager(targetArea, getCurrentBoxes);
}

/** Erlaubt beides: Koordinaten‑Objekt ODER fertiges WA.Area aus .get() */
export type TargetZoneInput =
  | { x: number; y: number; width: number; height: number }
  | Area;

export type BoxRuleContext = {
  allBoxes: ReadonlyArray<PushBox>;
  zoneBoxes: ReadonlyArray<PushBox>;
};

export type BoxRuleResult = {
  isValid: boolean;
  message?: string;
};

export type BoxRule = (context: BoxRuleContext) => BoxRuleResult;

export function evaluateBoxRules(context: BoxRuleContext, rules: ReadonlyArray<BoxRule>): BoxRuleResult {
  for (const rule of rules) {
    const result = rule(context);
    if (!result.isValid) {
      return result;
    }
  }

  return { isValid: true };
}

export function failIfZoneContainsKind(kind: BoxKind, message: string): BoxRule {
  return (context: BoxRuleContext) => {
    const hasInvalidBox = context.zoneBoxes.some((box) => box.kind === kind);
    if (hasInvalidBox) {
      return {
        isValid: false,
        message,
      };
    }

    return { isValid: true };
  };
}

export function requireAllOfKindInZone(kind: BoxKind, message: string): BoxRule {
  return (context: BoxRuleContext) => {
    const requiredBoxes = context.allBoxes.filter((box) => box.kind === kind);
    if (requiredBoxes.length === 0) {
      return { isValid: false };
    }

    const matchingBoxesInZone = context.zoneBoxes.filter((box) => box.kind === kind);
    if (matchingBoxesInZone.length !== requiredBoxes.length) {
      return {
        isValid: false,
        message,
      };
    }

    return { isValid: true };
  };
}

/**
 * Verwalter einer Zielzone, egal ob sie aus Tiled stammt
 * (via WA.room.area.get) oder zur Laufzeit per Koordinaten definiert wurde.
 */
export class TargetZoneManager {
  private rect: { x: number; y: number; width: number; height: number };
  private getCurrentBoxes: () => ReadonlyArray<PushBox>;

  constructor(input: TargetZoneInput, getCurrentBoxes: () => ReadonlyArray<PushBox> = getBoxes) {
    // unify: wir speichern nur die reinen Zahlenwerte
    this.rect = {
      x: input.x,
      y: input.y,
      width: input.width,
      height: input.height,
    };
    this.getCurrentBoxes = getCurrentBoxes;
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
    return this.getCurrentBoxes().filter((b) => this.isBoxInside(b));
  }

  /** Rätsel gelöst, wenn *alle* Boxen in der Zone sind */
  public isSolved(): boolean {
    const allBoxes = this.getCurrentBoxes();
    return allBoxes.length > 0 && this.getBoxesInside().length === allBoxes.length;
  }
}
