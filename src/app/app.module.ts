import { Module } from '@nestjs/common';
import { Name, UtilsModule } from '@/utils';
import { DevModule } from '@/dev';

@Module({
	imports: [UtilsModule, DevModule],
})
@Name('AppModule')
export class AppModule {}
