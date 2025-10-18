
// src/qc/dto/update-qc-test.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateQcTestDto } from './create-qc-test.dto';

export class UpdateQcTestDto extends PartialType(CreateQcTestDto) {}

