import toggleCamera from './toggleCamera';
// import initSnaps from './snaps';
import { take_image } from './detect_changes';

const cnv = document.getElementById("cnv") as HTMLCanvasElement;
const camBtn = document.getElementById("camBtn");
const snapBtn = document.getElementById("snapBtn") as HTMLButtonElement;
const snap1 = document.getElementById("snap1") as HTMLCanvasElement;
// initSnaps(cnv, snapBtn);

const ctx = cnv.getContext("2d");
if (ctx) {
    ctx.beginPath();
    ctx.rect(20, 20, 150, 100);
    ctx.stroke();
}

camBtn!.addEventListener('click', () => toggleCamera(cnv, () => take_image(cnv, snap1)));
snapBtn!.addEventListener('click', () => take_image(cnv, snap1));
