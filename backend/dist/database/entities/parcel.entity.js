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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parcel = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const crop_entity_1 = require("./crop.entity");
let Parcel = class Parcel {
};
exports.Parcel = Parcel;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Parcel.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Parcel.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Parcel.prototype, "ubicacion", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.parcels, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'usuario_id' }),
    __metadata("design:type", user_entity_1.User)
], Parcel.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => crop_entity_1.Crop, (crop) => crop.parcel),
    __metadata("design:type", Array)
], Parcel.prototype, "crops", void 0);
exports.Parcel = Parcel = __decorate([
    (0, typeorm_1.Entity)('parcelas')
], Parcel);
//# sourceMappingURL=parcel.entity.js.map