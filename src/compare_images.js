
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
                difference.push({x, y});
            };
        }
    }

    return difference;
}
