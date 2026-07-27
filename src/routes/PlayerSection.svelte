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
		claimMediaSession();

		const reclaimMediaSession = () => claimMediaSession();

		const activateAudio = () => {
			initializeAudioGraph().catch((error) => {
				console.error('Unable to initialize mobile audio controls', error);
			});
		};

		// Mobile browsers only allow AudioContext to start during a user gesture.
		document.addEventListener('pointerdown', activateAudio, { passive: true });
		document.addEventListener('keydown', activateAudio);
		window.addEventListener('just-rain:reclaim-media-session', reclaimMediaSession);

		return () => {
			document.removeEventListener('pointerdown', activateAudio);
			document.removeEventListener('keydown', activateAudio);
			window.removeEventListener('just-rain:reclaim-media-session', reclaimMediaSession);
			audioContext?.close();

			if ('mediaSession' in navigator) {
				for (const action of mediaSessionActions) {
					try {
						navigator.mediaSession.setActionHandler(action, null);
					} catch {
						// Ignore actions unsupported by this browser.
					}
				}
			}
		};
	});

	$effect(() => {
		applyVolume(volume);
	});

	$effect(() => {
		claimMediaSession();
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

	/** @type {MediaSessionAction[]} */
	const mediaSessionActions = [
		'play',
		'pause',
		'stop',
		'seekbackward',
		'seekforward',
		'seekto',
		'previoustrack',
		'nexttrack'
	];

	function claimMediaSession() {
		if (!('mediaSession' in navigator)) return;

		if ('MediaMetadata' in window) {
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

		setMediaSessionAction('play', () => {
			pause = false;
			player?.play();
		});
		setMediaSessionAction('pause', () => {
			pause = true;
			player?.pause();
		});

		// Rain is an endless ambience: ignore every transport action except play/pause.
		for (const action of mediaSessionActions.slice(2)) {
			setMediaSessionAction(action, null);
		}

		navigator.mediaSession.playbackState = pause ? 'paused' : 'playing';

		try {
			// Infinity marks this as a live/endless stream and removes remaining time on supporting UIs.
			navigator.mediaSession.setPositionState({ duration: Infinity, playbackRate: 1, position: 0 });
		} catch {
			try {
				navigator.mediaSession.setPositionState();
			} catch {
				// Position state is not supported by every Safari version.
			}
		}
	}

	/**
	 * @param {MediaSessionAction} action
	 * @param {MediaSessionActionHandler | null} handler
	 */
	function setMediaSessionAction(action, handler) {
		try {
			navigator.mediaSession.setActionHandler(action, handler);
		} catch {
			// Ignore actions unsupported by this browser.
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

<section class="fixed inset-0 z-0 overflow-hidden bg-black">
	<video
		class="h-full w-full object-cover"
		muted
		autoplay
		loop
		playsinline
		preload="auto"
		disablepictureinpicture
		src={bgSrcVideo}
		poster={bgSrcPreview}
	></video>
	<audio
		bind:this={player}
		bind:paused={pause}
		loop
		preload="auto"
		autoplay={autoPlayAudio}
		src={audioSrc}
	></audio>
</section>
