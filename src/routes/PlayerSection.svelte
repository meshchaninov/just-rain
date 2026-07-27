<script>
	import { onMount } from 'svelte';

	/** @type {{
	 * bgSrcVideo: string,
	 * bgSrcPreview: string,
	 * audioSrc: string,
	 * volume: number,
	 * pause: boolean,
	 * player: HTMLAudioElement | null
	 * }} */
	let {
		bgSrcVideo,
		bgSrcPreview,
		audioSrc,
		volume = $bindable(0.8),
		pause = $bindable(true),
		player = $bindable(null)
	} = $props();

	let autoPlayAudio = $state(false);
	/** @type {AudioContext | undefined} */
	let audioContext;
	/** @type {GainNode | undefined} */
	let gainNode;

	onMount(() => {
		autoPlayAudio = true;

		if ('mediaSession' in navigator) {
			navigator.mediaSession.metadata = new MediaMetadata({
				title: 'Rain ambience',
				artist: 'Just Rain',
				album: 'Just Rain',
				artwork: [
					{
						src: new URL('/previewImage.webp', window.location.origin).href,
						sizes: '3024x1890',
						type: 'image/webp'
					}
				]
			});

			navigator.mediaSession.setActionHandler('play', () => {
				pause = false;
				player?.play();
			});
			navigator.mediaSession.setActionHandler('pause', () => {
				pause = true;
				player?.pause();
			});
		}

		const activateAudio = () => {
			initializeAudioGraph().catch((error) => {
				console.error('Unable to initialize mobile audio controls', error);
			});
		};

		// Mobile browsers only allow AudioContext to start during a user gesture.
		document.addEventListener('pointerdown', activateAudio, { passive: true });
		document.addEventListener('keydown', activateAudio);

		return () => {
			document.removeEventListener('pointerdown', activateAudio);
			document.removeEventListener('keydown', activateAudio);
			audioContext?.close();

			if ('mediaSession' in navigator) {
				navigator.mediaSession.setActionHandler('play', null);
				navigator.mediaSession.setActionHandler('pause', null);
			}
		};
	});

	$effect(() => {
		const normalizedVolume = Math.min(1, Math.max(0, Number(volume)));

		if (gainNode && audioContext) {
			gainNode.gain.setValueAtTime(normalizedVolume, audioContext.currentTime);
		} else if (player) {
			// Fallback for browsers without Web Audio support.
			player.volume = normalizedVolume;
		}
	});

	$effect(() => {
		if ('mediaSession' in navigator) {
			navigator.mediaSession.playbackState = pause ? 'paused' : 'playing';
		}
	});

	async function initializeAudioGraph() {
		if (audioContext) {
			if (audioContext.state === 'suspended') {
				await audioContext.resume();
			}
			return;
		}

		const AudioContextConstructor =
			window.AudioContext ||
			/** @type {Window & { webkitAudioContext?: typeof AudioContext }} */ (window)
				.webkitAudioContext;
		if (!AudioContextConstructor || !player) return;

		audioContext = new AudioContextConstructor();
		const source = audioContext.createMediaElementSource(player);
		gainNode = audioContext.createGain();
		gainNode.gain.value = Math.min(1, Math.max(0, Number(volume)));
		source.connect(gainNode);
		gainNode.connect(audioContext.destination);

		if (audioContext.state === 'suspended') {
			await audioContext.resume();
		}
	}
</script>

<section>
	<div class="absolute w-full h-full object-cover -z-10">
		<video
			class="absolute w-full h-full object-cover -z-10"
			muted
			autoplay
			loop
			playsinline
			disablepictureinpicture
			src={bgSrcVideo}
			poster={bgSrcPreview}
		></video>
	</div>
	<audio bind:this={player} bind:paused={pause} loop autoplay={autoPlayAudio} src={audioSrc}></audio>
</section>
