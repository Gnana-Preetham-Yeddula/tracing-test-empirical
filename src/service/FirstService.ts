export class FirstService {
	async firstFunction(start: number, ending: number, obj: any) {
		console.log("Entered Service");
		for (let i = start; i < ending; i++) {
			if (i % 8 == 0) {
				await this.firstFunction(30, 31, obj);
			} else if (i % 3 == 0) {
				await this.create_delay(i, obj);
			} else if (i % 5 == 0) {
				await this.update_delay(i, obj);
			}
			await this.delay(i);
			if (obj[`${i}`]) {
				obj[`${i}_dup`] = "Done";
			}
			obj[`${i}`] = "Done";
			console.log(`wait ${i}`);
		}

		return obj;
	}

	delay(ms: number) {
		console.log(`entered with ${ms}`);
		return new Promise((resolve) => setTimeout(resolve, ms * 100));
	}

	create_delay(ms: number, obj: any) {
		console.log(`entered with create ${ms}`);
        if (obj[`create ${ms}`]) {
            obj[`${ms}_dup`] = "Done";
        }
		obj[`create ${ms}`] = "Done";
		return new Promise((resolve) => setTimeout(resolve, ms * 100));
	}

	update_delay(ms: number, obj: any) {
		console.log(`entered with update     ${ms}`);
        if (obj[`update ${ms}`]) {
            obj[`${ms}_dup`] = "Done";
        }
		obj[`update ${ms}`] = "Done";
		return new Promise((resolve) => setTimeout(resolve, ms * 100));
	}
}
