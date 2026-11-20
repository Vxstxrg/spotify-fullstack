import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Album, AlbumDocument } from './album.schema';
import { Track, TrackDocument } from '../track/schemas/track.schema';
import { CreateAlbumDto } from './dto.ts/create-album.dto';
import { FileService, FileType } from '../file/file.service';
import { RequestUser, assertCanModify } from '../track/track.service';

@Injectable()
export class AlbumService {
	constructor(@InjectModel(Album.name) private readonly albumModel: Model<AlbumDocument>,
		@InjectModel(Track.name) private readonly trackModel: Model<TrackDocument>,
		private readonly fileService: FileService
	) { }

	async create(dto: CreateAlbumDto, picture: Express.Multer.File, userId?: string): Promise<Album> {
		const picturePath = picture ? this.fileService.createFile(FileType.IMAGE, picture) : '';
		return this.albumModel.create({ ...dto, user: userId, picture: picturePath });
	}

	async getAll(count?: string, offset?: string): Promise<Album[]> {
		const limit = Number(count) || 10;
		const skip = Number(offset) || 0;
		return this.albumModel.find().skip(skip).limit(limit);
	}

	async getOne(id: ObjectId): Promise<Album & { tracks: Track[] }> {
		const album = await this.albumModel.findById(id);
		if (!album) {
			throw new NotFoundException(`Альбом с id ${id} не найден`);
		}
		// треки альбома ищем по ссылке track.album
		const tracks = await this.trackModel.find({ album: id.toString() });
		return { ...album.toObject(), tracks };
	}

	// состав альбома может менять его автор или администратор
	async addTrack(id: ObjectId, trackId: ObjectId, requestUser: RequestUser) {
		const album = await this.requireOwnAlbum(id, requestUser, 'изменение альбома');
		const track = await this.trackModel.findById(trackId);
		if (!track) {
			throw new NotFoundException(`Трек с id ${trackId} не найден`);
		}
		track.album = album._id.toString();
		await track.save();
		return this.getOne(id);
	}

	async removeTrack(id: ObjectId, trackId: ObjectId, requestUser: RequestUser) {
		await this.requireOwnAlbum(id, requestUser, 'изменение альбома');
		const track = await this.trackModel.findById(trackId);
		if (!track) {
			throw new NotFoundException(`Трек с id ${trackId} не найден`);
		}
		track.album = null;
		await track.save();
		return this.getOne(id);
	}

	private async requireOwnAlbum(id: ObjectId, requestUser: RequestUser, action: string) {
		const album = await this.albumModel.findById(id);
		if (!album) {
			throw new NotFoundException(`Альбом с id ${id} не найден`);
		}
		assertCanModify(album.user, requestUser, action);
		return album;
	}

	async delete(id: ObjectId, requestUser: RequestUser): Promise<string> {
		const album = await this.albumModel.findById(id);
		if (!album) {
			throw new NotFoundException(`Альбом с id ${id} не найден`);
		}
		assertCanModify(album.user, requestUser, 'удаление альбома');

		// отвязываем треки от удаляемого альбома, сами треки не трогаем
		await this.trackModel.updateMany({ album: id.toString() }, { $set: { album: null } });
		if (album.picture) this.fileService.removeFile(album.picture);

		await this.albumModel.findByIdAndDelete(id);
		return album.id;
	}
}
