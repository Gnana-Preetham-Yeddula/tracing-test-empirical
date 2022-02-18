import { NextFunction, Request, Response, Router } from "express";
import { DI } from "../di/DIContainer";
import { FirstService } from "../service/FirstService";
import { BaseController } from "./BaseController";

export class FirstController implements BaseController {
	private firstService: FirstService;
	constructor() {
		this.firstService = DI.get<FirstService>(FirstService);
	}

	getRouter(): Router {
		const router = Router();

		router.get(
			"/app/:app_code/:end_code",
			async (req: Request, res: Response, next: NextFunction) => {
				let start = req.params["app_code"];
				let end = req.params["end_code"];
				console.log("inside get");
				let resp = await this.firstService.firstFunction(
					parseInt(start),
					parseInt(end),
					{}
				);
				res.json({ Status: "Success", Returned: resp });
			}
		);

		return router;
	}
}
