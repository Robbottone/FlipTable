import { getError } from '../../config/errorCatalog'

export class AppError extends Error {
    public readonly code: string;
    public readonly messageId: string;
    public readonly status: string | number;

    constructor(type: string, location: string) {
        
        const { code, messageId, status } = getError(type, location);

        super(messageId);

        this.code = code;
        this.messageId = messageId;
        this.status = status;

        Object.setPrototypeOf(this, AppError.prototype);
    }
}