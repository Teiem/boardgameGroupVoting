import { browser } from "$app/environment";

export const localState = <const K extends string, T>(key: K extends "" ? never : K, value: T) => {
	const state = $state<{ value: T }>({ value });

	if (browser) {
		const item = localStorage.getItem(key);
		if (item) state.value = JSON.parse(item);
	}

	$effect(() => {
		localStorage.setItem(key, JSON.stringify(state.value));
	});

	return state;
};
