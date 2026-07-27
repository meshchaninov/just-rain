<script>
	import CloseButton from '$lib/components/CloseButton.svelte';
	import { Music } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { blur } from 'svelte/transition';

	let { active = true, pause = $bindable(true), volume = $bindable(0.8) } = $props();

	let SCIframe;
	let widget;
	let showWidget = $state(true);
	let currentMusicIndx = $state(0);
	let playlistLength = 0;
	let widgetReady = $state(false);
	let loading = $state(true);
	let lastMediaSessionClaim = 0;

	onMount(() => {
		widget = window.SC.Widget(SCIframe);

		function playNextSong() {
			if (playlistLength === 0) return;

			currentMusicIndx = (currentMusicIndx + 1) % playlistLength;
			widget.skip(currentMusicIndx);
			if (!pause) {
				widget.play();
			}
			console.log('Playing next song', currentMusicIndx);
		}

		function onReady() {
			widget.unbind(window.SC.Widget.Events.FINISH);
			widget.unbind(window.SC.Widget.Events.PLAY);
			widget.unbind(window.SC.Widget.Events.PAUSE);
			widget.unbind(window.SC.Widget.Events.PLAY_PROGRESS);
			console.log('SC Widget is ready');
			widget.getSounds(function (sounds) {
				playlistLength = sounds.length;

				if (playlistLength > 0) {
					currentMusicIndx = Math.floor(Math.random() * playlistLength);
					widget.skip(currentMusicIndx);
					console.log('Playing first random song', currentMusicIndx);
				}

				widget.bind(window.SC.Widget.Events.FINISH, playNextSong);
				widget.bind(window.SC.Widget.Events.PLAY, reclaimRainMediaSession);
				widget.bind(window.SC.Widget.Events.PAUSE, reclaimRainMediaSession);
				widget.bind(window.SC.Widget.Events.PLAY_PROGRESS, reclaimRainMediaSession);
				widgetReady = true;
				changeVolume();

				if (!active || pause) {
					widget.pause();
				} else {
					widget.play();
				}

				loading = false;
			});
		}

		widget.bind(window.SC.Widget.Events.READY, onReady);

		return () => {
			widget.unbind(window.SC.Widget.Events.READY);
			widget.unbind(window.SC.Widget.Events.FINISH);
			widget.unbind(window.SC.Widget.Events.PLAY);
			widget.unbind(window.SC.Widget.Events.PAUSE);
			widget.unbind(window.SC.Widget.Events.PLAY_PROGRESS);
		};
	});

	$effect(() => {
		if (!active) return;

		showWidget = true;
		pause = false;
	});

	$effect(() => {
		if (!widgetReady) return;

		changeVolume();
		if (!active || pause) {
			widget.pause();
		} else {
			widget.play();
		}
	});

	function onClose() {
		showWidget = false;
	}

	function onOpen() {
		showWidget = true;
	}

	function changeVolume() {
		if (!widgetReady) return;
		widget.setVolume(volume * 100 * 0.8);
	}

	function reclaimRainMediaSession() {
		const now = Date.now();
		if (now - lastMediaSessionClaim < 1000) return;

		lastMediaSessionClaim = now;
		window.dispatchEvent(new Event('just-rain:reclaim-media-session'));
	}
</script>

<svelte:document />

<div class="flex flex-col justify-end gap-2" class:hidden={!active}>
	{#if showWidget}
		<div class="flex justify-end">
			<CloseButton {onClose} />
		</div>
	{/if}
	<iframe
		bind:this={SCIframe}
		hidden={!showWidget}
		class="rounded-lg"
		width="100%"
		height="300"
		scrolling="no"
		frameborder="no"
		allow="autoplay"
		src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/1715820063&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"
		title="SoundCloud widget"
	></iframe>
	{#if !showWidget}
		<div transition:blur>
			<button class="btn btn-circle btn-ghost" onclick={() => onOpen()}>
				{#if loading}
					<span class="loading loading-spinner loading-md"></span>
				{:else}
					<Music />
				{/if}
			</button>
		</div>
	{/if}
</div>
