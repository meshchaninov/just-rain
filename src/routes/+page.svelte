<script>
	import { onMount, tick } from 'svelte';
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

	/** @type {HTMLAudioElement | null} */
	let player = $state(null);

	let pause = $state(true);
	let volume = $state(0.8);
	let currentAudioSrc = $state(rainSrc[0]);
	let currentBgSrc = $state(backgroundSrc[0]);
	let showMenu = $state(true);
	let bgTimeLeft = $state(bgTimeChange);
	let currentBgIndex = $state(0);
	let fullScreen = $state(false);
	let fullScreenSupported = $state(false);
	let enableSC = $state(false);
	let menuFocusIndex = 1;

	$effect(() => {
		if (!player) return;

		if (pause) {
			player.pause();
		} else {
			const playAttempt = player.play();
			if (playAttempt) {
				playAttempt.catch(() => {
					pause = true;
				});
			}
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

		pause = player ? player.paused : true;
		fullScreenSupported = Boolean(
			document.fullscreenEnabled && document.documentElement.requestFullscreen
		);
		console.log('Shuffled background sources', shuffleBgSrc);
		currentBgSrc = shuffleBgSrc[currentBgIndex];
		tick().then(() => focusMenuItem(menuFocusIndex));

		return () => {
			if (player) player.pause();
			clearInterval(interval);
		};
	});

	$effect(() => {
		if (!fullScreenSupported) return;

		if (fullScreen && !document.fullscreenElement) {
			const request = document.documentElement.requestFullscreen();
			if (request) request.catch(() => (fullScreen = false));
		} else if (!fullScreen && document.fullscreenElement) {
			const exit = document.exitFullscreen();
			if (exit) exit.catch(() => {});
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

	async function openMenu() {
		showMenu = true;
		menuFocusIndex = 1;
		await tick();
		focusMenuItem(menuFocusIndex);
	}

	function getMenuItems() {
		return /** @type {HTMLElement[]} */ (
			Array.from(document.querySelectorAll('[data-tv-focus]:not([disabled])'))
		);
	}

	/** @param {number} index */
	function focusMenuItem(index) {
		const items = getMenuItems();
		if (items.length === 0) return;

		menuFocusIndex = Math.max(0, Math.min(index, items.length - 1));
		items[menuFocusIndex].focus();
	}

	/** @param {number} offset */
	function moveMenuFocus(offset) {
		const items = getMenuItems();
		const activeIndex = items.indexOf(/** @type {HTMLElement} */ (document.activeElement));
		const startIndex = activeIndex >= 0 ? activeIndex : menuFocusIndex;
		focusMenuItem(startIndex + offset);
	}

	/** @param {number} offset */
	function adjustFocusedRange(offset) {
		const activeElement = document.activeElement;
		if (!(activeElement instanceof HTMLInputElement) || activeElement.type !== 'range')
			return false;

		volume = Math.max(0, Math.min(1, Number(volume) + offset));
		return true;
	}

	/** @param {KeyboardEvent} event */
	function onKeyDown(event) {
		if (showMenu) {
			if (event.keyCode === 27 || event.keyCode === 10009) {
				event.preventDefault();
				onMenuClose();
				return;
			}

			switch (event.key) {
				case 'ArrowUp':
					event.preventDefault();
					moveMenuFocus(-1);
					return;
				case 'ArrowDown':
					event.preventDefault();
					moveMenuFocus(1);
					return;
				case 'ArrowLeft':
					event.preventDefault();
					if (!adjustFocusedRange(-0.05)) moveMenuFocus(-1);
					return;
				case 'ArrowRight':
					event.preventDefault();
					if (!adjustFocusedRange(0.05)) moveMenuFocus(1);
					return;
				case 'Escape':
				case 'Backspace':
				case 'GoBack':
					event.preventDefault();
					onMenuClose();
					return;
			}
		}

		switch (event.key) {
			case 'ArrowUp':
				event.preventDefault();
				volume = Math.min(1, volume + 0.1);
				break;
			case 'ArrowDown':
				event.preventDefault();
				volume = Math.max(0, volume - 0.1);
				break;
			case ' ':
				event.preventDefault();
				pause = !pause;
				break;
			case 'Enter':
				if (!showMenu) {
					event.preventDefault();
					openMenu();
				}
				break;
			case 'F11':
				if (fullScreenSupported) fullScreen = !fullScreen;
				break;
			case 'f':
				if (fullScreenSupported) fullScreen = !fullScreen;
				break;
		}
	}

	let time = $state(new Date());
	let currentTime = $derived(
		`${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`
	);
	let currentDate = $derived(time.toDateString());
</script>

<svelte:head>
	<title>Just Rain</title>
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

<div class="tv-app-shell relative z-10 flex flex-col">
	<div class="flex flex-col h-full">
		<main class="flex-1">
			<div class="flex justify-center pt-3 h-14">
				{#if !showMenu}
					<button
						class="btn btn-circle btn-ghost z-10"
						onclick={() => {
							openMenu();
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
				<SCWidget active={enableSC} bind:volume bind:pause />
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
			{fullScreenSupported}
			bind:enableSC
		/>
	{/if}
</div>
