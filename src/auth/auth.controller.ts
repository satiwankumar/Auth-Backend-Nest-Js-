import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDTO } from 'src/auth/dto/signupDto';
import { loginDTO } from 'src/auth/dto/loginDto';
import { RefreshTokenDTO } from './dto/rereshTokenDto';

@Controller('/api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  signUp(
    @Body() signupDto: SignUpDTO,
  ): Promise<{ accessToken: string; refreshtoken: any }> {
    return this.authService.signUp(signupDto);
  }
  @Post('/login')
  login(
    @Body() loginDTO: loginDTO,
  ): Promise<{ accessToken: string; refreshtoken: any }> {
    try {
      return this.authService.login(loginDTO);
    } catch (error) {}
  }

  @Post('/refresh')
  refreshToken(
    @Body() refreshTokenDto: RefreshTokenDTO,
  ): Promise<{ accessToken: string; refreshtoken: any }> {
    return this.authService.RefreshToken(refreshTokenDto.refreshToken);
  }
}
