// @ts-nocheck -- intentionally ES5-compatible DOM fallback validated by its dedicated build.
import Media from '$lib/media.json';

const target = document.getElementById('app');

if (target) {
	const audioSources = Media.audio;
	const videoSources = Media.tvVideo || Media.video;
	const mediaBase =
		typeof window.JUST_RAIN_MEDIA_BASE === 'string' ? window.JUST_RAIN_MEDIA_BASE : '';
	let currentVideoIndex = Math.floor(Math.random() * videoSources.length);
	let currentAudioIndex = 0;
	let menuOpen = true;
	let focusIndex = 0;
	let videoChangeToken = 0;

	target.innerHTML = `
		<style>
			#app { display: block !important; width: 100%; height: 100%; }
			.tv-legacy { position: relative; width: 100%; height: 100vh; overflow: hidden; color: white; background: #050709; font-family: Arial, sans-serif; }
			.tv-legacy__video { position: absolute; top: 0; right: 0; bottom: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }
			.tv-legacy__shade { position: absolute; top: 0; right: 0; bottom: 0; left: 0; background: linear-gradient(180deg, rgba(0,0,0,.15), rgba(0,0,0,.42)); pointer-events: none; }
			.tv-legacy__clock { position: absolute; top: 32px; right: 48px; padding: 18px 24px; border-radius: 12px; background: rgba(15,23,42,.88); text-align: right; }
			.tv-legacy__time { font-size: 38px; font-weight: 700; }
			.tv-legacy__date { margin-top: 4px; font-size: 22px; }
			.tv-legacy__menu { position: absolute; top: 50%; left: 50%; width: 540px; padding: 30px; border-radius: 16px; background: rgba(15,23,42,.94); transform: translate(-50%, -50%); box-sizing: border-box; }
			.tv-legacy__row { display: flex; align-items: center; justify-content: space-between; margin: 18px 0; font-size: 24px; }
			.tv-legacy__button { min-width: 72px; min-height: 54px; margin-left: 8px; border: 0; border-radius: 10px; color: white; background: #334155; font-size: 22px; }
			.tv-legacy__button--primary { width: 320px; color: #041014; background: #22d3ee; font-weight: 700; }
			.tv-legacy__button:focus, .tv-legacy__range:focus { outline: 5px solid #f8fafc; outline-offset: 5px; }
			.tv-legacy__button--active { background: #0891b2; }
			.tv-legacy__range { width: 320px; }
			.tv-legacy__open { position: absolute; top: 24px; left: 50%; transform: translateX(-50%); }
			.tv-legacy__hint { margin-top: 24px; color: #cbd5e1; text-align: center; font-size: 17px; }
			.tv-legacy__footer { position: absolute; bottom: 14px; width: 100%; color: #cbd5e1; text-align: center; font-size: 15px; }
		</style>
		<div class="tv-legacy">
			<video id="tv-video" class="tv-legacy__video" muted autoplay loop playsinline></video>
			<audio id="tv-audio" loop></audio>
			<div class="tv-legacy__shade"></div>
			<div class="tv-legacy__clock">
				<div id="tv-time" class="tv-legacy__time"></div>
				<div id="tv-date" class="tv-legacy__date"></div>
			</div>
			<button id="tv-open" class="tv-legacy__button tv-legacy__open" hidden>Menu</button>
			<div id="tv-menu" class="tv-legacy__menu">
				<div class="tv-legacy__row">
					<span>Playing</span>
					<button id="tv-play" class="tv-legacy__button tv-legacy__button--primary" data-tv-focus>Play</button>
				</div>
				<div class="tv-legacy__row">
					<label for="tv-volume">Volume</label>
					<input id="tv-volume" class="tv-legacy__range" data-tv-focus type="range" min="0" max="1" step="0.05" value="0.8">
				</div>
				<div class="tv-legacy__row">
					<span>Select audio</span>
					<div id="tv-audio-buttons"></div>
				</div>
				<div class="tv-legacy__row">
					<span>Menu</span>
					<button id="tv-close" class="tv-legacy__button" data-tv-focus>Close</button>
				</div>
				<div class="tv-legacy__hint">
					Arrows — navigate · Enter — select · Back — close<br>
					After closing: Left/Right — rain scene · Up/Down — volume
				</div>
			</div>
			<div class="tv-legacy__footer">Just Rain · Samsung TV</div>
		</div>`;

	const video = document.getElementById('tv-video');
	const audio = document.getElementById('tv-audio');
	const playButton = document.getElementById('tv-play');
	const volumeInput = document.getElementById('tv-volume');
	const menu = document.getElementById('tv-menu');
	const openButton = document.getElementById('tv-open');
	const closeButton = document.getElementById('tv-close');
	const audioButtonsContainer = document.getElementById('tv-audio-buttons');

	function resolveMediaPath(path) {
		return mediaBase ? mediaBase + path.replace(/^\/+/, '') : path;
	}

	function setVideo(index) {
		const source = videoSources[index];
		const shouldRestoreAudio = !audio.paused;
		const savedAudioTime = audio.currentTime || 0;
		const changeToken = ++videoChangeToken;
		let audioRestored = false;

		function restoreAudio() {
			if (audioRestored || !shouldRestoreAudio || changeToken !== videoChangeToken) return;
			audioRestored = true;
			audio.pause();

			try {
				audio.currentTime = savedAudioTime;
			} catch (error) {
				// Some older Tizen builds reject seeking until the streamed MP3 is ready.
			}

			const audioPlayAttempt = audio.play();
			if (audioPlayAttempt && audioPlayAttempt.catch) {
				audioPlayAttempt.catch(function () {
					playButton.textContent = 'Play';
				});
			}
		}

		function handleVideoPlaying() {
			video.removeEventListener('playing', handleVideoPlaying);
			setTimeout(restoreAudio, 250);
		}

		video.addEventListener('playing', handleVideoPlaying);
		video.poster = resolveMediaPath(source.preview);
		video.src = resolveMediaPath(source.media);
		video.load();
		const playAttempt = video.play();
		if (playAttempt && playAttempt.catch) playAttempt.catch(function () {});

		// Fallback for firmware versions that do not emit `playing` after a source change.
		setTimeout(restoreAudio, 1500);
	}

	function changeVideo(offset) {
		currentVideoIndex = (currentVideoIndex + offset + videoSources.length) % videoSources.length;
		setVideo(currentVideoIndex);
	}

	function setAudio(index) {
		const wasPlaying = !audio.paused;
		currentAudioIndex = index;
		audio.src = resolveMediaPath(audioSources[index]);
		audio.load();
		updateAudioButtons();

		if (wasPlaying) {
			const playAttempt = audio.play();
			if (playAttempt && playAttempt.catch) playAttempt.catch(function () {});
		}
	}

	function updateAudioButtons() {
		const buttons = audioButtonsContainer.querySelectorAll('button');
		for (let index = 0; index < buttons.length; index += 1) {
			buttons[index].className =
				'tv-legacy__button' + (index === currentAudioIndex ? ' tv-legacy__button--active' : '');
		}
	}

	function togglePlayback() {
		if (audio.paused) {
			const playAttempt = audio.play();
			if (playAttempt && playAttempt.catch) {
				playAttempt.catch(function () {
					playButton.textContent = 'Play';
				});
			}
			playButton.textContent = 'Pause';
		} else {
			audio.pause();
			playButton.textContent = 'Play';
		}
	}

	function getFocusItems() {
		return menu.querySelectorAll('[data-tv-focus]');
	}

	function focusItem(index) {
		const items = getFocusItems();
		if (!items.length) return;
		focusIndex = Math.max(0, Math.min(index, items.length - 1));
		items[focusIndex].focus();
	}

	function moveFocus(offset) {
		const items = getFocusItems();
		for (let index = 0; index < items.length; index += 1) {
			if (items[index] === document.activeElement) focusIndex = index;
		}
		focusItem(focusIndex + offset);
	}

	function showMenu() {
		menuOpen = true;
		menu.hidden = false;
		openButton.hidden = true;
		focusIndex = 0;
		focusItem(focusIndex);
	}

	function hideMenu() {
		menuOpen = false;
		menu.hidden = true;
		openButton.hidden = false;
		openButton.focus();
	}

	function exitTizenApplication() {
		if (window.tizen && window.tizen.application) {
			window.tizen.application.getCurrentApplication().exit();
			return true;
		}

		return false;
	}

	function pad(value) {
		return value < 10 ? '0' + value : String(value);
	}

	function updateClock() {
		const now = new Date();
		document.getElementById('tv-time').textContent =
			pad(now.getHours()) + ':' + pad(now.getMinutes());
		document.getElementById('tv-date').textContent = now.toDateString();
	}

	for (let index = 0; index < audioSources.length; index += 1) {
		const button = document.createElement('button');
		button.type = 'button';
		button.textContent = String(index + 1);
		button.setAttribute('data-tv-focus', '');
		button.setAttribute('data-audio-index', String(index));
		button.addEventListener('click', function () {
			setAudio(Number(this.getAttribute('data-audio-index')));
		});
		audioButtonsContainer.appendChild(button);
	}

	playButton.addEventListener('click', togglePlayback);
	closeButton.addEventListener('click', hideMenu);
	openButton.addEventListener('click', showMenu);
	volumeInput.addEventListener('input', function () {
		audio.volume = Number(volumeInput.value);
	});

	document.addEventListener('keydown', function (event) {
		const keyCode = event.keyCode;

		if (menuOpen && (keyCode === 27 || keyCode === 8 || keyCode === 10009)) {
			event.preventDefault();
			hideMenu();
			return;
		}

		if (!menuOpen) {
			if (keyCode === 10009) {
				event.preventDefault();
				exitTizenApplication();
			} else if (keyCode === 13) {
				event.preventDefault();
				showMenu();
			} else if (keyCode === 38 || keyCode === 40) {
				event.preventDefault();
				audio.volume = Math.max(0, Math.min(1, audio.volume + (keyCode === 38 ? 0.1 : -0.1)));
				volumeInput.value = String(audio.volume);
			} else if (keyCode === 37 || keyCode === 39) {
				event.preventDefault();
				changeVideo(keyCode === 37 ? -1 : 1);
			}
			return;
		}

		if (keyCode === 38 || keyCode === 40) {
			event.preventDefault();
			moveFocus(keyCode === 38 ? -1 : 1);
		} else if (keyCode === 37 || keyCode === 39) {
			event.preventDefault();
			if (document.activeElement === volumeInput) {
				volumeInput.value = String(
					Math.max(0, Math.min(1, Number(volumeInput.value) + (keyCode === 37 ? -0.05 : 0.05)))
				);
				audio.volume = Number(volumeInput.value);
			} else {
				moveFocus(keyCode === 37 ? -1 : 1);
			}
		} else if (keyCode === 13 && document.activeElement && document.activeElement.click) {
			event.preventDefault();
			document.activeElement.click();
		}
	});

	setVideo(currentVideoIndex);
	setAudio(currentAudioIndex);
	audio.volume = Number(volumeInput.value);
	updateClock();
	focusItem(focusIndex);

	setInterval(updateClock, 1000);
	setInterval(
		function () {
			changeVideo(1);
		},
		3 * 60 * 1000
	);
}
