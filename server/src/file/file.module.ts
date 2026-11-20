import { Module } from "@nestjs/common";
import { FileService } from './file.service';

@Module({
	providers: [FileService], // Перенесли сюда
	exports: [FileService]   // Добавили экспорт, чтобы другие модули могли использовать этот сервис
})
export class FileModule { }
