import { BaseService } from "./BaseService";

export class UtilityService implements BaseService {
    
    isJsonString(val: string): boolean {
        try {
            JSON.parse(val);
        } catch (e) {
            return false;
        }
        return true;
    }
}