export class ModifiedAudio {
    constructor(audioFile, modifiers = {}) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.audioBuffer = null;
        this.modifiers = modifiers;
        this.loadAudio(audioFile);
    }

    loadAudio(audioFile) {
        fetch(audioFile)
            .then(response => response.arrayBuffer())
            .then(data => this.audioContext.decodeAudioData(data))
            .then(buffer => {
                this.audioBuffer = buffer;
                this.play();
            })
            .catch(error => console.error('Error loading audio file:', error));
    }

    play() {
        if (!this.audioBuffer) {
            console.error('Audio not loaded yet.');
            return;
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = this.audioBuffer;

        source.playbackRate.value = this.modifiers.playbackRate || 1;

        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = this.modifiers.volume || 1;

        const filter = this.audioContext.createBiquadFilter();
        filter.type = this.modifiers.filterType || 'lowpass';
        filter.frequency.setValueAtTime(this.modifiers.filterFrequency || 1000, this.audioContext.currentTime);

        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        source.start(0);
    }
}