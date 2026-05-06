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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelsController = void 0;
const common_1 = require("@nestjs/common");
const parcels_service_1 = require("./parcels.service");
const create_parcel_dto_1 = require("./dto/create-parcel.dto");
const update_parcel_dto_1 = require("./dto/update-parcel.dto");
let ParcelsController = class ParcelsController {
    constructor(parcelsService) {
        this.parcelsService = parcelsService;
    }
    findAll(usuarioId) {
        return this.parcelsService.findAll(usuarioId ? Number(usuarioId) : undefined);
    }
    findOne(id) {
        return this.parcelsService.findOne(Number(id));
    }
    create(dto) {
        return this.parcelsService.create(dto);
    }
    update(id, dto) {
        return this.parcelsService.update(Number(id), dto);
    }
    remove(id) {
        return this.parcelsService.remove(Number(id));
    }
};
exports.ParcelsController = ParcelsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('usuarioId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ParcelsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ParcelsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof create_parcel_dto_1.CreateParcelDto !== "undefined" && create_parcel_dto_1.CreateParcelDto) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], ParcelsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_c = typeof update_parcel_dto_1.UpdateParcelDto !== "undefined" && update_parcel_dto_1.UpdateParcelDto) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], ParcelsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ParcelsController.prototype, "remove", null);
exports.ParcelsController = ParcelsController = __decorate([
    (0, common_1.Controller)('parcels'),
    __metadata("design:paramtypes", [typeof (_a = typeof parcels_service_1.ParcelsService !== "undefined" && parcels_service_1.ParcelsService) === "function" ? _a : Object])
], ParcelsController);
//# sourceMappingURL=parcels.controller.js.map