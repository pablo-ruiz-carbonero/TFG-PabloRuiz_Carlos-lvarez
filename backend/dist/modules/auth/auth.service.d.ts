import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { User } from "../../database/entities/user.entity";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
export declare class AuthService {
    private readonly userRepository;
    private readonly jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        user: {
            id: number;
            nombre: string;
            email: string;
            telefono: string;
            rol: any;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: number;
            nombre: string;
            email: string;
            telefono: string;
            rol: any;
        };
    }>;
    getMe(userId: number): Promise<{
        id: number;
        nombre: string;
        email: string;
        telefono: string;
        rol: any;
    }>;
    private generarToken;
    private serializarUser;
}
