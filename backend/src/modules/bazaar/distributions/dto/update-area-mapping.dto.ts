import { PartialType } from '@nestjs/swagger';
import { CreateAreaMappingDto } from './create-area-mapping.dto';

export class UpdateAreaMappingDto extends PartialType(CreateAreaMappingDto) {}
