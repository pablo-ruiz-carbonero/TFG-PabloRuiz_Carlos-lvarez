"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CropsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crop_entity_1 = require("../../database/entities/crop.entity");
let CropsService = class CropsService {
    constructor(cropRepository) {
        this.cropRepository = cropRepository;
    }
    async findAll(userId) {
        return this.cropRepository.find({
            where: { usuario: { id: userId } },
            relations: ['usuario'],
        });
    }
    async findOne(id, userId) {
        const crop = await this.cropRepository.findOne({
            where: { id, usuario: { id: userId } },
            relations: ['usuario'],
        });
        if (!crop) {
            throw new common_1.NotFoundException('Cultivo no encontrado');
        }
        return crop;
    }
    async create(createCropDto, userId) {
        const crop = this.cropRepository.create({
            ...createCropDto,
            usuario: { id: userId },
        });
        return this.cropRepository.save(crop);
    }
    async update(id, updateCropDto, userId) {
        const crop = await this.findOne(id, userId);
        Object.assign(crop, updateCropDto);
        return this.cropRepository.save(crop);
    }
    async remove(id, userId) {
        const crop = await this.findOne(id, userId);
        await this.cropRepository.remove(crop);
    }
    async getParcels(userId) {
        return [
            { id: 1, nombre: 'Parcela A1', ubicacion: 'Zona Norte', tamano: 1.2 },
            { id: 2, nombre: 'Parcela B1', ubicacion: 'Zona Sur', tamano: 0.8 },
            { id: 3, nombre: 'Parcela C1', ubicacion: 'Zona Este', tamano: 1.5 },
        ];
    }
};
exports.CropsService = CropsService;
exports.CropsService = CropsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(crop_entity_1.Crop)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CropsService);
//# sourceMappingURL=crops.service.js.map