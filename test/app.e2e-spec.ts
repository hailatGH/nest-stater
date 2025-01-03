import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthDto } from '../src/auth/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333/');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'test@gmail.com',
      password: '123',
    };

    describe('Signup', () => {
      it('Should throw exception if email is empty', () => {
        return pactum
          .spec()
          .post('auth/signup/')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('Should throw exception if password is empty', () => {
        return pactum
          .spec()
          .post('auth/signup/')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('Should throw exception if body is empty', () => {
        return pactum.spec().post('auth/signup/').expectStatus(400);
      });

      it('Should signup', () => {
        return pactum
          .spec()
          .post('auth/signup/')
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('Signin', () => {
      it('Should throw exception if email is empty', () => {
        return pactum
          .spec()
          .post('auth/signin/')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('Should throw exception if password is empty', () => {
        return pactum
          .spec()
          .post('auth/signin/')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('Should throw exception if body is empty', () => {
        return pactum.spec().post('auth/signin/').expectStatus(400);
      });

      it('Should signin', () => {
        return pactum
          .spec()
          .post('auth/signin/')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('Should throw exception if auth header is empty', () => {
        return pactum.spec().get('users/me/').expectStatus(401);
      });

      it('Should get current user', () => {
        return pactum
          .spec()
          .get('users/me/')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });
    });

    describe('Edit user', () => {});
  });

  describe('Bookmarks', () => {
    describe('Create bookmarks', () => {});
    describe('Get bookmarks', () => {});
    describe('Get bookmark by id', () => {});
    describe('Edit bookmark by id', () => {});
    describe('Delete bookmark by id', () => {});
  });
});
