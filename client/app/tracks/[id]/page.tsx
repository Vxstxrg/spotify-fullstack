'use client'
import { ITrack } from '@/types/track';
import { Button, Grid, TextField, Box, Alert } from '@mui/material';
import { MusicNote as MusicNoteIcon } from '@mui/icons-material';
import React, { useEffect, useState, Suspense } from 'react'
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { API_URL, serverAsset } from '@/const/api';
import { api, apiError } from '@/lib/api';
import { useTypedSelector } from '@/hooks/useTypedSelector';

// useParams отдаёт данные только в рантайме — оборачиваем в Suspense,
// чтобы страница могла пререндериться (требование Next.js с cacheComponents)
const TrackPage = () => {
	const { id } = useParams<{ id: string }>();
	const { isAuth } = useTypedSelector(state => state.auth);
	const [track, setTrack] = useState<ITrack | null>(null);
	const [error, setError] = useState('');
	const [commentText, setCommentText] = useState('');
	const [sending, setSending] = useState(false);

	const loadTrack = async () => {
		try {
			// открывая страницу, засчитываем прослушивание
			const listenRes = await fetch(`${API_URL}/tracks/listen/${id}`, { method: 'POST' });
			if (!listenRes.ok) {
				throw new Error(`Ошибка загрузки трека: ${listenRes.status}`);
			}
			setTrack(await listenRes.json());
		} catch (e) {
			setError((e as Error).message);
		}
	};

	useEffect(() => {
		loadTrack();
	}, [id]);

	const submitComment = async () => {
		if (!commentText.trim()) return;
		setSending(true);
		try {
			const res = await api('/tracks/comment', {
				method: 'POST',
				body: JSON.stringify({ text: commentText, trackId: id })
			});
			if (!res.ok) {
				throw new Error(await apiError(res));
			}
			setCommentText('');
			await loadTrack();
		} catch (e) {
			setError((e as Error).message);
		} finally {
			setSending(false);
		}
	};

	if (error && !track) {
		return <Alert severity="error">{error}</Alert>;
	}

	if (!track) {
		return <div>Загрузка...</div>;
	}

	return (
		<div>
			<Button
				variant="outlined"
				color="primary"
				href="/tracks"
				style={{ fontSize: 32 }}
			>
				К списку
			</Button>
			<Grid container sx={{ margin: '30px 0px', gap: '40px', alignItems: 'center' }}>
				{track.picture ? (
					<img
						src={serverAsset(track.picture)}
						alt={track.name}
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

				<div>
					<h1>Название трека - {track.name}</h1>
					<h1>Исполнитель - {track.artist}</h1>
					<h1>Прослушиваний: {track.listens}</h1>
				</div>

			</Grid>
			<h1>Текст</h1>
			<p>{track.text}</p>

			<h1>Комментарии</h1>
			{isAuth ? (
				<Grid container sx={{ margin: '30px 0px', gap: '10px', flexDirection: 'column', alignItems: 'flex-end' }}>
					<TextField
						placeholder="Ваш комментарий"
						fullWidth
						multiline
						rows={4}
						value={commentText}
						onChange={(e) => setCommentText(e.target.value)}
					/>
					<Button
						variant="contained"
						color="primary"
						onClick={submitComment}
						disabled={sending || !commentText.trim()}
					>
						Отправить
					</Button>
				</Grid>
			) : (
				<Alert severity="info" sx={{ margin: '30px 0' }}>
					Чтобы оставить комментарий, <Link href="/login">войдите</Link> в аккаунт
				</Alert>
			)}
			{error && track && <Alert severity="error">{error}</Alert>}
			<div>

				{track.comments.map((comment) => (
					<div key={comment._id}>
						<h2>{comment.username}</h2>
						<p>{comment.text}</p>
					</div>
				))}
			</div>
		</div>
	);
}

export default function Page() {
	return (
		<Suspense fallback={<div>Загрузка...</div>}>
			<TrackPage />
		</Suspense>
	);
}
