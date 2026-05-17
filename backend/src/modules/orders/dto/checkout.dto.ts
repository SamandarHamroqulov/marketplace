import { IsIn, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAddressDto } from '../../address/dto/create-address.dto';

export class CheckoutDto {
  @IsOptional()
  @IsUUID()
  addressId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  newAddress?: CreateAddressDto;

  @IsOptional()
  @IsIn(['free', 'express', 'schedule'])
  shippingMethod?: string;

  @IsOptional()
  @IsString()
  promoCode?: string;
}
