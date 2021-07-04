import toggleCamera from './toggleCamera';
import initSnaps from './snaps';

const cnv = document.getElementById("cnv") as HTMLCanvasElement;
const camBtn = document.getElementById("camBtn");
const snapBtn = document.getElementById("snapBtn") as HTMLButtonElement;
initSnaps(cnv, snapBtn);

const ctx = cnv.getContext("2d");
if (ctx) {
    ctx.beginPath();
    ctx.rect(20, 20, 150, 100);
    ctx.stroke();
}

camBtn!.addEventListener('click', () => toggleCamera(cnv));

