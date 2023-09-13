import { persisted } from 'svelte-local-storage-store'

export const username = persisted<string | null>("_chatpat_prototype_username", null);