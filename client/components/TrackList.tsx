import React from 'react';
import { ITrack } from '@/types/track';
// Импортируем Stack вместо Grid — он создан для вертикальных списков
import { Stack } from '@mui/material';
import TrackItem from './TrackItem';

interface TrackListProps {
	tracks: ITrack[];
	// если передано — рядом с треком появляется кнопка «убрать из альбома»
	removeFromAlbum?: (track: ITrack) => void;
}

const TrackList: React.FC<TrackListProps> = ({ tracks, removeFromAlbum }) => {
	return (
		// direction="column" здесь работает без каких-либо ошибок TypeScript
		<Stack direction="column" spacing={2} sx={{ p: 2 }}>
			{tracks.map((track) => (
				// Больше не нужны лишние обертки, передаем ключ сразу в элемент списка
				<TrackItem
					key={track._id}
					track={track}
					onRemove={removeFromAlbum ? () => removeFromAlbum(track) : undefined}
				/>
			))}
		</Stack>
	);
};

export default TrackList;
