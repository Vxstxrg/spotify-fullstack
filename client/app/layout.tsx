
import React from 'react';
import MainLayout from './layouts/MainLayout'; // Путь к вашему макету с контейнером
import ThemeRegistry from '@/components/ThemeRegistry'; // Путь к вашему компоненту ThemeRegistryimport 
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>
				{/* ThemeRegistry нормализует гидратацию стилей MUI */}
				<ThemeRegistry>
					<MainLayout>
						{children}
					</MainLayout>
				</ThemeRegistry>
			</body>
		</html>
	);
}
