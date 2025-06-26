import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async signup(dto: AuthDto) {
    // generate password hash
    const hash = await argon.hash(dto.password);
    // save the new user in the db
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
        select: {
          id: true,
          email: true,
        },
      });

      // return saved user
      return user;
    } catch (err) {
      if (
        err instanceof
        PrismaClientKnownRequestError
      ) {
        if (err.code == 'P2002') {
          throw new ForbiddenException(
            'Email be used!',
          );
        }
      }
      throw err;
    }
  }

  async login(dto: AuthDto) {
    // find the user by email
    const user =
      await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });
    // if user does not exist throw exception
    if (!user)
      throw new ForbiddenException(
        'email not found',
      );

    // compare password
    const isMatchPw = await argon.verify(
      user.hash,
      dto.password,
    );
    // if password incorrect throw exception
    if (!isMatchPw)
      throw new ForbiddenException(
        'password incorrect',
      );
    const { hash, ...res } = user;
    // send back the user
    return res;
  }
}
