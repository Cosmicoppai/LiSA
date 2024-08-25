export const getVideoThumbnail = async (
    urlOfFile: string,
    videoTimeInSeconds: number,
): Promise<string> => {
    if (!urlOfFile) {
        throw new Error('file not valid');
    }

    return new Promise<string>((resolve, reject) => {
        const video = document.createElement('video');

        function snapImage(): string | null {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                return canvas.toDataURL();
            }
            return null;
        }

        const timeupdate = function () {
            const image = snapImage();
            if (image && image.length > 100000) {
                URL.revokeObjectURL(urlOfFile);
                resolve(image);
                video.removeEventListener('timeupdate', timeupdate);
                video.pause();
                video.remove();
            }
        };

        video.addEventListener('loadeddata', function () {
            const image = snapImage();
            if (image && image.length > 100000) {
                URL.revokeObjectURL(urlOfFile);
                resolve(image);
                video.removeEventListener('loadeddata', () => {});
                video.remove();
            }
        });

        video.addEventListener('timeupdate', timeupdate);

        video.preload = 'metadata';
        video.src = urlOfFile;
        video.muted = true;
        video.playsInline = true;
        video.currentTime = videoTimeInSeconds;
        video.play();
    });
};

export const getVideoDuration = async (url: string): Promise<number> => {
    if (!url) {
        throw new Error('URL is required');
    }

    return new Promise<number>((resolve, reject) => {
        const video = document.createElement('video');

        video.addEventListener('loadeddata', () => {
            resolve(video.duration);
            video.remove();
        });

        video.addEventListener('error', () => {
            reject(new Error('Failed to load video'));
        });

        video.preload = 'metadata';
        video.src = url;
        video.muted = true;
        video.playsInline = true;
        video.play();
    });
};
