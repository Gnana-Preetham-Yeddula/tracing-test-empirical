import { NextFunction, Request, Response, Router } from "express";
import { DI } from "../di/DIContainer";
import { FirstService } from "../service/FirstService";
import { BaseController } from "./BaseController";


const opentracing = require('opentracing')
const tracer = opentracing.globalTracer()


export class FirstController implements BaseController {
	private firstService: FirstService;
	constructor() {
		this.firstService = DI.get<FirstService>(FirstService);
	}

	getRouter(): Router {
		const router = Router();

		router.get(
			"/app/:app_code/:end_code",
			async (req: any, res: Response, next: NextFunction) => {

  const span = tracer.startSpan('format-greeting', { childOf: req.span })

				let start = req.params["app_code"];
				let end = req.params["end_code"];
				console.log("inside get");
                span.log({ event: 'format', message: `Payload is  ${start} to ${end}` })

				let resp = await this.firstService.firstFunction(
					parseInt(start),
					parseInt(end),
					{},span
				);

                span.finish()
				res.json({ Status: "Success", Returned: resp });
			}
		);

		return router;
	}
}
