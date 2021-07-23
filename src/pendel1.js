
let ply = []; // Alle Punkte
reset = () => {
    ply = [];
};
let nod; // Endstück des Pendels

function addPointForCircle(result) {
    if (!gnd.confident) {
        result.forEach(r => {
            if (!gnd.confident) {
                // Draw a circle for every found change
                g2().cir({ ...r, r: 1 }).exe(ctx2);
                ply.push({ ...r });
            }
        });
    }

    const cir = makeCircle(ply);
    ply.length && gnd.add(cir);

    g2().cir({ ...gnd.past[gnd.past.length - 1] }).exe(ctx2);

    return cir;
}
