<script>
	import { onMount } from 'svelte';
	import Menu from './Menu.svelte';
	import Screensaver from './Screensaver.svelte';
	import PlayerSection from './PlayerSection.svelte';

	const rainSrc = [
		'./audio/rain1.mp3',
		'./audio/rain2.mp3',
		'./audio/rain3.mp3',
		'./audio/rain4.mp3',
		'./audio/rain5.mp3'
	];
	const backgroundSrc = [
		{ video: './video/rain1.webm', preview: '/video/preview/preview1.webp'},
		{ video: './video/rain2.webm', preview: './video/preview/preview2.webp' },
		{ video: './video/rain3.webm', preview: './video/preview/preview3.webp' },
		{ video: './video/rain4.webm', preview: './video/preview/preview4.webp' },
		{ video: './video/rain5.webm', preview: './video/preview/preview5.webp' }
	];

	let player;

	let pause = $state(player?.paused);
	let volume = $state(0.8);
	let currentAudioSrc = $state(rainSrc[0]);
	let currentBgSrc = $state(backgroundSrc[0]);
	let menuHidden = $state(false);

	$effect(() => {
		if (pause) {
			player.pause();
		} else {
			player.play();
		}
	});

	onMount(() => {
		currentAudioSrc = rainSrc[Math.floor(Math.random() * rainSrc.length)];
		currentBgSrc = backgroundSrc[Math.floor(Math.random() * backgroundSrc.length)];
		pause = player.paused;
	});

	function showMenu() {
		menuHidden = !menuHidden;
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
	bgSrcVideo={currentBgSrc.video}
	bgSrcPreview={currentBgSrc.preview}
	audioSrc={currentAudioSrc}
	bind:volume={volume}
	bind:pause={pause}
	bind:player={player} 
/>

<div class="min-w-fit h-svh flex flex-col">
	{#if !menuHidden}
		<Menu rainSrc={rainSrc} backgroundSrc={backgroundSrc} showMenu={showMenu} bind:currentAudioSrc bind:currentBgSrc bind:pause bind:volume />
	{:else}
		<Screensaver showMenu={showMenu} />
		
	{/if}
</div>
