import { BadRequestException } from '@nestjs/common';
import { FileService, FileType } from './file.service';

describe('FileService', () => {
	const service = new FileService();

	const makeFile = (originalname: string, size = 16): Express.Multer.File =>
		({ originalname, size, buffer: Buffer.alloc(size) }) as Express.Multer.File;

	it('отклоняет файл с недопустимым расширением', () => {
		expect(() => service.createFile(FileType.IMAGE, makeFile('virus.exe')))
			.toThrow(BadRequestException);
	});

	it('отклоняет аудиофайл с расширением картинки', () => {
		expect(() => service.createFile(FileType.AUDIO, makeFile('song.png')))
			.toThrow(BadRequestException);
	});

	it('отклоняет файл больше 30 МБ', () => {
		expect(() => service.createFile(FileType.AUDIO, makeFile('big.mp3', 31 * 1024 * 1024)))
			.toThrow(BadRequestException);
	});

	it('не падает при удалении несуществующего файла', () => {
		expect(() => service.removeFile('audio/no-such-file.mp3')).not.toThrow();
	});
});
