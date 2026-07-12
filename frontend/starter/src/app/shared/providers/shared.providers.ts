import { Provider } from '@angular/core';
import { StatusEnumService } from '../services/status-enum.service';
import { ExistingValidator } from '../validators/existing.validator';

export function provideShared(): Provider[] {
    return [
        StatusEnumService,
        ExistingValidator,
    ];
}
