'use client'
import React, { useEffect, useState, Suspense } from 'react';
import { Button, Grid, Box, Alert, Autocomplete, TextField } from '@mui/material';
import { MusicNote as MusicNoteIcon } from '@mui/icons-material';
import { useParams, useRouter } from 'next/navigation';
import { IAlbum, ITrack } from '@/types/track';
import { api, apiError } from '@/lib/api';
import { serverAsset } from '@/const/api';
import TrackList from '@/components/TrackList';
import { useTypedSelector } from '@/hooks/useTypedSelector';

// как и на странице трека: useParams требует Suspense для пререндера
const AlbumPage = () => {
	const { id } = useParams<{ id: string }>();
	const router = useRouter();
	const { isAuth, user } = useTypedSelector(state => state.auth);
	const [album, setAlbum] = useState<IAlbum | null>(null);
	const [allTracks, setAllTracks] = useState<ITrack[]>([]);
	const [selectedTrack, setSelectedTrack] = useState<ITrack | null>(null);
	const [error, setError] = useState('');

	// управлять составом альбома может его автор или администратор
	const canManage = !!album && isAuth && !!user && (user.role === 'admin' || album.user === user._id);

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

	useEffect(() => {
		if (!canManage) return;
		// список для выбора: треки, не состоящие ни в одном альбоме
		api('/tracks?count=100')
			.then(res => res.ok ? res.json() : [])
			.then((tracks: ITrack[]) => setAllTracks(tracks.filter(t => !t.album)))
			.catch(() => { });
	}, [canManage]);

	const addTrack = async () => {
		if (!selectedTrack) return;
		const res = await api(`/albums/${id}/tracks/${selectedTrack._id}`, { method: 'POST' });
		if (!res.ok) {
			setError(await apiError(res));
			return;
		}
		setError('');
		setAlbum(await res.json());
		setSelectedTrack(null);
	}

	const removeTrack = async (track: ITrack) => {
		const res = await api(`/albums/${id}/tracks/${track._id}`, { method: 'DELETE' });
		if (!res.ok) {
			setError(await apiError(res));
			return;
		}
		setError('');
		setAlbum(await res.json());
	}

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

	const freeTracks = allTracks.filter(t => !album.tracks?.some(at => at._id === t._id));

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
					{canManage && (
						<Button
							variant="outlined"
							color="error"
							onClick={removeAlbum}
							sx={{ mt: 2 }}
						>
							Удалить альбом
						</Button>
					)}
				</Box>
			</Grid>

			{error && album && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

			<h1>Треки альбома</h1>
			{canManage && (
				<Grid container sx={{ alignItems: 'center', gap: 2, mb: 2 }}>
					<Autocomplete
						sx={{ minWidth: 420, flex: 1, maxWidth: 600 }}
						options={freeTracks}
						value={selectedTrack}
						onChange={(e, value) => setSelectedTrack(value)}
						getOptionLabel={(t) => `${t.name} — ${t.artist}`}
						isOptionEqualToValue={(a, b) => a._id === b._id}
						noOptionsText="Подходящих треков не найдено"
						renderOption={(props, t) => {
							const { key, ...optionProps } = props;
							return (
								<Box component="li" key={key} {...optionProps} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
									{t.picture ? (
										<img
											src={serverAsset(t.picture)}
											alt=""
											width={40}
											height={40}
											style={{ borderRadius: 4, objectFit: 'cover' }}
										/>
									) : (
										<Box sx={{
											width: 40,
											height: 40,
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											bgcolor: 'action.selected',
											borderRadius: 1
										}}>
											<MusicNoteIcon fontSize="small" />
										</Box>
									)}
									<Box sx={{ minWidth: 0 }}>
										<div>{t.name}</div>
										<div style={{ fontSize: 13, color: 'gray' }}>{t.artist}</div>
									</Box>
								</Box>
							);
						}}
						renderInput={(params) => (
							<TextField
								{...params}
								label="Добавить трек в альбом"
								placeholder="Поиск по названию или исполнителю"
							/>
						)}
					/>
					<Button
						variant="contained"
						onClick={addTrack}
						disabled={!selectedTrack}
					>
						Добавить
					</Button>
				</Grid>
			)}
			{album.tracks && album.tracks.length > 0 ? (
				<TrackList tracks={album.tracks} removeFromAlbum={canManage ? removeTrack : undefined} />
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
