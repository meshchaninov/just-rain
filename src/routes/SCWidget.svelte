<script>
	import CloseButton from '$lib/components/CloseButton.svelte';
	import { Music } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { blur } from 'svelte/transition';
	import { shuffle } from '$lib/utils';

	let { pause = $bindable(true), volume = $bindable(0.8) } = $props();
	

	let SCIframe;
	let widget;
	let showWidget = $state(false);
	const musicIndxList = createIndxList(399); // TODO: Get the length of the playlist
	let currentMusicIndx = $state(0);
	let loading = $state(true);

	onMount(() => {
		widget = window.SC.Widget(SCIframe);
		currentMusicIndx = 0;
		console.log('Current music index', currentMusicIndx);

		widget.bind(window.SC.Widget.Events.READY, function () {
			widget.unbind(SC.Widget.Events.FINISH);
            console.log('SC Widget is ready');
			widget.getSounds(function (sounds) {
				console.log('Sounds', sounds);
			});
			widget.bind(window.SC.Widget.Events.FINISH, function () {
				console.log('Finished playing');
				playNexSong(widget);
			});
			if (pause) {
				widget.pause();
			} else {
				widget.play();
			}
			playNexSong(widget);
			changeVolume();
			loading = false;
		});

	});

	$effect(() => {
		changeVolume();
		if (pause) {
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
		widget.setVolume(volume * 100 * 0.8);
	}

	function createIndxList(length) {
		return [...shuffle(Array.from(Array(length + 1).keys()))];
	}

	function playNexSong(widget) {
		const nextSoungIndx = musicIndxList[Math.floor(Math.random() * musicIndxList.length)];
		widget.skip(nextSoungIndx);
		widget.play();
		console.log('Playing next song', nextSoungIndx);
	}
</script>

<svelte:document />

<div class="flex flex-col justify-end gap-2">
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
