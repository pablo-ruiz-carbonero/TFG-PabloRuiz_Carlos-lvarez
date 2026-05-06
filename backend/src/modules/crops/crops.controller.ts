import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CropsService } from './crops.service';
import { CreateCropDto, UpdateCropDto } from './dto/create-crop.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('crops')
@UseGuards(AuthGuard('jwt'))
export class CropsController {
  constructor(private readonly cropsService: CropsService) {}

  @Post()
  create(@Body() createCropDto: CreateCropDto, @Request() req: any) {
    return this.cropsService.create(createCropDto, req.user.id);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.cropsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.cropsService.findOne(+id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCropDto: UpdateCropDto, @Request() req: any) {
    return this.cropsService.update(+id, updateCropDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.cropsService.remove(+id, req.user.id);
  }

  @Get('parcels/list')
  getParcels(@Request() req: any) {
    return this.cropsService.getParcels(req.user.id);
  }
}