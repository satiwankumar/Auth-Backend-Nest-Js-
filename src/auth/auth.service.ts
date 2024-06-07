import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { SignUpDTO } from 'src/auth/dto/signupDto';
import { loginDTO } from 'src/auth/dto/loginDto';
import { v4 as uuidv4 } from 'uuid';
import { RefreshToken } from './schemas/refreshtoken.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshToken>,

    private jwtService: JwtService,
  ) {}

  async signUp(
    signUpDto: SignUpDTO,
  ): Promise<{ accessToken: string; refreshtoken: any; user: any }> {
    const { name, email, password } = signUpDto;
    const IsEmailExists = await this.userModel.findOne({ email });
    if (IsEmailExists) {
      throw new BadRequestException('Email Already Exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userModel.create({
      name,
      email,
      password: hashedPassword,
    });
    // const token = this.jwtService.sign({ id: user._id });
    const token = await this.generateUserToken(user._id);

    return { ...token, user: { name, email } };
  }

  async login(
    loginDTO: loginDTO,
  ): Promise<{ accessToken: string; refreshtoken: any; user: any }> {
    const { email, password } = loginDTO;
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = await this.generateUserToken(user._id);

    return { ...token, user: { name: user.name, email: user.email } };
  }
  async generateUserToken(userId) {
    const accessToken = this.jwtService.sign(
      { id: userId },
      { expiresIn: '1h' },
    );
    const refreshtoken = uuidv4();
    await this.storeRefreshToken(refreshtoken, userId);
    return {
      accessToken,
      refreshtoken,
    };
  }

  async storeRefreshToken(token, userId) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);
    await this.refreshTokenModel.create({
      token,
      userId,
      expiryDate,
    });
  }
  async RefreshToken(refreshToken) {
    let token = await this.refreshTokenModel.findOneAndDelete({
      token: refreshToken,
      expiryDate: { $gte: new Date() },
    });
    if (!token) {
      throw new UnauthorizedException();
    }
    return this.generateUserToken(token.userId);
  }
}
