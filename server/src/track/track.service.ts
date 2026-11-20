import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Track, TrackDocument } from './schemas/track.schema';
import { Model, ObjectId } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.shema';
import { Album, AlbumDocument } from '../album/album.schema';
import { CreateTrackDto } from './dto.ts/create-track.dto';
import { CreateCommentDto } from './dto.ts/create-comment.dto';
import { FileService, FileType } from '../file/file.service';

export interface RequestUser {
	userId: string;
	role: 'user' | 'admin';
}


@Injectable()
export class TrackService {

	constructor(@InjectModel(Track.name) private readonly trackModel: Model<TrackDocument>,
		@InjectModel(Comment.name) private readonly commentModel: Model<CommentDocument>,
		@InjectModel(Album.name) private readonly albumModel: Model<AlbumDocument>,
		private readonly fileService: FileService
	) { }

	async create(dto: CreateTrackDto, picture?: Express.Multer.File, audio?: Express.Multer.File, userId?: string): Promise<Track> {
		const audioPath = audio ? this.fileService.createFile(FileType.AUDIO, audio) : '';
		const picturePath = picture ? this.fileService.createFile(FileType.IMAGE, picture) : '';

		if (dto.albumId) {
			const album = await this.albumModel.findById(dto.albumId);
			if (!album) {
				throw new NotFoundException(`Альбом с id ${dto.albumId} не найден`);
			}
		}

		const { albumId, ...trackData } = dto;
		return this.trackModel.create({
			...trackData,
			album: albumId,
			user: userId,
			listens: 0,
			audio: audioPath,
			picture: picturePath
		});
	}


	async getAll(count?: string, offset?: string): Promise<Track[]> {
		// параметры запроса приходят строками — приводим к числам
		const limit = Number(count) || 10;
		const skip = Number(offset) || 0;
		return this.trackModel.find().skip(skip).limit(limit);
	}

	async search(query: string): Promise<Track[]> {
		// экранируем спецсимволы, чтобы запрос пользователя не сломал RegExp
		const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		return this.trackModel.find({
			$or: [
				{ name: { $regex: new RegExp(escaped, 'i') } },
				{ artist: { $regex: new RegExp(escaped, 'i') } },
			]
		});
	}

	async getOne(id: ObjectId): Promise<Track> {
		const track = await this.trackModel.findById(id).populate('comments');
		if (!track) {
			throw new NotFoundException(`Трек с id ${id} не найден`);
		}
		return track;
	}

	async delete(id: ObjectId, requestUser: RequestUser): Promise<string> {
		const track = await this.trackModel.findById(id);
		if (!track) {
			throw new NotFoundException(`Трек с id ${id} не найден`);
		}
		assertCanDelete(track.user, requestUser, 'трека');

		// убираем за треком загруженные файлы
		if (track.picture) this.fileService.removeFile(track.picture);
		if (track.audio) this.fileService.removeFile(track.audio);

		await this.trackModel.findByIdAndDelete(id);
		return track.id;
	}

	async addComment(dto: CreateCommentDto, username: string): Promise<Comment> {
		const track = await this.trackModel.findById(dto.trackId);
		if (!track) {
			throw new NotFoundException(`Трек с id ${dto.trackId} не найден`);
		}
		// имя автора комментария берём из аккаунта, а не из запроса
		const comment = await this.commentModel.create({ username, text: dto.text });
		track.comments.push(comment._id as any)
		await track.save();
		return comment;
	}

	async listen(id: ObjectId): Promise<Track> {
		const track = await this.trackModel.findById(id);
		if (!track) {
			throw new NotFoundException(`Трек с id ${id} не найден`);
		}
		track.listens++;
		await track.save();
		return track;
	}
}

// удалять контент может его автор или администратор
export function assertCanDelete(ownerId: unknown, requestUser: RequestUser, what: string) {
	if (requestUser.role === 'admin') return;
	const isOwner = ownerId && ownerId.toString() === requestUser.userId;
	if (!isOwner) {
		throw new ForbiddenException(`У вас нет прав на удаление этого ${what}`);
	}
}
