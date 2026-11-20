import React from 'react';
import { ITrack } from '@/types/track';
// Импортируем Stack вместо Grid — он создан для вертикальных списков
import { Stack } from '@mui/material';
import TrackItem from './TrackItem';

interface TrackListProps {
	tracks: ITrack[];
}

const TrackList: React.FC<TrackListProps> = ({ tracks }) => {
	return (
		// direction="column" здесь работает без каких-либо ошибок TypeScript
		<Stack direction="column" spacing={2} sx={{ p: 2 }}>
			{tracks.map((track) => (
				// Больше не нужны лишние обертки, передаем ключ сразу в элемент списка
				<TrackItem key={track._id} track={track} />
			))}
		</Stack>
	);
};

export default TrackList;
