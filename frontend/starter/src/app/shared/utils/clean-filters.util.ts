import { FilterMetadata } from 'primeng/api';

export function cleanFilters(
    filterData: Record<string, FilterMetadata | FilterMetadata[]>
) {
    return Object.fromEntries(
        Object.entries(filterData)
            .filter(([key]) => key !== 'global')
            .map(([key, conditions]) => {
                if (Array.isArray(conditions)) {
                    const valid = conditions.filter((c) => {
                        if (c.value === null) return false;
                        if (typeof c.value === 'string' && c.value.trim() === '') return false;
                        if (Array.isArray(c.value) && c.value.length === 0) return false;
                        return true;
                    });
                    return [key, valid];
                } else {
                    const c = conditions;
                    const isValid =
                        c.value !== null &&
                        !(typeof c.value === 'string' && c.value.trim() === '') &&
                        !(Array.isArray(c.value) && c.value.length === 0);
                    return isValid ? [key, [c]] : [key, []];
                }
            })
            .filter(([_, conditions]) => (conditions as FilterMetadata[]).length > 0)
    );
}
