import { Controller, Get, Post, Body, Param, Delete, UseInterceptors, UploadedFile, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AlbumService } from './album.service';
import { CreateAlbumDto } from './dto.ts/create-album.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import * as mongoose from 'mongoose';
import { Auth } from '../auth/decorators/auth.decorator';

@Controller('/albums')
export class AlbumController {
	constructor(private readonly albumService: AlbumService) { }

	@Post()
	@Auth()
	@UseInterceptors(FileInterceptor('picture'))
	create(@UploadedFile() picture: Express.Multer.File, @Body() dto: CreateAlbumDto, @Req() req: Request) {
		return this.albumService.create(dto, picture, req.user!.userId);
	}

	@Get()
	getAll(@Query('count') count: string,
		@Query('offset') offset: string) {
		return this.albumService.getAll(count, offset);
	}

	@Get(':id')
	getOne(@Param('id') id: mongoose.ObjectId) {
		return this.albumService.getOne(id);
	}

	@Delete(':id')
	@Auth()
	delete(@Param('id') id: mongoose.ObjectId, @Req() req: Request) {
		return this.albumService.delete(id, req.user!);
	}
}
