function step_compare_images(fn) {
    const { cnv1, ctx1, gnd, gnd2, running } = global_test_variables;

    const image1 = ctx1.getImageData(0, 0, cnv1.width, cnv1.height).data;
    model.tick(1 / 60); // solve model with fixed stepping
    global_test_variables.g.exe(ctx1);
    const image2 = ctx1.getImageData(0, 0, cnv1.width, cnv1.height).data;
    const result = compare_images(image1, image2, cnv1.width, cnv1.height);

    fn?.call(undefined, result);

    if (gnd.confident) {
        gnd2.innerHTML = `Vermutet: x: ${gnd.x}, y: ${cnv1.height - gnd.y}`;
    }

    if (running) {
        global_test_variables.rafId = requestAnimationFrame(() => step_compare_images(fn));  // keep calling back
    }
}