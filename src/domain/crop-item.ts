const Jimp = require('jimp');

export default function() {
    return (inputPath: string, outputPath: string, rect: BoundingRect) => new Promise(async (resolve) => {
        const img = await Jimp.read(inputPath);
        const crop = img.crop(rect.left, rect.top, rect.width, rect.height)
        await crop.writeAsync(outputPath);
        resolve(outputPath);
    });
}

interface BoundingRect { 
    left: number;
    top: number;
    width: number;
    height: number;
}