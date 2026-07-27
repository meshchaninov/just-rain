import { transformFileAsync } from '@babel/core';
import presetEnv from '@babel/preset-env';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const outputPath = fileURLToPath(new URL('../build/legacy/app.js', import.meta.url));
const result = await transformFileAsync(outputPath, {
	presets: [
		[
			presetEnv,
			{
				targets: { chrome: '47' },
				modules: false,
				useBuiltIns: false
			}
		]
	],
	comments: false,
	compact: true,
	sourceMaps: false
});

if (!result?.code) {
	throw new Error('Babel did not produce the Samsung TV legacy bundle');
}

await writeFile(outputPath, result.code);
