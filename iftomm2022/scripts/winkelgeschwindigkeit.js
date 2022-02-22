function winkelgeschwindigkeit(div) {
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
            { id: 'A0', x: cnv1.width / 4 - 1, y: cnv1.height / 4, base: true },
            { id: 'A1', x: cnv1.width / 4, y: cnv1.height / 2 - 20 }
        ],
        constraints: [
            { id: 'a', p1: 'A0', p2: 'A1', len: { type: 'const' } }
        ]
    };

    mec.model.extend(model);
    model.init();
    const g = g2().del().clr().view({ cartesian: true, scl: 2 });
    model.draw(g);

    let toggle = false;
    let temp_image;

    function render() {
        if (!toggle) return;

        model.tick(1 / 60);
        const new_image = cnv1.getContext('2d').getImageData(0, 0, cnv1.width, cnv1.height).data;
        if (!temp_image) {
            temp_image = new_image;
        }
        const result = PointCloud.fromImages(
            temp_image, new_image, cnv1.width, cnv1.height);
        const filtered = result.removeOverlaps();

        const h = g2().del().clr();
        Line.fromRegressionLine(filtered, h);

        filtered.draw(h);
        g.exe(ctx1);
        h.exe(ctx2);

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

    setImage(div, 'ortho.png', 'Orthogonale Regression',
        document.body.clientWidth * 0.3, './gfx/', 50);
}