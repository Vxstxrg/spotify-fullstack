"use client"
import { Pause, PlayArrow, VolumeDown, VolumeUp } from '@mui/icons-material';
import { Grid, IconButton } from '@mui/material';
import React, { useEffect, useRef } from 'react'
import TrackProgress from './TrackProgress';
import { useTypedSelector } from '@/hooks/useTypedSelector';
import { useActions } from '@/hooks/useActions';
import { serverAsset } from '@/const/api';

const Player = () => {
	const { pause, volume, active, duration, currentTime } = useTypedSelector(state => state.player)
	const { pauseTrack, playTrack, setVolume, setCurrentTime, setDuration } = useActions()
	const audioRef = useRef<HTMLAudioElement | null>(null);

	// Создание элемента один раз; cleanup срабатывает только при размонтировании
	// (deps []), поэтому смена active звук не останавливает
	useEffect(() => {
		const audio = new Audio();
		audioRef.current = audio;
		return () => {
			audio.pause();
			audio.onloadedmetadata = audio.ontimeupdate = audio.onended = null;
			audio.removeAttribute('src');
			audio.load();
			audioRef.current = null;
		};
	}, []);

	// Источник и обработчики — при смене активного трека
	useEffect(() => {
		const audio = audioRef.current;
		if (!audio || !active) return;
		// у трека может не быть аудиофайла — плееру нечего проигрывать
		if (!active.audio) return;

		audio.src = serverAsset(active.audio);
		audio.volume = volume / 100;
		audio.onloadedmetadata = () => {
			setDuration(Math.ceil(audio.duration))
		}
		audio.ontimeupdate = () => {
			setCurrentTime(Math.ceil(audio.currentTime))
		}
		audio.onended = () => {
			pauseTrack();
		}

		if (!pause) {
			audio.play().catch(err => {
				// Ловим и глушим AbortError, чтобы приложение не падало в консоли
				if (err.name !== 'AbortError') {
					console.error("Ошибка воспроизведения:", err);
				}
			});
		}
	}, [active])

	// Синхронизация паузы/воспроизведения с элементом audio
	useEffect(() => {
		const audio = audioRef.current;
		if (!audio || !audio.src) return;

		if (pause) {
			audio.pause();
		} else {
			audio.play().catch(err => {
				if (err.name !== 'AbortError') {
					console.error("Ошибка воспроизведения:", err);
				}
			});
		}
	}, [pause]);

	const play = () => {
		if (pause) {
			playTrack()
		} else {
			pauseTrack()
		}
	}

	const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
		const volume = Number(e.target.value)
		if (audioRef.current) audioRef.current.volume = volume / 100;
		setVolume(volume)
	}

	const changeCurrentTime = (e: React.ChangeEvent<HTMLInputElement>) => {
		const currentTime = Number(e.target.value)
		if (audioRef.current) audioRef.current.currentTime = currentTime;
		setCurrentTime(currentTime)
	}

	// Пока трек не выбран, панель плеера не показываем
	if (!active) {
		return null
	}

	return (
		<div className='h-[50px] w-full fixed bottom-0 left-0 flex items-center px-2.5 bg-[lightgray]'>
			<IconButton onClick={play}>
				{pause ? <PlayArrow /> : <Pause />}
			</IconButton>
			<Grid sx={{ minWidth: 0, overflow: 'hidden', margin: "0 20px", width: 200 }}>
				<div className="break-words whitespace-normal">
					{active.name}
				</div>

				<div className="text-xs text-gray-500">
					{active.artist}
				</div>
			</Grid>
			<TrackProgress left={currentTime} right={duration} onChange={changeCurrentTime} />
			<VolumeUp className='ml-auto mr-2' />
			<TrackProgress left={volume} right={100} onChange={changeVolume} />
		</div>
	);
}
export default Player;
