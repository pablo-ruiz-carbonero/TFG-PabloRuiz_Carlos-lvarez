import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        token: string;
    }>;
    login(dto: LoginDto): Promise<{
        token: string;
        user: {
            id: number;
            nombre: string;
            email: string;
            telefono: string;
            rol: any;
        };
    }>;
    getMe(req: any): Promise<{
        id: number;
        nombre: string;
        email: string;
        telefono: string;
        rol: any;
    }>;
}
