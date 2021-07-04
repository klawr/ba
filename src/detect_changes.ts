import { abs, browser, equal, tensor, Tensor2D, Tensor3D } from "@tensorflow/tfjs";

export function take_image(srcCnv: HTMLCanvasElement, tarCnv: HTMLCanvasElement) {
    const image1 = browser.fromPixels(srcCnv, 1);
    window.setTimeout(() => {
        const image2 = browser.fromPixels(srcCnv, 1);
        const image3 = detect_changes(image1, image2);
        browser.toPixels(image3, tarCnv);
    }, 1000 / 30);
}

export function detect_changes(image1: Tensor3D, image2: Tensor3D): Tensor2D | Tensor3D {
    // Both images have to have the same size to be comparable.
    if (!equal(image1.size, image2.size)) {
        return tensor([1, 0, 0.5], image1.shape) as Tensor3D;
    }

    return abs(image1.sub(image2)) as Tensor3D | Tensor2D;
}
