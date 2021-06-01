import { RegisterInfo } from "./register-info.model";

export interface User extends RegisterInfo {
    role: string;
    authorization: string[];
}