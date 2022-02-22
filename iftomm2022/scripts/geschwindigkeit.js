function geschwindigkeit(div) {
    const cnv1 = document.createElement('canvas');
    cnv1.width = document.body.clientWidth / 3;
    cnv1.height = cnv1.width / 2;
    const cnv2 = document.createElement('canvas');
    cnv2.width = cnv1.width;
    cnv2.height = cnv1.height;
    const ctx1 = cnv1.getContext('2d');
    const ctx2 = cnv2.getContext('2d');

    const model = {
        "nodes": [
            { "id": "A0", "x": 60, "y": 60, "base": true },
            { "id": "A", "x": 60, "y": 110 },
            { "id": "B", "x": 210, "y": 120 },
            { "id": "B0", "x": 210, "y": 60, "base": true },
        ],
        "constraints": [
            { "id": "a", "p1": "A0", "p2": "A", "len": { "type": "const" }, "ori": { "type": "drive", "Dt": 2, "Dw": 6.283185307179586, repeat: 1000 } },
            { "id": "b", "p1": "A", "p2": "B", "len": { "type": "const" } },
            { "id": "c", "p1": "B0", "p2": "B", "len": { "type": "const" } }
        ]
    }

    mec.model.extend(model);
    model.init();
    const g = g2().del().clr().view({ cartesian: true, scl: 2 });
    model.draw(g);

    let toggle = false;
    const grp = new Group({ lk: true });

    function render() {
        if (!toggle) return;
        const frame = cv.imread(cnv1);
        grp.addPoints(grp.lk.step(frame));
        model.tick(1 / 60);

        const h = g2().use({ grp: g });
        grp.draw(h, true);

        g.exe(ctx1);
        h.exe(ctx2);
        if (grp.pts[0]?.length > 40) {
            grp.pts.forEach(pt => pt.shift());
        }

        if (toggle) {
            requestAnimationFrame(render);
        }
    }

    const btn = document.createElement("button");
    btn.innerHTML = "Start / Stop";
    render();
    btn.addEventListener('click', () => {
        toggle = !toggle;
        render();
    });
    div.appendChild(cnv1);
    div.appendChild(btn);
    div.appendChild(cnv2);
}