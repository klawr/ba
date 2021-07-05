function take_image(srcCnv, tarCnv) {
    const image1 = tf.browser.fromPixels(srcCnv, 1);
    window.setTimeout(() => {
        const image2 = tf.browser.fromPixels(srcCnv, 1);
        const image3 = detect_changes(image1, image2);
        tf.browser.toPixels(image3, tarCnv);
    }, 1000 / 30);
}

function detect_changes(image1, image2) {
    // Both images have to have the same size to be comparable.
    if (!tf.equal(image1.size, image2.size)) {
        return tf.tensor([1, 0, 0.5], image1.shape);
    }

    return tf.abs(image1.sub(image2));
}
