const sharp = require('sharp');

export default function() {
    return (inputPath: string, outputPath: string, rect: BoundingRect) => new Promise((resolve, reject) => {
        return sharp(inputPath)
            .extract(rect)
            .toFile(outputPath, function(err: Error) {
                if (err) return reject(err);
                resolve(outputPath);
            });
    });
}

interface BoundingRect { 
    left: number;
    top: number;
    width: number;
    height: number;
}