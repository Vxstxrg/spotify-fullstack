'use client'
import React, { useEffect, useState } from 'react';
import { Button, Grid, Card, Box, IconButton, Alert } from '@mui/material';
import { MusicNote as MusicNoteIcon, Delete, Album as AlbumIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { IAlbum } from '@/types/track';
import { api, apiError } from '@/lib/api';
import { serverAsset } from '@/const/api';

const AlbumsPage = () => {
	const router = useRouter();
	const [albums, setAlbums] = useState<IAlbum[]>([]);
	const [error, setError] = useState('');

	const loadAlbums = async () => {
		try {
			const res = await api('/albums');
			if (!res.ok) {
				throw new Error(await apiError(res));
			}
			setAlbums(await res.json());
		} catch (e) {
			setError((e as Error).message);
		}
	};

	useEffect(() => {
		loadAlbums();
	}, []);

	const remove = async (e: React.MouseEvent, id: string) => {
		e.stopPropagation();
		const res = await api(`/albums/${id}`, { method: 'DELETE' });
		if (!res.ok) {
			setError(await apiError(res));
			return;
		}
		setAlbums(prev => prev.filter(album => album._id !== id));
	};

	return (
		<Grid
			container
			sx={{
				justifyContent: 'center',
				minHeight: '100vh',
			}}
		>
			<Grid
				size={{ xs: 12, sm: 10, md: 12 }}
				sx={{
					maxWidth: '1000px',
					width: '100%'
				}}
			>
				<Card sx={{ width: '100%' }}>
					<Box sx={{ p: '30px' }}>

						<Grid
							container
							sx={{
								justifyContent: 'space-between',
								alignItems: 'center',
								gap: 2,
								p: 2
							}}
						>
							<h1 className="text-xl font-semibold">
								Список альбомов
							</h1>

							<Button
								variant="contained"
								color="primary"
								href="/albums/create"
								startIcon={<AlbumIcon />}
							>
								Добавить альбом
							</Button>
						</Grid>

						{error && <Box sx={{ px: 2, pb: 2 }}><Alert severity="error">{error}</Alert></Box>}

						{albums.length === 0 ? (
							<Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
								Альбомов пока нет
							</Box>
						) : (
							albums.map(album => (
								<Box
									key={album._id}
									sx={{
										display: 'flex',
										alignItems: 'center',
										gap: 2,
										m: '10px',
										p: '10px',
										borderRadius: 1,
										bgcolor: 'action.hover',
										cursor: 'pointer'
									}}
									onClick={() => router.push('/albums/' + album._id)}
								>
									{album.picture ? (
										<img
											src={serverAsset(album.picture)}
											alt={album.name}
											width={70}
											height={70}
											className="object-cover"
										/>
									) : (
										<Box sx={{
											width: 70,
											height: 70,
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											bgcolor: 'action.selected',
											borderRadius: 1
										}}>
											<MusicNoteIcon />
										</Box>
									)}
									<Box sx={{ flex: 1, minWidth: 0 }}>
										<div className="break-words whitespace-normal">
											{album.name}
										</div>
										<div className="text-xs text-gray-500">
											{album.artist}
										</div>
									</Box>
									<IconButton onClick={(e) => remove(e, album._id)}>
										<Delete />
									</IconButton>
								</Box>
							))
						)}

					</Box>
				</Card>
			</Grid>
		</Grid>
	);
};

export default AlbumsPage;
