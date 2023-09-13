<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { username } from '$lib/store';
	import Icon from '@iconify/svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	export let open = false;

	let closable = true;

	$: closable = Boolean($username);
	$: open = !Boolean($username);

	let saveDisabled = false;

	let inputName = $username;

	$: saveDisabled = inputName === $username || !inputName?.trim();

	function handleSave() {
		if (!inputName?.trim()) return;
		$username = inputName.trim();
	}
</script>

<Dialog.Root bind:open closeOnEscape={closable} closeOnOutsideClick={closable}>
	<Dialog.Trigger>
		<Button size="sm">
			<Icon class="text-xl" icon="material-symbols:person-outline" />
		</Button>
	</Dialog.Trigger>
	<Dialog.Content closeButton={closable}>
		<Dialog.Header>
			<Dialog.Title>User Settings</Dialog.Title>

			<hr class="pt-2 pb-4" />

			<div class="flex flex-col">
				<div class="flex flex-col w-full gap-1.5">
					<Label class="w-fit" for="name">Name</Label>
					<Input
						autocomplete="false"
						bind:value={inputName}
						type="text"
						id="name"
						placeholder="Name"
					/>
					<p class="w-fit text-sm text-muted-foreground">This will be shown publically.</p>
				</div>

				<div class="w-full flex justify-end">
					<Button on:click={handleSave} disabled={saveDisabled} size="sm">Save</Button>
				</div>
			</div>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>
