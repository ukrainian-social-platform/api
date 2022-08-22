import { NestMicroservice } from '@nestjs/microservices/nest-microservice';
import { InstanceLoader } from '@nestjs/core/injector/instance-loader';
import { ConfigHostModule } from '@nestjs/config/dist/config-host.module';
import { ConfigModule } from '@nestjs/config';
import { Name } from './name.decorator';

Name('NestMicroservice')(NestMicroservice);
Name('InstanceLoader')(InstanceLoader);
Name('ConfigHostModule')(ConfigHostModule);
Name('ConfigModule')(ConfigModule);
