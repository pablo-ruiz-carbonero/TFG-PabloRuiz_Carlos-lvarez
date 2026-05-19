import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { User } from "../../database/entities/user.entity";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existe = await this.userRepository.findOneBy({ email: dto.email });
    if (existe) throw new ConflictException("El email ya está registrado");

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = this.userRepository.create({
      nombre: dto.nombre,
      email: dto.email,
      telefono: dto.telefono,
      password: hashed,
      role: { id: 1 }, // rol_id 1 = agricultor por defecto
    });

    await this.userRepository.save(user);

    const accessToken = this.generarToken(user);

    // FIX: se devuelve "accessToken" (antes era "token") para que
    //    ambos frontends (web y mobile) puedan leerlo con el mismo campo.
    return {
      accessToken,
      user: this.serializarUser(user),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
      relations: ["role"],
    });

    if (!user) throw new UnauthorizedException("Credenciales incorrectas");

    const valido = await bcrypt.compare(dto.password, user.password);
    if (!valido) throw new UnauthorizedException("Credenciales incorrectas");

    const accessToken = this.generarToken(user);

    // FIX: mismo campo "accessToken" que en register
    return {
      accessToken,
      user: this.serializarUser(user),
    };
  }

  async getMe(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["role"],
    });

    if (!user) throw new UnauthorizedException("Usuario no encontrado");

    return this.serializarUser(user);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private generarToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      rol: user.role?.nombre ?? null,
    };
    return this.jwtService.sign(payload);
  }

  /** Serializa el usuario a un objeto plano y consistente para ambos frontends */
  private serializarUser(user: User) {
    return {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      telefono: user.telefono ?? null,
      rol: user.role?.nombre ?? null,
    };
  }
}
