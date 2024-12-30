import { Controller, Post, Get } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
    constructor(private authService: AuthService) {}

    @Get("signup")
    signup() {
        return this.authService.signup();
    }

    @Get("signin")
    signin() {
        return this.authService.signin();
    }
}