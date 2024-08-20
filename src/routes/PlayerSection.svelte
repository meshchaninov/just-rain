<script>
    let { bgSrcVideo, bgSrcPreview, audioSrc, volume = $bindable(), pause = $bindable(), player = $bindable() } = $props();
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
		/>
	</div>
	<audio bind:this={player} bind:paused={pause} bind:volume autoplay loop src={audioSrc} />
</section>