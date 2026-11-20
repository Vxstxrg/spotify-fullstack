import { Controller, Get, Post, Body, Param, Delete, UseInterceptors, UploadedFiles, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { TrackService } from './track.service';
import { CreateTrackDto } from './dto.ts/create-track.dto';
import * as mongoose from 'mongoose';
import { CreateCommentDto } from './dto.ts/create-comment.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Auth } from '../auth/decorators/auth.decorator';

@Controller('/tracks')
export class TrackController {
	constructor(private readonly trackService: TrackService) { }

	@Post('/comment')
	@Auth()
	addComment(@Body() dto: CreateCommentDto, @Req() req: Request) {
		return this.trackService.addComment(dto, req.user!.username);
	}

	@Post('/listen/:id')
	listen(@Param('id') id: mongoose.ObjectId) {
		return this.trackService.listen(id);
	}

	@Post()
	@Auth()
	@UseInterceptors(FileFieldsInterceptor([
		{ name: 'picture', maxCount: 1 },
		{ name: 'audio', maxCount: 1 }
	]))
	create(@UploadedFiles() files: {
		picture?: Express.Multer.File[], audio?: Express.Multer.File[]
	}, @Body() dto: CreateTrackDto, @Req() req: Request) {
		const pictureFile = files?.picture?.[0];
		const audioFile = files?.audio?.[0];
		return this.trackService.create(dto, pictureFile, audioFile, req.user!.userId);
	}


	@Get()
	getAll(@Query('count') count: string,
		@Query('offset') offset: string) {
		return this.trackService.getAll(count, offset);
	}

	@Get('/search')
	search(@Query('query') query: string) {
		return this.trackService.search(query);
	}


	@Get(':id')
	getOne(@Param('id') id: mongoose.ObjectId) {
		return this.trackService.getOne(id);
	}

	@Delete(':id')
	@Auth()
	delete(@Param('id') id: mongoose.ObjectId, @Req() req: Request) {
		return this.trackService.delete(id, req.user!);
	}


}
