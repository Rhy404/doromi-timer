import { writable } from 'svelte/store';

export const timerSettings = writable({
    productivity: 25 * 60, //default 25 mins to secs
    break: 5 * 60 //default 5 mins to secs
});

export const globalCancel = writable(false); //true when cancel is pressed