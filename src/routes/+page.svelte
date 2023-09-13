<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { username } from '$lib/store';
	import Icon from '@iconify/svelte';
	import Header from './Header.svelte';
	import { trpc } from '$lib/trpc/client';
	import { onMount } from 'svelte';
	import pusher from '$lib/pusher/client';
	import { randomString } from '$lib/utils';

	let message = '';

	enum Status {
		SENDING,
		SENT,
		RECEIVED
	}

	interface Chat {
		id: string;
		message: string;
		username: string;
		sentAt: number;
		status: Status;
		owner: boolean;
	}

	let chats: Chat[] = [];

	function getChatById(id: string) {
		return chats.find((e) => e.id == id);
	}

	function updateChatById(id: string, data: Partial<Chat>) {
		chats = chats.map((e) => {
			if (e.id === id) {
				e = {
					...e,
					...data
				};
			}
			return e;
		});

		return chats;
	}

	function scrollAtEnd() {
		const lastId = chats.at(-1)?.id;

		console.log('lastId?', lastId);
		if (!lastId) return;

		setTimeout(() => {
			const doc = document.querySelector(`#chat-${lastId}`);
			console.log('doc?', doc);

			doc?.scrollIntoView();
		}, 10);
	}

	async function sendMessage() {
		if (!$username) return;

		if (!message.trim()) return;

		let data = {
			id: randomString(21),
			message,
			username: $username,
			sentAt: Date.now()
		};

		message = '';

		chats = [
			...chats,
			{
				...data,
				status: Status.SENDING,
				owner: true
			}
		];

		scrollAtEnd();

		let response = await trpc().sendMessage.query({
			...data
		});

		console.log('response?', response);
		updateChatById(data.id, {
			status: Status.SENT
		});
	}

	onMount(() => {
		const channel = pusher.subscribe('chatpat-prototype');
		channel.bind('new-message', (data: Omit<Chat, 'status'>) => {
			console.log('data?', data);

			if (getChatById(data.id)) {
				updateChatById(data.id, {
					status: Status.RECEIVED
				});
				return;
			}

			chats = [
				...chats,
				{
					...data,
					status: Status.RECEIVED,
					owner: false
				}
			];
			scrollAtEnd();
		});

		return () => {
			channel.unbind_all();
			channel.unsubscribe();
		};
	});
</script>

<div class="w-full h-full max-h-[100dvh] flex flex-col justify-between">
	<Header />

	<!-- Body -->
	<div class="w-full h-full overflow-auto">
		<div class="w-full h-fit grow flex flex-col overflow-y-auto py-10">
			{#each chats as chat}
				{@const SECRET_CODE = '@SHADOW'}
				<!-- wrapper -->
				<div
					id="chat-{chat.id}"
					class="w-full px-4 max-md:px-3 py-1 flex {chat.owner ? 'justify-end' : 'justify-start'}"
				>
					<!-- box -->
					<div
						class="flex flex-col min-w-[100px] max-w-full px-3 py-2 pb-1 bg-primary text-primary-foreground rounded {chat.owner
							? ''
							: 'bg-secondary text-secondary-foreground'}"
					>
						<!-- header -->
						<div class="text-xs font-bold">
							{chat.username}
						</div>
						<!-- content -->
						<div class="mt-1 text-sm">
							{#if chat.message.startsWith(SECRET_CODE)}
								{@html chat.message.substring(SECRET_CODE.length)}
							{:else}
								{chat.message}
							{/if}
						</div>
						<!-- footer -->
						<div class="w-full flex justify-end text-muted-foreground text-[10px] mt-1">
							{new Date(chat.sentAt).toLocaleTimeString()}
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Footer -->
	<div class="w-full px-2 py-1 pb-2 max-md:px-1 max-md:py-1 border-t">
		<!--  -->
		<div class="flex flex-col w-full gap-1.5">
			<Label for="message" class="w-fit text-xs"
				>Send message as <span class="text-blue-600">{$username}</span>,</Label
			>
			<div class="flex gap-1 max-md:gap-0.5">
				<Input
					on:keydown={(e) => {
						if (e.keyCode === 13) {
							sendMessage();
						}
					}}
					bind:value={message}
					class=""
					type="text"
					id="message"
					placeholder="Type anything"
				/>
				<Button on:click={sendMessage} class="px-3"><Icon class="text-lg" icon="mdi:send" /></Button
				>
			</div>
		</div>
	</div>
</div>
