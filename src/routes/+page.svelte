<script>
	import { CircleChevronDown, Pause, Play, X } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { fly, blur } from 'svelte/transition';

	const rainSrc = ['/audio/rain1.mp3', '/audio/rain2.mp3', '/audio/rain3.mp3', '/audio/rain4.mp3', '/audio/rain5.mp3'];
	const backgroundSrc = ['/video/rain1.webm', '/video/rain2.webm', '/video/rain3.webm', '/video/rain4.webm', '/video/rain5.webm'];

	let player;

	let pause = $state(player?.paused);
	let volume = $state(0.8);
	let currentAudioSrc = $state(rainSrc[0]);
	let currentBgSrc = $state(backgroundSrc[1]);
	let menuHidden = $state(true);
	let time = $state(new Date());
	let currentTime = $derived(
	  `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`
	);
	let currentDate = $derived(time.toDateString());


	$effect(() => {
		pause = player.paused;
		console.log(player);
	});

	onMount(() => {
		const interval = setInterval(() => {
			time = new Date();
		})

		return () => {
			clearInterval(interval);
		}
	});


	function setPause() {
		pause = !pause;
		if (pause) {
			player.pause();
		} else {
			player.play();
		}
	}

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
	{#each backgroundSrc as src}
		<link rel="preload" href={src} as="video" />
	{/each}
</svelte:head>

<section>
	<div class="absolute w-full h-full object-cover -z-10">
		{#await currentBgSrc}
			<div class="absolute skeleton w-full h-full" />
		{:then src}
			<video
				class="absolute w-full h-full object-cover -z-10"
				muted
				autoplay
				loop
				playsinline
				disablepictureinpicture
				{src}
			/>
		{/await}
	</div>
	<audio bind:this={player} bind:paused={pause} bind:volume={volume} autoplay loop src={currentAudioSrc} />
</section>

<div class="min-w-fit h-svh flex flex-col">
	{#if !menuHidden}
		<main class="h-full">
			<div class="hero min-h-svh">
				<div class="hero-content flex-col w-full min-h-full">
					<div
						class="card  max-w-sm shrink-0 shadow-2xl bg-blur"
						transition:fly={{ y: -400}}
					>
						<div class="card-body rounded-lg w-80 lg:w-96 backdrop-blur-3xl">
							<div class="flex justify-end">
								<button class="btn btn-xs btn-ghost btn-circle" onclick={() => showMenu()}>
									<X />
								</button>
							</div>
							<div>
								<div class="flex flex-col justify-items-center">
									<div class="form-control">
										<div class="label">
											<span class="label-text">Playing</span>
										</div>
										{#if pause}
											<button
												class="btn border-transparent bg-cyan-500 shadow-2xl shadow-cyan-500/50 hover:bg-cyan-500 dark:text-black"
												onclick={() => setPause()}
											>
												<Play />
											</button>
										{:else}
											<button class="btn" onclick={() => setPause()}>
												<Pause />
											</button>
										{/if}
									</div>
									<div class="form-control">
										<label class="label">
											<span class="label-text">Volume</span>
										</label>
										<input
											type="range"
											min="0"
											max="1"
											step="0.01"
											class="range range-xs"
											bind:value={volume}
										/>
									</div>

									<div class="form-control">
										<label class="label">
											<span class="label-text">Select audio</span>
										</label>
										<div class="flex justify-center gap-2">
											{#each rainSrc as _, i}
												<button
													class="btn btn-sm"
													class:btn-active={currentAudioSrc === rainSrc[i]}
													onclick={() => (currentAudioSrc = rainSrc[i])}>{i + 1}</button
												>
											{/each}
										</div>
									</div>
									<div class="form-control">
										<label class="label">
											<span class="label-text">Select background</span>
										</label>
										<div class="flex justify-center gap-2">
											{#each backgroundSrc as _, i}
												<button
													class="btn btn-sm"
													class:btn-active={currentBgSrc === backgroundSrc[i]}
													onclick={() => (currentBgSrc = backgroundSrc[i])}>{i + 1}</button
												>
											{/each}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	{:else}
		<main class="flex-1">
			<div class="flex justify-center pt-3">
				<button
					class="btn btn-circle btn-ghost"
					onclick={() => showMenu()}
					in:fly={{ y: 20, delay: 500 }}
				>
					<CircleChevronDown />
				</button>
			</div>
			<div class="flex justify-end px-10">
				<div class="flex flex-col p-4 rounded-lg backdrop-blur-3xl text-white" transition:blur >
					<div class="flex justify-end text-3xl bold">{currentTime}</div>
					<div class="text-xl">{currentDate}</div>
				</div>
			</div>
		</main>
		<footer class="text-center text-xs text-gray-500 p-3" transition:blur>
			<span
				>Dev by ✨ <a href="mailto:meshchaninov.n@gmail.com" class="link">Nikita Meshchaninov</a
				></span
			>
		</footer>
	{/if}
</div>
