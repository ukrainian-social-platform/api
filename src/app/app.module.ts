import { Module } from '@nestjs/common';
import { Name, UtilsModule } from '@/utils';
import { DevModule } from '@/dev';
import { GreeterModule } from '@/greeter';

@Module({
	imports: [UtilsModule, DevModule, GreeterModule],
})
@Name('AppModule')
export class AppModule {}
