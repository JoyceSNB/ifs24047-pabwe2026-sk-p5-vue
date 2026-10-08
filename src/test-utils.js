import { render } from '@testing-library/vue';
import { createPinia, setActivePinia } from 'pinia';
import { createAppRouter } from './router';
export function renderWithProviders(component, options={}) { const pinia=createPinia(); setActivePinia(pinia); const router=options.router||createAppRouter(); const result=render(component,{...options,global:{...(options.global||{}),plugins:[pinia,router,...(options.global?.plugins||[])]}}); return {...result,pinia,router,aucationsStore:undefined}; }
