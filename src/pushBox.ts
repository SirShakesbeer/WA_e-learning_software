const map      = await WA.room.getTiledMap();
const mapX     = map.width  ?? 32;
const mapY     = map.height ?? 32;
const collisionData  = ((map.layers[1] as { data?: number[] }).data) ?? [];
export const boxes: PushBox[] = [];
let boxID: number = 0;

const tile_normal = "boxObj";
const tile_buggy = "boxObjBuggy";
const tile_correct = "boxObjCorrect";
const tile_pushCommit = "boxObjPushCommit";

export async function createBoxes(boxIndex: number, initX: number, initY: number, bugprobability?: number, isPushCommit?: boolean) {
    /**
     * Erstellt eine bestimmte Anzahl an Boxen, die in der Welt platziert werden.
     * @param boxIndex Anzahl der zu erstellenden Boxen
     * @param initX X-Koordinate des Startpunkts
     * @param initY Y-Koordinate des Startpunkts
     * optional @param bugprobability Wahrscheinlichkeit, dass eine Box fehlerhaft ist (1-100).
     * Die erste Box ist immer korrekt.
     * 0 bedeutet, zufällige Wahrscheinlichkeit zwischen 1 und 100
     * 1 bedeutet, dass alle Boxen korrekt sind
     * 100 bedeutet, dass alle Boxen fehlerhaft sind.
     */
    if (bugprobability !== undefined && bugprobability <= 0){
            bugprobability = randomIntFromInterval(1, 100);
    }
    console.log(`Creating ${boxIndex} boxes at (${initX}, ${initY}) with bug probability: ${bugprobability}`);
    
    for (let i = 1; i <= boxIndex; i++) {
        let startX = initX + i;
        let startY = initY;
        if (i % 2 == 0) {
            startY = initY + 2;
        }
        const buggyness = randomIntFromInterval(1, 100);
        const isbuggy = bugprobability && buggyness <= bugprobability;

        if (isPushCommit) {
            boxes.push(new PushCommitBox((boxID++).toString(), startX, startY, tile_pushCommit));
        } else if (!bugprobability) {
            boxes.push(new PushBox((boxID++).toString(), startX, startY, tile_normal));
        } else if(!isbuggy || i <= 1) {
            boxes.push(new CorrectBox((boxID++).toString(), startX, startY, tile_correct));
        } else if (isbuggy) {
            boxes.push(new BuggyBox((boxID++).toString(), startX, startY, tile_buggy));
        }
    }
}

function randomIntFromInterval(min: number, max: number) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function destroyBox(box: PushBox) {
    // Entferne die Kachel aus dem Raum
    WA.room.setTiles([
        { x: box.x, y: box.y, tile: null, layer: "boxPush/box" },
    ]);

    // Entferne alle Area-Gruppen (optional, aber empfohlen)
    WA.room.area.delete(box.areas.top.name);
    WA.room.area.delete(box.areas.bottom.name);
    WA.room.area.delete(box.areas.left.name);
    WA.room.area.delete(box.areas.right.name);

    // Entferne die Box aus dem boxes-Array
    const index = boxes.indexOf(box);
    if (index !== -1) {
        boxes.splice(index, 1);
    }

    console.log(`Destroyed box ${box.id}`);
}

export function destroyBoxesByType(type: "BuggyBox" | "CorrectBox" | "PushCommitBox") {
    // Kopie erstellen, um während der Iteration sicher zu löschen
    const toDestroy = boxes.filter(b => b.constructor.name === type);
    toDestroy.forEach(box => {
        destroyBox(box);
    });
}

class AreaGroup {
  top: any;
  bottom: any;
  left: any;
  right: any;
    constructor(top: any, bottom: any, left: any, right: any) {
        this.top = top;
        this.bottom = bottom;
        this.left = left;
        this.right = right;
    }
}

export class PushBox {
  x: number;
  y: number;
  areas: AreaGroup;
  tileID: string;

  constructor(
    public readonly id: string,          // z. B. "box1"
    startX: number,
    startY: number,
    tileID: string
  ) {
    this.x = startX;
    this.y = startY;
    this.areas = this.createPushAreas(this.x * 32, this.y * 32);
    this.tileID = tileID;
    console.log(`Created push areas for box ${this.id}:`, this.areas.top.name, this.areas.bottom.name, this.areas.left.name, this.areas.right.name);
    this.registerListeners();
    WA.room.setTiles([
        { x: startX, y: startY, tile: this.tileID, layer: "boxPush/box" },
    ]);
  }

