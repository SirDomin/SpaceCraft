export class ResourceLoader {
    constructor(basePath = './src/resources/json') {
        this.basePath = basePath;
        this.resources = {};
    }

    async loadAllResources() {
        const files = await this.loadJSONFilesFromDirectory(this.basePath);

        for (const file of files) {
            const filename = file.replace('.json', '');
            this.resources[filename] = await this.loadJSONFile(`${this.basePath}/${file}`);
        }
    }

    async loadJSONFile(filePath) {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to load file: ${filePath}`);
        }
        return response.json();
    }

    getResource(filename, resourceName = null) {
        const resourceFile = this.resources[filename];
        if (!resourceFile) {
            throw new Error(`File not found: ${filename}`);
        }

        if (resourceName === null) {
            return resourceFile;
        }
        const resource = resourceFile.find(item => item.name === resourceName);
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
}
