function pol(div) {
    const cnv1 = document.createElement('canvas');
    cnv1.width = document.body.clientWidth / 4;
    cnv1.height = cnv1.width;
    const cnv2 = document.createElement('canvas');
    cnv2.width = cnv1.width;
    cnv2.height = cnv1.height;
    const ctx1 = cnv1.getContext('2d');
    const ctx2 = cnv2.getContext('2d');

    const model = {
        gravity: true,
        nodes: [
            { id: 'A0', x: cnv1.width / 4, y: cnv1.height / 4, base: true },
            { id: 'A1', x: cnv1.width / 4, y: cnv1.height / 2 - 10 }
        ],
        constraints: [
            { id: 'a', p1: 'A0', p2: 'A1', len: { type: 'const' }, ori: { type: 'drive', Dw: - Math.PI * 2 * 100, Dt: 3 * 100 } }
        ]
    };

    mec.model.extend(model);
    model.init();
    const g = g2().del().clr().view({ cartesian: true, scl: 2 });
    model.draw(g);

    let temp_image;

    let toggle = false;
    const grp = new Group({ lk: true });
    const data = new DataXY();

    function render() {
        if (!toggle) return;

        const new_image = cnv1.getContext('2d').getImageData(0, 0, cnv1.width, cnv1.height).data;

        if (!temp_image) {
            temp_image = new_image;
        }
        const h = g2().clr();

        const result = PointCloud.fromImages(
            temp_image, new_image, cnv1.width, cnv1.height);
        const filtered = result.removeOverlaps();
        grp.lines.push(Line.fromRegressionLine(filtered, h));

        const frame = cv.imread(cnv1);
        grp.addPoints(grp.lk.step(frame));

        model.tick(1 / 60);

        filtered.draw(h);
        grp.draw(h, true);
        data.add(grp.momentanpol(5));
        data.drawDeviation(h);

        g.exe(ctx1);
        h.exe(ctx2);

        if (grp.pts[0]?.length > 40) {
            grp.pts.forEach(pt => pt.shift());
        }

        temp_image = new_image;
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