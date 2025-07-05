interface IResponseBase {
    successfull: boolean;
    data: any;
    error: {
        code: number,
        message: string,
        details: string
    }
}

export class ResponseBase<T> implements IResponseBase {
    
    readonly successfull: boolean;
    readonly data: T;
    readonly error: { code: number; message: string; details: string; };

    constructor (succ: boolean, data: T, cd: number, msg: string, dtls: string) {
        this.successfull = succ;
        this.data = data
        this.error = {
            code: cd,
            message: msg,
            details: dtls
        }
    }

}