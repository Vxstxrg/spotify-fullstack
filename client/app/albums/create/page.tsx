'use client'
import React, { useEffect, useState } from 'react';
import { Button, Grid, TextField, Card, Alert, Box } from '@mui/material';
import FileUpload from '@/components/FileUpload';
import { useRouter } from 'next/navigation';
import { api, apiError } from '@/lib/api';
import { useTypedSelector } from '@/hooks/useTypedSelector';

const CreateAlbum = () => {
	const router = useRouter();
	const { isAuth } = useTypedSelector(state => state.auth);
	const [name, setName] = useState('');
	const [artist, setArtist] = useState('');
	const [picture, setPicture] = useState<File | null>(null);
	const [error, setError] = useState('');
	const [sending, setSending] = useState(false);

	// создавать альбомы могут только авторизованные
	useEffect(() => {
		if (!isAuth) {
			router.replace('/login');
		}
	}, [isAuth]);

	const submit = async () => {
		setSending(true);
		setError('');
		try {
			const formData = new FormData();
			formData.append('name', name);
			formData.append('artist', artist);
			if (picture) formData.append('picture', picture);

			const res = await api('/albums', {
				method: 'POST',
				body: formData
			});
			if (!res.ok) {
				throw new Error(await apiError(res));
			}
			router.push('/albums');
		} catch (e) {
			setError((e as Error).message);
			setSending(false);
		}
	};

	const valid = name.trim() !== '' && artist.trim() !== '';

	if (!isAuth) {
		return <div>Требуется вход в аккаунт...</div>;
	}

	return (
		<Grid container sx={{ justifyContent: 'center', margin: '30px 0' }}>
			<Grid size={{ xs: 12, sm: 10, md: 6 }}>
				<Card sx={{ p: '30px' }}>
					<h1 className="text-xl font-semibold" style={{ marginBottom: 20 }}>
						Создание альбома
					</h1>
					<Grid container sx={{ flexDirection: 'column', gap: '16px' }}>
						<TextField
							placeholder='Название альбома'
							fullWidth
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
						<TextField
							placeholder='Исполнитель'
							fullWidth
							value={artist}
							onChange={(e) => setArtist(e.target.value)}
						/>
						<FileUpload setFile={setPicture} accept='image/*'>
							<Button>
								Загрузить обложку{picture ? `: ${picture.name}` : ''}
							</Button>
						</FileUpload>
						{error && <Alert severity="error">{error}</Alert>}
						<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
							<Button variant="outlined" size="large" href="/albums">
								Отмена
							</Button>
							<Button
								variant="contained"
								size="large"
								onClick={submit}
								disabled={!valid || sending}
							>
								Создать
							</Button>
						</Box>
					</Grid>
				</Card>
			</Grid>
		</Grid>
	);
};

export default CreateAlbum;
