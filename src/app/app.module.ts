import { Module } from '@nestjs/common';
import { Name, UtilsModule } from '@/utils';
import { DevHostModule } from '@/dev';
import { GreeterModule } from '@/controllers/greeter';

@Module({
	imports: [UtilsModule, DevHostModule, GreeterModule],
})
@Name('AppModule')
export class AppModule {}
