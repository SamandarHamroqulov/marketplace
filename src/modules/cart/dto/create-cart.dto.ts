import { IsNumber, IsUUID, Min } from 'class-validator';

export class CreateCartDto {
    @IsUUID()
    productId: string;

    @IsNumber()
    @Min(1)
    quantity: number;
}
