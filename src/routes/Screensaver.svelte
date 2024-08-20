<script>
	import { CircleChevronDown } from "lucide-svelte";
	import { onMount } from "svelte";
	import { fly, blur } from "svelte/transition";

    let { showMenu } = $props();

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
				<div class="flex flex-col p-4 rounded-lg backdrop-blur-3xl text-white" transition:blur>
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