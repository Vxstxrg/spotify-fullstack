import { HttpException, HttpStatus, Injectable, BadRequestException } from "@nestjs/common";
import * as path from "path";
import * as fs from "fs";
import * as uuid from "uuid";

export enum FileType {
	AUDIO = 'audio',
	IMAGE = 'image',
}

const ALLOWED_EXTENSIONS: Record<FileType, string[]> = {
	[FileType.AUDIO]: ['.mp3', '.wav', '.ogg', '.m4a', '.flac'],
	[FileType.IMAGE]: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
};

const MAX_FILE_SIZE = 30 * 1024 * 1024;

@Injectable()
export class FileService {
	private readonly staticDir = path.resolve(process.cwd(), 'static');

	createFile(type: FileType, file: Express.Multer.File): string {
		try {
			const fileExtension = path.extname(file.originalname).toLowerCase();

			if (!ALLOWED_EXTENSIONS[type].includes(fileExtension)) {
				throw new BadRequestException(
					`Недопустимый формат файла "${fileExtension}". Разрешены: ${ALLOWED_EXTENSIONS[type].join(', ')}`
				);
			}
			if (file.size > MAX_FILE_SIZE) {
				throw new BadRequestException('Файл слишком большой (максимум 30 МБ)');
			}

			const fileName = uuid.v4() + fileExtension;
			const filePath = path.resolve(this.staticDir, type);

			fs.mkdirSync(filePath, { recursive: true });
			fs.writeFileSync(path.resolve(filePath, fileName), file.buffer);

			return type + '/' + fileName;
		} catch (error) {
			if (error instanceof BadRequestException) {
				throw error;
			}
			throw new HttpException((error as Error).message, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	removeFile(fileName: string) {
		try {
			const filePath = path.resolve(this.staticDir, fileName);
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
			}
		} catch (error) {
			// Не ломаем удаление трека, если файл не удалось убрать с диска
			console.error('Не удалось удалить файл', fileName, error);
		}
	}
}
