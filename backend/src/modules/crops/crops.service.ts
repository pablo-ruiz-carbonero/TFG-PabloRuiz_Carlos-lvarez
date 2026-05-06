import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Crop } from '../../database/entities/crop.entity';
import { CreateCropDto, UpdateCropDto } from './dto/create-crop.dto';

@Injectable()
export class CropsService {
  constructor(
    @InjectRepository(Crop)
    private readonly cropRepository: Repository<Crop>,
  ) {}

  async findAll(userId: number): Promise<Crop[]> {
    return this.cropRepository.find({
      where: { usuario: { id: userId } },
      relations: ['usuario'],
    });
  }

  async findOne(id: number, userId: number): Promise<Crop> {
    const crop = await this.cropRepository.findOne({
      where: { id, usuario: { id: userId } },
      relations: ['usuario'],
    });

    if (!crop) {
      throw new NotFoundException('Cultivo no encontrado');
    }

    return crop;
  }

  async create(createCropDto: CreateCropDto, userId: number): Promise<Crop> {
    const crop = this.cropRepository.create({
      ...createCropDto,
      usuario: { id: userId } as any,
    });

    return this.cropRepository.save(crop);
  }

  async update(id: number, updateCropDto: UpdateCropDto, userId: number): Promise<Crop> {
    const crop = await this.findOne(id, userId);

    Object.assign(crop, updateCropDto);

    return this.cropRepository.save(crop);
  }

  async remove(id: number, userId: number): Promise<void> {
    const crop = await this.findOne(id, userId);
    await this.cropRepository.remove(crop);
  }

  async getParcels(userId: number) {
    // Por ahora devolver datos mock, después implementar entidad Parcela
    return [
      { id: 1, nombre: 'Parcela A1', ubicacion: 'Zona Norte', tamano: 1.2 },
      { id: 2, nombre: 'Parcela B1', ubicacion: 'Zona Sur', tamano: 0.8 },
      { id: 3, nombre: 'Parcela C1', ubicacion: 'Zona Este', tamano: 1.5 },
    ];
  }
}