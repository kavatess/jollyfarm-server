import { UpdateUserBody } from "./update-user-body.model";

export interface RegisterInfo extends UpdateUserBody {
    password: string;
}