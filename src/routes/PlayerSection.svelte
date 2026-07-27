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
	let audioContext = $state();
	/** @type {GainNode | undefined} */
	let gainNode = $state();

	onMount(() => {
		autoPlayAudio = true;
		configureBackgroundPlayback();

		if ('mediaSession' in navigator) {
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
		applyVolume(volume);
	});

	$effect(() => {
		if ('mediaSession' in navigator && 'MediaMetadata' in window) {
			navigator.mediaSession.metadata = new MediaMetadata({
				title: 'Rain ambience',
				artist: 'Just Rain',
				album: 'Just Rain',
				artwork: [
					{
						src: getPlayerArtwork(bgSrcVideo),
						sizes: '1200x1200',
						type: 'image/jpeg'
					}
				]
			});
		}
	});

	$effect(() => {
		if ('mediaSession' in navigator) {
			navigator.mediaSession.playbackState = pause ? 'paused' : 'playing';
		}
	});

	async function initializeAudioGraph() {
		configureBackgroundPlayback();

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
		source.connect(gainNode);
		gainNode.connect(audioContext.destination);
		applyVolume(volume);

		if (audioContext.state === 'suspended') {
			await audioContext.resume();
		}
	}

	function configureBackgroundPlayback() {
		const audioSession =
			/** @type {Navigator & { audioSession?: { type: string } }} */ (navigator).audioSession;

		if (audioSession) {
			audioSession.type = 'playback';
		}
	}

	/** @param {number} nextVolume */
	function applyVolume(nextVolume) {
		const normalizedVolume = Math.min(1, Math.max(0, Number(nextVolume)));

		if (gainNode && audioContext && player) {
			// Keep the media element neutral so volume is applied exactly once by Web Audio.
			player.volume = 1;
			gainNode.gain.cancelScheduledValues(audioContext.currentTime);
			gainNode.gain.setValueAtTime(normalizedVolume, audioContext.currentTime);
		} else if (player) {
			// Fallback for browsers without Web Audio support.
			player.volume = normalizedVolume;
		}
	}

	/**
	 * @param {string} videoSrc
	 * @returns {string}
	 */
	function getPlayerArtwork(videoSrc) {
		const filename =
			typeof videoSrc === 'string' ? videoSrc.match(/(?:^|\/)(rain\d+)\.[^/.]+$/)?.[1] : null;
		const artworkPath = `/video/player/${filename || 'rain1'}.jpg`;

		return new URL(artworkPath, window.location.origin).href;
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
	<audio
		bind:this={player}
		bind:paused={pause}
		loop
		preload="auto"
		autoplay={autoPlayAudio}
		src={audioSrc}
	></audio>
</section>
