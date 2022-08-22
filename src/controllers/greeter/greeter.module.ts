import { Name } from '@/utils';
import { Module } from '@nestjs/common';
import { GreeterController } from './greeter.controller';

@Module({
	controllers: [GreeterController],
})
@Name('GreeterModule')
export class GreeterModule {}
