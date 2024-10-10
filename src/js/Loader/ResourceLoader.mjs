export class ResourceLoader {
    constructor(basePathJson = './src/resources/json', basePathAudio = './src/resources/audio', basePathMedia = './src/resources/png') {
        this.basePathJson = basePathJson;
        this.basePathAudio = basePathAudio;
        this.basePathMedia = basePathMedia;

        this.resources = {
            json: [],
            audio: [],
            media: [],
        };
    }

    async loadAllResources() {
        const files = await this.loadJSONFilesFromDirectory(this.basePathJson);

        for (const file of files) {
            const filename = file.replace('.json', '');
            this.resources.json.push({
                filename: filename,
                data: await this.loadJSONFile(`${this.basePathJson}/${file}`)
            });
        }

        const audioFiles = await this.loadAudioFilesFromDirectory(this.basePathAudio);

        for (const audioFile of audioFiles) {
            this.resources.audio.push({
                filename: this.removeExtension(audioFile),
                data: new Audio(`${this.basePathAudio}/${audioFile}`),
                src: `${this.basePathAudio}/${audioFile}`
            });
        }

        const mediaFiles = await this.loadMediaFilesFromDirectory(this.basePathMedia);

        await Promise.all(
            mediaFiles.map(mediaFile =>
                new Promise((resolve, reject) => {
                    const img = new Image();
                    img.src = `${this.basePathMedia}/${mediaFile}`;

                    img.onload = () => {
                        this.resources.media.push({
                            filename: this.removeExtension(mediaFile),
                            data: img,
                        });
                        resolve();
                    };

                    img.onerror = reject;
                })
            )
        );
    }

    removeExtension(filename) {
        const lastDotIndex = filename.lastIndexOf('.');

        if (lastDotIndex === -1 || lastDotIndex === 0) {
            return filename;
        }

        return filename.substring(0, lastDotIndex);
    }

    async loadJSONFile(filePath) {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to load file: ${filePath}`);
        }
        return response.json();
    }

    getAudioFile(fileName) {
        return this.resources.audio.find(resource => {
            return resource.filename === fileName;
        }).data;
    }

    getAudio(fileName){
        return this.resources.audio.find(resource => {
            return resource.filename === fileName;
        })
    }

    getMediaFile(fileName) {
        return this.resources.media.find(resource => {
            return resource.filename === fileName;
        }).data;
    }

    getResource(filename, resourceName) {
        const resourceFile = this.resources.json.find(resource => {
            return resource.filename === filename;
        });
        if (!resourceFile) {
            throw new Error(`File not found: ${filename}`);
        }

        if (resourceName === null) {
            return resourceFile;
        }
        const resource = resourceFile.data.find(item => item.name === resourceName);
        if (!resource) {
            throw new Error(`Resource not found: ${resourceName}`);
        }
        return resource;
    }

    async loadJSONFilesFromDirectory() {
        return [
            'parts.json',
        ];
    }

    async loadAudioFilesFromDirectory() {
        return [
            'hit.mp3',
            'hit1.mp3',
            'hit2.mp3',
            'hit3.mp3',
            'laser.mp3',
            'explosion1.mp3',
        ];
    }

    async loadMediaFilesFromDirectory() {
        return [
            'hitmark.png',
            'targetmark.png',
            'enemy1.png',
        ];
    }
}
