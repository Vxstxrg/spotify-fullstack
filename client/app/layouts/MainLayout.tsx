"use client"
import Navbar from '@/components/Navbar'; // Ваш кастомный Persistent Drawer компонент
import ThemeRegistry from '@/components/ThemeRegistry';
import { Container } from '@mui/material';
import StoreProvider from '@/components/StoreProvider'; // Импортируем ваш провайдер
import React from 'react';
import Player from '@/components/Player';

interface MainLayoutProps {
	children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
	return (
		// 1. Сначала инициализируем Redux Store, чтобы всё приложение имело доступ к стейту
		<StoreProvider>
			{/* 2. Затем инициализируем тему и кэш стилей */}
			<ThemeRegistry>
				{/* 3. Рендерим навигацию, которая теперь безопасно использует и тему, и Redux */}
				<Navbar>
					{/* 4. И уже внутрь контентной области передаем адаптивный контейнер */}
					<Container className="py-4">
						{children}
					</Container>
				</Navbar>
				{/* Плеер, скорее всего, сильно зависит от Redux (треки, статус проигрывания), теперь он внутри провайдера */}
				<Player />
			</ThemeRegistry>
		</StoreProvider>
	);
};

export default MainLayout;
