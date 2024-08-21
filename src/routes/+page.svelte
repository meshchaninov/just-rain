<script>
	import { onMount } from 'svelte';
	import Media from '$lib/media.json';
	import Menu from './Menu.svelte';
	import Screensaver from './Screensaver.svelte';
	import PlayerSection from './PlayerSection.svelte';

	const bgTimeChange = 3 * 60;
	const rainSrc = Media['audio'];
	const backgroundSrc = Media['video'];

	let shuffleBgSrc = $derived(shuffle(backgroundSrc));

	let player = $state(null);

	let pause = $state(player?.paused || true);
	let volume = $state(0.8);
	let currentAudioSrc = $state(rainSrc[0]);
	let currentBgSrc = $state('');
	let menuHidden = $state(false);
	let bgTimeLeft = $state(bgTimeChange);
	let currentBgIndex = $state(0);
	let fullScreen = $state(false);

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
				currentBgIndex = (currentBgIndex + 1) % shuffleBgSrc.length;
				currentBgSrc = shuffleBgSrc[currentBgIndex];
				bgTimeLeft = bgTimeChange;
			}
		}, 1000);

		pause = player?.paused || true;
		console.log('Shuffled background sources', shuffleBgSrc);
		currentBgSrc = shuffleBgSrc[currentBgIndex];

		return () => {
			player.pause();
			clearInterval(interval);
		};
	});

	$effect(() => {
		if (fullScreen) {
			document.documentElement.requestFullscreen();
		} else if (!fullScreen && document.fullscreenElement) {
			document.exitFullscreen();
		}
	})

	function showMenu() {
		menuHidden = !menuHidden;
	}

	function onFullScreenChange() {
					if (document.fullscreenElement) {
				fullScreen = true
			} else {
				fullScreen = false
			}

	}

	function toggleFullScreen() {
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen();
			fullScreen = true;
		} else if (document.exitFullscreen) {
			document.exitFullscreen();
			fullScreen = false;
		}
	}


	/**
	 * Shuffles array in place.
	 * @param {Array} a items An array containing the items.
	 */
	function shuffle(a) {
		var j, x, i;
		for (i = a.length - 1; i > 0; i--) {
			j = Math.floor(Math.random() * (i + 1));
			x = a[i];
			a[i] = a[j];
			a[j] = x;
		}
		return a;
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

<svelte:document on:fullscreenchange={onFullScreenChange} />

<PlayerSection
	bgSrcVideo={currentBgSrc.media}
	bgSrcPreview={currentBgSrc.preview}
	audioSrc={currentAudioSrc}
	bind:volume
	bind:pause
	bind:player
/>

<div class="min-w-fit h-svh flex flex-col">
	{#if menuHidden}
		<Screensaver {showMenu} />
	{:else}
		<Menu {rainSrc} {showMenu} bind:currentAudioSrc bind:pause bind:volume bind:fullScreen />
	{/if}
</div>
