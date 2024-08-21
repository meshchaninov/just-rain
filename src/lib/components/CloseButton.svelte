<script>
	import { X } from "lucide-svelte";

	let { onClose } = $props();
</script>

<button class="btn btn-xs btn-ghost btn-circle" onclick={() => onClose()}>
	<X />
</button>
