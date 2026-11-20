'use client'
import React, { useEffect, useState } from 'react';
import { Card, Grid, Button, Box, TextField, InputAdornment, Alert } from '@mui/material';
import { Search } from '@mui/icons-material';
import TrackList from '@/components/TrackList';
import { useTypedSelector } from '@/hooks/useTypedSelector';
import { useActions } from '@/hooks/useActions';

const TracksPage = () => {
	const { tracks, error } = useTypedSelector(state => state.track)
	const { fetchTracks, searchTracks } = useActions()
	const [query, setQuery] = useState('')
	const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

	useEffect(() => {
		fetchTracks()
	}, [])

	// поиск с задержкой, чтобы не дёргать API на каждый символ
	const search = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setQuery(value)
		if (timer) clearTimeout(timer)
		const t = setTimeout(() => {
			value ? searchTracks(value) : fetchTracks()
		}, 500)
		setTimer(t)
	}

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

						{/* Заголовок, поиск и кнопка */}
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
								Список треков
							</h1>

							<TextField
								placeholder="Поиск по названию или исполнителю"
								value={query}
								onChange={search}
								size="small"
								sx={{ flexGrow: 1, maxWidth: 400 }}
								slotProps={{
									input: {
										startAdornment: (
											<InputAdornment position="start">
												<Search />
											</InputAdornment>
										)
									}
								}}
							/>

							<Button
								variant="contained"
								color="primary"
								href="/tracks/create"
							>
								Добавить трек
							</Button>
						</Grid>

					</Box>

					{/* Список */}
					{error && <Box sx={{ px: 2, pb: 2 }}><Alert severity="error">{error}</Alert></Box>}
					<TrackList tracks={tracks} />

				</Card>
			</Grid>
		</Grid>

	);
};

export default TracksPage;
