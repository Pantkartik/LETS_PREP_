
import Docker from 'dockerode';

const docker = new Docker();
const images = [
    'gcc:latest',
    'python:3.11-alpine',
    'eclipse-temurin:17-jdk-alpine',
    'node:20-alpine'
];

async function pullImages() {
    console.log('🚀 Pulling Docker images...');

    for (const image of images) {
        console.log(`Pulling ${image}...`);
        try {
            await new Promise((resolve, reject) => {
                docker.pull(image, (err: any, stream: any) => {
                    if (err) return reject(err);
                    docker.modem.followProgress(stream, onFinished, onProgress);

                    function onFinished(err: any, output: any) {
                        if (err) return reject(err);
                        resolve(output);
                    }
                    function onProgress(event: any) {
                        // concise output
                    }
                });
            });
            console.log(`✅ Pulled ${image}`);
        } catch (error: any) {
            console.error(`❌ Failed to pull ${image}:`, error.message);
        }
    }
}

pullImages();
