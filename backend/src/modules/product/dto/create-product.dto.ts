import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, IsUUID, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    price: number;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @IsOptional()
    quantity?: number;

    @IsUUID()
    categoryId: string;

    @IsBoolean()
    @IsOptional()
    inStock?: boolean;

    @IsString()
    @IsOptional()
    brand?: string;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @IsOptional()
    compareAtPrice?: number;

    @IsOptional()
    colors?: string[];

    @IsOptional()
    storageOptions?: string[];

    @IsOptional()
    specs?: Record<string, string>;

    @IsOptional()
    detailSpecs?: Record<string, Record<string, string>>;
}
