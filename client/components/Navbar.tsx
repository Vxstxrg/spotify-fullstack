"use client";

import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeIcon from '@mui/icons-material/Home';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import AlbumIcon from '@mui/icons-material/Album';
import { useRouter } from 'next/navigation';
import { Button, Chip } from '@mui/material';
import { useTypedSelector } from '@/hooks/useTypedSelector';
import { useActions } from '@/hooks/useActions';

const drawerWidth = 240;

const menuItems = [
	{ text: 'Главная', href: '/', icon: <HomeIcon /> },
	{ text: 'Список треков', href: '/tracks', icon: <MusicNoteIcon /> },
	{ text: 'Список альбомов', href: '/albums', icon: <AlbumIcon /> },
]

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
	open?: boolean;
}>(({ theme }) => ({
	flexGrow: 1,
	padding: theme.spacing(3),
	transition: theme.transitions.create('margin', {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	marginLeft: `-${drawerWidth}px`,
	variants: [
		{
			props: ({ open }) => open,
			style: {
				transition: theme.transitions.create('margin', {
					easing: theme.transitions.easing.easeOut,
					duration: theme.transitions.duration.enteringScreen,
				}),
				marginLeft: 0,
			},
		},
	],
}));

interface AppBarProps extends MuiAppBarProps {
	open?: boolean;
}

const AppBar = styled(MuiAppBar, {
	shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme }) => ({
	transition: theme.transitions.create(['margin', 'width'], {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	variants: [
		{
			props: ({ open }) => open,
			style: {
				width: `calc(100% - ${drawerWidth}px)`,
				marginLeft: `${drawerWidth}px`,
				transition: theme.transitions.create(['margin', 'width'], {
					easing: theme.transitions.easing.easeOut,
					duration: theme.transitions.duration.enteringScreen,
				}),
			},
		},
	],
}));

const DrawerHeader = styled('div')(({ theme }) => ({
	display: 'flex',
	alignItems: 'center',
	padding: theme.spacing(0, 1),
	...theme.mixins.toolbar,
	justifyContent: 'flex-end',
}));

interface MainLayoutProps {
	children: React.ReactNode;
}

// Заглушка подписки для useSyncExternalStore
const emptySubscribe = () => () => { };

export default function MainLayout({ children }: MainLayoutProps) {
	const theme = useTheme();
	const [open, setOpen] = React.useState(false);
	const router = useRouter();
	const { isAuth, user } = useTypedSelector(state => state.auth);
	const { logout } = useActions();

	// Безопасное определение клиента без useEffect и каскадных рендеров
	const isMounted = React.useSyncExternalStore(
		emptySubscribe,
		() => true,  // Значение в браузере (после гидратации)
		() => false  // Значение на сервере (при SSR)
	);

	const handleDrawerOpen = () => {
		setOpen(true);
	};

	const handleDrawerClose = () => {
		setOpen(false);
	};

	return (
		<Box sx={{ display: 'flex' }}>
			<CssBaseline />

			{/* Рендерим AppBar и Drawer только в браузере для защиты от Hydration Mismatch */}
			{isMounted && (
				<>
					<AppBar position="fixed" open={open}>
						<Toolbar>
							<IconButton
								color="inherit"
								aria-label="open drawer"
								onClick={handleDrawerOpen}
								edge="start"
								sx={[
									{ mr: 2 },
									open && { display: 'none' },
								]}
							>
								<MenuIcon />
							</IconButton>
							<Typography variant="h6" noWrap component="div">
								Музыкальная Платформа
							</Typography>
							<Box sx={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
								{isAuth ? (
									<>
										<Chip label={user?.username} size="small" color="default" />
										{user?.role === 'admin' && (
											<Chip label="admin" size="small" color="primary" variant="outlined" />
										)}
										<Button color="inherit" size="small" onClick={() => logout()}>
											Выйти
										</Button>
									</>
								) : (
									<>
										<Button color="inherit" size="small" href="/login">
											Войти
										</Button>
										<Button color="inherit" size="small" variant="outlined" href="/register">
											Регистрация
										</Button>
									</>
								)}
							</Box>
						</Toolbar>
					</AppBar>
					<Drawer
						sx={{
							width: drawerWidth,
							flexShrink: 0,
							'& .MuiDrawer-paper': {
								width: drawerWidth,
								boxSizing: 'border-box',
							},
						}}
						variant="persistent"
						anchor="left"
						open={open}
					>
						<DrawerHeader>
							<IconButton aria-label="close drawer" onClick={handleDrawerClose}>
								{theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
							</IconButton>
						</DrawerHeader>
						<Divider />
						<List>
							{menuItems.map(({ text, href, icon }) => (
								<ListItem key={href} onClick={() => router.push(href)} disablePadding>
									<ListItemButton>
										<ListItemIcon>
											{icon}
										</ListItemIcon>
										<ListItemText primary={text} />
									</ListItemButton>
								</ListItem>
							))}
						</List>
					</Drawer>
				</>
			)}

			{/* Контент страниц и каркас Main рендерятся ВСЕГДА (и на сервере, и на клиенте) */}
			<Main open={open}>
				<DrawerHeader />
				{children}
			</Main>
		</Box>
	);
}
