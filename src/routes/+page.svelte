<script>
	import { onMount } from 'svelte';
	import Media from '$lib/media.json';
	import Menu from './Menu.svelte';
	import PlayerSection from './PlayerSection.svelte';
	import { blur, fly } from 'svelte/transition';
	import { CircleChevronDown } from 'lucide-svelte';
	import SCWidget from './SCWidget.svelte';
	import { shuffle } from '$lib/utils';

	const bgTimeChange = 3 * 60;
	const rainSrc = Media['audio'];
	const backgroundSrc = Media['video'];

	let shuffleBgSrc = $derived(shuffle(backgroundSrc));

	let player = $state(null);

	let pause = $state(true);
	let volume = $state(0.8);
	let currentAudioSrc = $state(rainSrc[0]);
	let currentBgSrc = $state('');
	let showMenu = $state(true);
	let bgTimeLeft = $state(bgTimeChange);
	let currentBgIndex = $state(0);
	let fullScreen = $state(false);
	let enableSC = $state(false);

	$effect(() => {
		if (pause) {
			player.pause();
		} else {
			player.play();
		}
	});

	onMount(() => {
		const interval = setInterval(() => {
			time = new Date();
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
	});

	function onFullScreenChange() {
		if (document.fullscreenElement) {
			fullScreen = true;
		} else {
			fullScreen = false;
		}
	}

	function onMenuClose() {
		showMenu = false;
	}

	function onKeyDown(event) {
		switch (event.key) {
			case 'ArrowUp':
				volume = Math.min(1, volume + 0.1);
				break;
			case 'ArrowDown':
				volume = Math.max(0, volume - 0.1);
				break;
			case ' ':
				pause = !pause;
				break;
			case 'Enter':
				showMenu();
				break;
			case 'F11':
				fullScreen = !fullScreen;
				break;
			case 'f':
				fullScreen = !fullScreen;
				break;
		}
	}

	let time = $state(new Date());
	let currentTime = $derived(
		`${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`
	);
	let currentDate = $derived(time.toDateString());

	onMount(() => {
		const interval = setInterval(() => {
			time = new Date();
		});

		return () => {
			clearInterval(interval);
		};
	});
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
	<script defer src="https://w.soundcloud.com/player/api.js" charset="utf-8"></script>
</svelte:head>

<svelte:document on:fullscreenchange={onFullScreenChange} />

<svelte:window on:keydown={onKeyDown} />

<PlayerSection
	bgSrcVideo={currentBgSrc.media}
	bgSrcPreview={currentBgSrc.preview}
	audioSrc={currentAudioSrc}
	bind:volume
	bind:pause
	bind:player
/>

<div class="min-w-96 h-svh flex flex-col">
	<div class="flex flex-col h-full">
		<main class="flex-1">
			<div class="flex justify-center pt-3 h-14">
				{#if !showMenu}
					<button
						class="btn btn-circle btn-ghost z-10"
						onclick={() => {
							showMenu = true;
						}}
						transition:fly={{ y: 20 }}
					>
						<CircleChevronDown />
					</button>
				{/if}
			</div>
			<div class="flex justify-end px-10">
				<div class="flex flex-col p-4 rounded-lg backdrop-blur-3xl text-white" transition:blur>
					<div class="flex justify-end text-3xl bold">{currentTime}</div>
					<div class="text-xl">{currentDate}</div>
				</div>
			</div>
			<div class="flex justify-end pr-10 pt-3">
				{#if enableSC}
					<SCWidget bind:volume bind:pause />
				{/if}
			</div>
		</main>
		<footer class="text-center text-xs text-gray-500 pb-3" in:blur={{ delay: 1000 }} out:blur>
			<span
				>Dev by ✨ <a href="mailto:meshchaninov.n@gmail.com" class="link">Nikita Meshchaninov</a
				></span
			>
		</footer>
	</div>

	{#if showMenu}
		<Menu
			{rainSrc}
			{onMenuClose}
			bind:currentAudioSrc
			bind:pause
			bind:volume
			bind:fullScreen
			bind:enableSC
		/>
	{/if}
</div>
