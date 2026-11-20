'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '@/store/index';
import { checkAuth } from '@/store/actions-creators/auth';

export default function StoreProvider({ children }: { children: ReactNode }) {
	// useState с функцией гарантирует, что makeStore() выполнится ровно один раз
	// и только при самом первом, ленивом рендере компонента.
	const [store] = useState<AppStore>(() => makeStore());

	// восстанавливаем сессию по сохранённому JWT-токену
	useEffect(() => {
		store.dispatch(checkAuth());
	}, [store]);

	return <Provider store={store}>{children}</Provider>;
}
