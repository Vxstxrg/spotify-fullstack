"use client"
import FileUpload from '@/components/FileUpload';
import StepWrapper from '@/components/StepWrapper';
import { Button, Grid, TextField, Alert, Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import React from 'react'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, apiError } from '@/lib/api';
import { IAlbum } from '@/types/track';
import { useTypedSelector } from '@/hooks/useTypedSelector';

const Create = () => {
	const router = useRouter();
	const { isAuth } = useTypedSelector(state => state.auth);
	const [activeStep, setActiveStep] = useState(0);
	const [name, setName] = useState('');
	const [artist, setArtist] = useState('');
	const [text, setText] = useState('');
	const [picture, setPicture] = useState<File | null>(null);
	const [audio, setAudio] = useState<File | null>(null);
	const [albums, setAlbums] = useState<IAlbum[]>([]);
	const [albumId, setAlbumId] = useState('');
	const [error, setError] = useState('');
	const [sending, setSending] = useState(false);

	// создавать треки могут только авторизованные
	useEffect(() => {
		if (!isAuth) {
			router.replace('/login');
		}
	}, [isAuth]);

	useEffect(() => {
		if (!isAuth) return;
		api('/albums')
			.then(res => res.ok ? res.json() : [])
			.then(setAlbums)
			.catch(() => { });
	}, [isAuth]);

	const next = () => {
		setActiveStep((prev) => prev + 1);
	}

	const back = () => {
		setActiveStep((prev) => prev - 1);
	}

	const submit = async () => {
		setSending(true);
		setError('');
		try {
			const formData = new FormData();
			formData.append('name', name);
			formData.append('artist', artist);
			formData.append('text', text);
			if (albumId) formData.append('albumId', albumId);
			if (picture) formData.append('picture', picture);
			if (audio) formData.append('audio', audio);

			const res = await api('/tracks', {
				method: 'POST',
				body: formData
			});
			if (!res.ok) {
				throw new Error(await apiError(res));
			}
			router.push('/tracks');
		} catch (e) {
			setError((e as Error).message);
			setSending(false);
		}
	}

	const infoValid = name.trim() !== '' && artist.trim() !== '';

	if (!isAuth) {
		return <div>Требуется вход в аккаунт...</div>;
	}

	return (<>
		<StepWrapper activeStep={activeStep}>
			{activeStep === 0 &&
				<Grid container sx={{ justifyContent: 'center', padding: '10px', flexDirection: "column", gap: "16px" }}>
					<TextField
						placeholder='Введите название трека'
						fullWidth
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
					<TextField
						placeholder='Введите имя автора'
						fullWidth
						value={artist}
						onChange={(e) => setArtist(e.target.value)}
					/>
					<TextField
						placeholder='Введите текст песни'
						fullWidth
						multiline
						rows={3}
						value={text}
						onChange={(e) => setText(e.target.value)}
					/>
					<FormControl fullWidth>
						<InputLabel id="album-select-label">Альбом (необязательно)</InputLabel>
						<Select
							labelId="album-select-label"
							value={albumId}
							label="Альбом (необязательно)"
							onChange={(e) => setAlbumId(e.target.value)}
						>
							<MenuItem value="">
								<em>Без альбома</em>
							</MenuItem>
							{albums.map(album => (
								<MenuItem key={album._id} value={album._id}>
									{album.name} — {album.artist}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					{!infoValid && <Box sx={{ color: 'text.secondary', fontSize: 14 }}>Название и автор обязательны</Box>}
				</Grid>
			}

			{activeStep === 1 &&

				<FileUpload setFile={setPicture} accept='image/*'>
					<Button>
						Загрузить обложку{picture ? `: ${picture.name}` : ''}
					</Button>
				</FileUpload>

			}

			{activeStep === 2 &&
				<FileUpload setFile={setAudio} accept='audio/*'>
					<Button>
						Загрузить аудио файл{audio ? `: ${audio.name}` : ''}
					</Button>
				</FileUpload>
			}

		</StepWrapper >
		{error && <Alert severity="error">{error}</Alert>}
		<Grid container sx={{ display: "flex", justifyContent: "space-between" }}>
			<Button onClick={back} disabled={activeStep === 0} variant="outlined"
				size="large">
				Назад
			</Button>
			{activeStep < 2 ? (
				<Button onClick={next} disabled={activeStep === 0 ? !infoValid : false} variant="outlined"
					size="large">
					Далее
				</Button>
			) : (
				<Button onClick={submit} disabled={!infoValid || sending} variant="contained"
					size="large">
					Опубликовать
				</Button>
			)}
		</Grid>
	</>
	);
}
export default Create;
