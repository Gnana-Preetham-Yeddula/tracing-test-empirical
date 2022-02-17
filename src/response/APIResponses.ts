import { BaseResponse, ResponseStatus } from "./BaseResponse";

export class CreatedResponse extends BaseResponse {
    createId!: string;

    constructor(status: ResponseStatus, createdId: string) {
        super(status);
        this.createId = createdId;
    }
}

