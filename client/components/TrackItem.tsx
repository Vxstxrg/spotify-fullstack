"use client"

import { useActions } from '@/hooks/useActions';
import { ITrack } from '@/types/track';
import { Delete, MusicNote, Pause, PlayArrow } from '@mui/icons-material';
import { Card, IconButton, Grid, Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useTypedSelector } from '@/hooks/useTypedSelector';
import { serverAsset } from '@/const/api';

interface TrackItemProps {
	track: ITrack;
}

const formatTime = (seconds: number) => {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}:${String(secs).padStart(2, '0')}`;
}

const TrackItem: React.FC<TrackItemProps> = ({ track }) => {
	const router = useRouter();
	const { active, pause, currentTime, duration } = useTypedSelector(state => state.player)
	const { playTrack, pauseTrack, setActiveTrack, deleteTrack } = useActions();

	const isCurrent = active?._id === track._id;

	const play = (e: React.MouseEvent) => {
		e.stopPropagation()
		if (isCurrent) {
			pause ? playTrack() : pauseTrack()
		} else {
			setActiveTrack(track);
			playTrack()
		}
	}

	const remove = async (e: React.MouseEvent) => {
		e.stopPropagation();
		deleteTrack(track._id)
	}

	return (
		<Card
			className="m-[10px] p-[10px]"
			onClick={() => router.push('/tracks/' + track._id)}
		>
			<Grid
				container
				wrap="nowrap"
				spacing={2}
				sx={{ alignItems: 'center' }}
			>
				{/* Play / Pause */}
				<Grid
					sx={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						flexShrink: 0
					}}
				>
					<IconButton onClick={play}>
						{isCurrent && !pause ? <Pause /> : <PlayArrow />}
					</IconButton>
				</Grid>

				{/* Обложка */}
				<Grid sx={{ flexShrink: 0 }}>
					{track.picture ? (
						<img
							src={serverAsset(track.picture)}
							alt={track.name}
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
							bgcolor: 'action.hover',
							borderRadius: 1
						}}>
							<MusicNote />
						</Box>
					)}
				</Grid>

				{/* Название и исполнитель */}
				<Grid sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
					<div className="break-words whitespace-normal">
						{track.name}
					</div>

					<div className="text-xs text-gray-500">
						{track.artist}
					</div>
				</Grid>

				{/* Время */}
				{isCurrent && (
					<Grid sx={{ flexShrink: 0 }}>
						<div className="text-xs text-gray-500">
							{formatTime(currentTime)} / {formatTime(duration)}
						</div>
					</Grid>
				)}

				{/* Удаление */}
				<Grid sx={{ flexShrink: 0 }}>
					<IconButton onClick={remove}>
						<Delete />
					</IconButton>
				</Grid>
			</Grid>
		</Card>
	);
};

export default TrackItem;
