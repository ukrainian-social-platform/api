import { Injectable } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

const Method = GrpcMethod('Greeter');

@Injectable()
export class GreeterController {
	@Method
	async sayHello({ name }) {
		return { message: `Hello ${name} from Nest.js!` };
	}
}
