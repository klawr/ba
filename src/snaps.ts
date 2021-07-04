function defineSnap(id: string, parentCanvas: HTMLCanvasElement, snaps: number) {
    const snap = document.getElementById(id) as HTMLCanvasElement;
    snap.style.margin = "0px";
    snap.style.padding = "0px";
    snap.width = parentCanvas.width / snaps - 2;
    snap.height = parentCanvas.height / snaps - (2 / parentCanvas.width * parentCanvas.height);

    return snap;
}

function snap(cnv: HTMLCanvasElement, targets: HTMLCanvasElement[], index = 0) {
    if (index >= targets.length) {
        return;
    }
    const tar = targets[index];
    const ctx = tar.getContext("2d");

    if (!tar || !ctx) {
        return;
    }

    ctx.clearRect(0, 0, tar.width, tar.height);
    ctx.drawImage(cnv, 0, 0, tar.width, tar.height);
    window.setTimeout(() => snap(cnv, targets, ++index), 1000);
}

export default function init(cnv: HTMLCanvasElement, snapBtn: HTMLButtonElement) {
    const snap1 = defineSnap("snap1", cnv, 3);
    const snap2 = defineSnap("snap2", cnv, 3);
    const snap3 = defineSnap("snap3", cnv, 3);

    snapBtn!.addEventListener('click', () => snap(cnv, [snap1, snap2, snap3]));
}