export class Supplier {
    constructor(
        public readonly id: string,
        public name: string,
        public contactName?: string,
        public phone?: string,
        public email?: string,
        public notes?: string,
        public deletedAt?: Date,
    ) { }
}