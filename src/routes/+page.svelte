<script>
	import { onMount } from 'svelte';
	import Media from '$lib/media.json';
	import Menu from './Menu.svelte';
	import Screensaver from './Screensaver.svelte';
	import PlayerSection from './PlayerSection.svelte';

	const rainSrc = Media['audio'];
	const backgroundSrc = Media['video'];

	const bgTimeChange = 30;
	const shuffledBg = shuffleArray(backgroundSrc);

	let player = $state(null);

	let pause = $state(player?.paused);
	let volume = $state(0.8);
	let currentAudioSrc = $state(rainSrc[0]);
	let currentBgSrc = $state(backgroundSrc[0]);
	let menuHidden = $state(false);
	let bgTimeLeft = $state(bgTimeChange);
	let currentBgIndex = $state(0);

	$effect(() => {
		if (pause) {
			player.pause();
		} else {
			player.play();
		}
	});

	onMount(() => {
		const interval = setInterval(() => {
			bgTimeLeft -= 1;
			if (bgTimeLeft <= 0) {
				currentBgIndex = nextIndex(shuffledBg, currentBgIndex);
				currentBgSrc = shuffledBg[currentBgIndex];
				bgTimeLeft = bgTimeChange;
			}
		}, 1000);


		pause = player?.paused || true;

		return () => {
			player.pause();
			clearInterval(interval);
		};
	});

	function showMenu() {
		menuHidden = !menuHidden;
	}


	function shuffleArray(array) {
		let currentIndex = array.length;

		// While there remain elements to shuffle...
		while (currentIndex != 0) {
			// Pick a remaining element...
			let randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;

			// And swap it with the current element.
			[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
		}
		return array;
	}

	function nextIndex(array, currentIndex) {
		return (currentIndex + 1) % array.length;
	}
</script>

<svelte:head>
	<title>Just Rain</title>
	<meta property="og:title" content="Just Rain" />
	<meta
		property="og:description"
		content="Welcome to Rain Sound Oasis, your ultimate destination for relaxation and tranquility. Immerse yourself in the soothing symphony of rain, designed to help you unwind, focus, or drift into a peaceful sleep."
	/>
	<meta property="og:image" content="/previewImage.webp" />
	<meta name="twitter:card" content="summary_large_image" />
	<script defer data-domain="just-rain.win" src="https://plausible.dzle.org/js/script.js"></script>
</svelte:head>

<PlayerSection
	bgSrcVideo={currentBgSrc.media}
	bgSrcPreview={currentBgSrc.preview}
	audioSrc={currentAudioSrc}
	bind:volume
	bind:pause
	bind:player
/>

<div class="min-w-fit h-svh flex flex-col">
	{#if !menuHidden}
		<Menu {rainSrc} {showMenu} bind:currentAudioSrc bind:pause bind:volume />
	{:else}
		<Screensaver {showMenu} />
	{/if}
</div>
