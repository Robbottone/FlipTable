import { ReservationStatus } from '@prisma/client';

export class ReservationStateMachine {
    
    static readonly allowedTransitions: Readonly<Record<ReservationStatus, readonly ReservationStatus[]>> = {
        CREATED: [ReservationStatus.DELAYED, ReservationStatus.CANCELED, ReservationStatus.CONFIRMED, ReservationStatus.NO_SHOW] as const,
        CONFIRMED: [ReservationStatus.CANCELED] as const,
        DELAYED: [ReservationStatus.COMPLETED, ReservationStatus.NO_SHOW, ReservationStatus.CANCELED] as const,
        COMPLETED: [ReservationStatus.CANCELED] as const,
        NO_SHOW: [ReservationStatus.CANCELED] as const,
        CANCELED: [] as const,
    };

    // Metodo per verificare se una transizione e' valida
    private static isTransitionValid(currentStatus: ReservationStatus, newStatus: ReservationStatus): boolean {
       // Controllo se dallo stato corrente e' possibile passare al nuovo stato
        const allowedStatuses = this.allowedTransitions[currentStatus];
        
        if (!allowedStatuses) {
            throw new Error(`Invalid current status: ${currentStatus}. `);
        }

        return allowedStatuses.includes(newStatus);
    }

    private static canTransition(currentStatus: ReservationStatus, newStatus: ReservationStatus): boolean {
            return this.isTransitionValid(currentStatus, newStatus);
    }

    public static transition(current: ReservationStatus, next: ReservationStatus): ReservationStatus {
        //verifio se la transizione e' valida
        if (!this.canTransition(current, next)) {
            throw new Error(`Invalid transition: ${current} → ${next}`);
        }

        return next;
    }
}
