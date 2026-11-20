'use client'
import React, { useEffect, useState, Suspense } from 'react';
import { Button, Grid, Box, Alert } from '@mui/material';
import { MusicNote as MusicNoteIcon } from '@mui/icons-material';
import { useParams, useRouter } from 'next/navigation';
import { IAlbum } from '@/types/track';
import { api, apiError } from '@/lib/api';
import { serverAsset } from '@/const/api';
import TrackList from '@/components/TrackList';

// как и на странице трека: useParams требует Suspense для пререндера
const AlbumPage = () => {
	const { id } = useParams<{ id: string }>();
	const router = useRouter();
	const [album, setAlbum] = useState<IAlbum | null>(null);
	const [error, setError] = useState('');

	const loadAlbum = async () => {
		try {
			const res = await api(`/albums/${id}`);
			if (!res.ok) {
				throw new Error(await apiError(res));
			}
			setAlbum(await res.json());
		} catch (e) {
			setError((e as Error).message);
		}
	};

	useEffect(() => {
		loadAlbum();
	}, [id]);

	const removeAlbum = async () => {
		const res = await api(`/albums/${id}`, { method: 'DELETE' });
		if (!res.ok) {
			setError(await apiError(res));
			return;
		}
		router.push('/albums');
	};

	if (error && !album) {
		return <Alert severity="error">{error}</Alert>;
	}

	if (!album) {
		return <div>Загрузка...</div>;
	}

	return (
		<div>
			<Button
				variant="outlined"
				color="primary"
				href="/albums"
				style={{ fontSize: 32 }}
			>
				К списку
			</Button>
			<Grid container sx={{ margin: '30px 0px', gap: '40px', alignItems: 'center' }}>
				{album.picture ? (
					<img
						src={serverAsset(album.picture)}
						alt={album.name}
						width={200}
						height={200}
					/>
				) : (
					<Box sx={{
						width: 200,
						height: 200,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						bgcolor: 'action.hover',
						borderRadius: 2
					}}>
						<MusicNoteIcon sx={{ fontSize: 64 }} />
					</Box>
				)}

				<Box sx={{ flex: 1, minWidth: 0 }}>
					<h1>Альбом - {album.name}</h1>
					<h1>Исполнитель - {album.artist}</h1>
					<Button
						variant="outlined"
						color="error"
						onClick={removeAlbum}
						sx={{ mt: 2 }}
					>
						Удалить альбом
					</Button>
				</Box>
			</Grid>

			{error && album && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

			<h1>Треки альбома</h1>
			{album.tracks && album.tracks.length > 0 ? (
				<TrackList tracks={album.tracks} />
			) : (
				<Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
					В этом альбоме пока нет треков
				</Box>
			)}
		</div>
	);
}

export default function Page() {
	return (
		<Suspense fallback={<div>Загрузка...</div>}>
			<AlbumPage />
		</Suspense>
	);
}
