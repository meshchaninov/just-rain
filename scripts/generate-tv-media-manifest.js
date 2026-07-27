import { access, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const staticRoot = new URL('../static/', import.meta.url);
const audioDirectory = new URL('audio/', staticRoot);
const videoDirectory = new URL('video/tv/', staticRoot);
const previewDirectory = new URL('video/preview/', staticRoot);
const manifestJsonUrl = new URL('media-manifest.json', staticRoot);
const manifestScriptUrl = new URL('media-manifest.js', staticRoot);
const naturalOrder = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

async function listFiles(directory, extension) {
	return (await readdir(directory, { withFileTypes: true }))
		.filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(extension))
		.map((entry) => entry.name)
		.sort(naturalOrder.compare);
}

async function fileExists(url) {
	try {
		await access(url);
		return true;
	} catch {
		return false;
	}
}

const audio = (await listFiles(audioDirectory, '.mp3')).map((name) => `audio/${name}`);
const video = [];

for (const name of await listFiles(videoDirectory, '.mp4')) {
	const basename = name.replace(/\.mp4$/i, '');
	const previewName = `${basename}.webp`;
	const previewUrl = new URL(previewName, previewDirectory);
	const item = { media: `video/tv/${name}` };

	if (await fileExists(previewUrl)) item.preview = `video/preview/${previewName}`;
	video.push(item);
}

const manifest = { audio, video };
await Promise.all([
	writeFile(manifestJsonUrl, `${JSON.stringify(manifest, null, '\t')}\n`),
	writeFile(manifestScriptUrl, `window.JUST_RAIN_MEDIA_MANIFEST = ${JSON.stringify(manifest)};\n`)
]);

console.log(
	`TV media manifest: ${fileURLToPath(manifestJsonUrl)} (${video.length} videos, ${audio.length} audio tracks)`
);