  /** Prüft auf Kartenrand, Kollisionslayer 3 **und andere Kisten** */
  private checkWall(newX: number, newY: number): boolean {
    if (newX <= 0 || newY <= 0 || newX >= mapX - 1 || newY >= mapY - 1) return true;

    //‑‑ tile‑Kollisionen (Layer index 1 = dein Collision‑Layer)
    const i = newX + mapX * newY;
    if (collisionData[i] === 3) return true;

    //‑‑ andere Kisten blockieren
    return boxes.some(b => b !== this && b.x === newX && b.y === newY);
  }

  //moves Box to new position
    private moveBox(newX: number, newY: number, dir: string) {
        if(this.checkWall(newX, newY) == true) {
            return;
        }

        WA.room.setTiles([
            { x: this.x, y: this.y, tile: null, layer: "boxPush/box" },
            { x: newX, y: newY, tile: this.tileID, layer: "boxPush/box" },
        ]);
        this.x = newX;
        this.y = newY;
        this.moveArea(dir);

        WA.event.broadcast("boxMoved", {
            boxId: this.id,
            x: this.x,
            y: this.y
        });
    }

  private moveArea(dir: string) {
        switch (dir) {
            case "down":
                this.areas.top.y = this.areas.top.y + 32;
                this.areas.bottom.y = this.areas.bottom.y + 32;
                this.areas.left.y = this.areas.left.y + 32;
                this.areas.right.y = this.areas.right.y + 32;
                break;
            case "up":
                this.areas.top.y = this.areas.top.y - 32;
                this.areas.bottom.y = this.areas.bottom.y - 32;
                this.areas.left.y = this.areas.left.y - 32;
                this.areas.right.y = this.areas.right.y - 32;
                break;
            case "right":
                this.areas.top.x = this.areas.top.x + 32;
                this.areas.bottom.x = this.areas.bottom.x + 32;
                this.areas.left.x = this.areas.left.x + 32;
                this.areas.right.x = this.areas.right.x + 32;
                break;
            case "left":
                this.areas.top.x = this.areas.top.x - 32;
                this.areas.bottom.x = this.areas.bottom.x - 32;
                this.areas.left.x = this.areas.left.x - 32;
                this.areas.right.x = this.areas.right.x - 32;
                break;
        }
  }


  /** Listener pro Area einmalig registrieren */
  private registerListeners() {
    WA.room.area.onEnter(this.areas.top.name).subscribe( () => {
        this.moveBox(this.x, (this.y + 1), "down");
    });
    WA.room.area.onEnter(this.areas.bottom.name).subscribe( () => {
        this.moveBox(this.x, (this.y - 1), "up");
    });
    WA.room.area.onEnter(this.areas.left.name).subscribe( () => {
        this.moveBox((this.x + 1), this.y, "right");
    });
    WA.room.area.onEnter(this.areas.right.name).subscribe( () => {
        this.moveBox((this.x - 1), this.y, "left");
    });
    console.log(`Registered listeners for box ${this.id}`, this.areas.top.name, this.areas.bottom.name, this.areas.left.name, this.areas.right.name);
  }

  private createPushAreas(startX: number, startY: number): AreaGroup {

    return new AreaGroup(
        WA.room.area.create({
            name: `box${this.id}_top`,
            x: startX - 2,
            y: startY - 9,
            width: 36,
            height: 9,
        }),

        WA.room.area.create({
            name: `box${this.id}_bottom`,
            x: startX,
            y: startY + 32,
            width: 32,
            height: 20,
        }),

        WA.room.area.create({
            name: `box${this.id}_left`,
            x: startX - 10,
            y: startY + 7,
            width: 10,
            height: 32,
        }),

        WA.room.area.create({
            name: `box${this.id}_right`,
            x: startX + 32,
            y: startY + 7,
            width: 10,
            height: 32,
        })
    );
  }
}

export class CorrectBox extends PushBox {
    tileID: string;
    constructor(id: string, startX: number, startY: number, tileID: string) {
        super(id, startX, startY, tileID);
        this.tileID = tileID;
    }
}

export class BuggyBox extends PushBox {
    tileID: string;
    constructor(id: string, startX: number, startY: number, tileID: string) {
        super(id, startX, startY, tileID);
        this.tileID = tileID;
    }
}

export class PushCommitBox extends PushBox {
    tileID: string;
    constructor(id: string, startX: number, startY: number, tileID: string) {
        super(id, startX, startY, tileID);
        this.tileID = tileID;
    }
}