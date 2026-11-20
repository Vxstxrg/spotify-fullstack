import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './reducders/index'; // Ваша папка с редюсерами

// 1. Экспортируем чистую функцию makeStore (без createWrapper)
export const makeStore = () => configureStore({
	reducer: rootReducer,
	devTools: process.env.NODE_ENV !== 'production', // Включает DevTools только в разработке
});

// 2. Экспортируем типы для использования в компонентах и провайдере
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
