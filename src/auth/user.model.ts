export interface UpdateUserRequest {
    _id: string;
    name: string;
    dateOfBirth: string;
    address: string;
    idNumber: string;
    phoneNumber: string;
}

export interface RegisterInfo extends UpdateUserRequest {
    password: string;
}

export interface User extends RegisterInfo {
    role: string;
    authorization: string[];
}