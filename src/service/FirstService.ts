import { delay } from "bluebird";

const opentracing = require('opentracing')
const tracer = opentracing.globalTracer()

export class FirstService {
	async firstFunction(start: number, ending: number, obj: any,span_p:any) {
  const span = tracer.startSpan(`service ${start}-${ending}`, { childOf: span_p })

	//	console.log("Entered Service");
    span.log({ event: 'format', message: `in service  ${start} to ${ending}` })

		for (let i = start; i < ending; i++) {
			if (i % 8 == 0) {
				await this.firstFunction(30, 31, obj,span);
			} else if (i % 3 == 0) {
				await this.create_delay(i, obj,span);
			} else if (i % 5 == 0) {
				await this.update_delay(i, obj,span);
			}
			await this.delay(i);
			if (obj[`${i}`]) {
				obj[`${i}_dup`] = "Done";
			}
			obj[`${i}`] = "Done";
			console.log(`wait ${i}`);
		}
  span.finish()

		return obj;
	}

	delay(ms: number) {
		console.log(`entered with ${ms}`);
		return new Promise((resolve) => setTimeout(resolve, ms * 100));
	}

	async create_delay(ms: number, obj: any,span_p:any) {
        const span = tracer.startSpan(`in create for ${ms}`, { childOf: span_p })
        span.log({ event: 'creating', message: `for ${ms}` })
		console.log(`entered with create ${ms}`);
        if (obj[`create ${ms}`]) {
            obj[`${ms}_dup`] = "Done";
        }
		obj[`create ${ms}`] = "Done";
		await this.delay(ms);
        span.finish()
		return 0;
	}

	async update_delay(ms: number, obj: any,span_p:any) {
        const span = tracer.startSpan(`in update for ${ms}`, { childOf: span_p })
        span.log({ event: 'updating', message: `for ${ms}`})
		// console.log(`entered with update     ${ms}`);
        if (obj[`update ${ms}`]) {
            obj[`${ms}_dup`] = "Done";
        }
		obj[`update ${ms}`] = "Done";
		await this.delay(ms);
        span.finish()

		return 0;
	}
}
