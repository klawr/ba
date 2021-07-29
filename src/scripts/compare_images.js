
/**
 *
 * @param {*} image1 The first image
 * @param {*} image2 The second image
 * @param {*} width Width of the images (have to be equal)
 * @param {*} height Height of the images (have to be equal)
 * @returns 
 */
function compare_images(image1, image2, width, height) {
    const difference = [];

    for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
            const i = y * width + x;
            if (image1[i * 4] !== image2[i * 4]) {
                difference.push({ x, y });
            };
        }
    }

    return difference;
}

function step_compare_images(fn) {
    const { cnv1, ctx1, gnd, gnd2 } = global_test_variables;
    const gtv = global_test_variables;
    const new_image = ctx1.getImageData(0, 0, cnv1.width, cnv1.height).data;
    if (gtv.temp_image) {
        const result = compare_images(gtv.temp_image, new_image, cnv1.width, cnv1.height);

        fn?.call(undefined, result);

        if (gnd.confident) {
            gnd2.innerHTML = `Vermutet: x: ${gnd.x}, y: ${cnv1.height - gnd.y}`;
        }
    }

    gtv.temp_image = new_image;
}
