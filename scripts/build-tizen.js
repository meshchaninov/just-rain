import { cp, mkdir, readFile, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const devBuild = process.argv.includes('--dev');
const projectName = devBuild ? 'JustRainTVDev' : 'JustRainTV';
const projectRoot = fileURLToPath(new URL(`../dist/tizen/${projectName}/`, import.meta.url));
const archivePath = fileURLToPath(
	new URL(`../dist/tizen/${projectName}-unsigned.wgt`, import.meta.url)
);

await rm(projectRoot, { recursive: true, force: true });
await rm(archivePath, { force: true });
await mkdir(projectRoot, { recursive: true });

const copy = async (source, destination) => {
	const destinationUrl = new URL(destination, import.meta.url);
	await mkdir(new URL('.', destinationUrl), { recursive: true });
	await cp(new URL(source, import.meta.url), destinationUrl, { recursive: true });
};

const mediaManifest = JSON.parse(
	await readFile(new URL('../static/media-manifest.json', import.meta.url), { encoding: 'utf8' })
);

const projectDestination = `../dist/tizen/${projectName}/`;
const copies = [
	copy(
		devBuild ? '../tizen/config.dev.xml' : '../tizen/config.xml',
		projectDestination + 'config.xml'
	),
	copy(
		devBuild ? '../tizen/index.dev.html' : '../tizen/index.html',
		projectDestination + 'index.html'
	),
	copy('../tizen/.project', projectDestination + '.project'),
	copy('../tizen/.tproject', projectDestination + '.tproject'),
	copy('../build/legacy/app.js', projectDestination + 'app.js'),
	copy('../static/logo.png', projectDestination + 'icon.png')
];

if (!devBuild) {
	copies.push(copy('../static/media-manifest.js', projectDestination + 'media-manifest.js'));

	for (const source of mediaManifest.audio) {
		copies.push(copy('../static/' + source, projectDestination + source));
	}

	for (const source of mediaManifest.video) {
		copies.push(
			copy('../static/' + source.media, projectDestination + source.media),
			...(source.preview
				? [copy('../static/' + source.preview, projectDestination + source.preview)]
				: [])
		);
	}
}

await Promise.all(copies);

execFileSync('/usr/bin/zip', ['-q', '-r', archivePath, '.'], {
	cwd: projectRoot,
	stdio: 'inherit'
});

console.log(`Tizen project: ${projectRoot}`);
console.log(`Unsigned WGT: ${archivePath}`);
console.log(
	devBuild
		? 'Media mode: H.264 video and audio from https://rain.dzle.org/'
		: 'Media mode: bundled offline'
);
console.log('Sign the project with a Samsung TV certificate before installing it on a TV.');
