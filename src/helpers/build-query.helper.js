export const buildQueryHelper = (query) => {
    return Object.fromEntries(
        Object.entries(query).filter(([_, value]) =>
            value !== '' &&
            value !== null &&
            value !== undefined
        )
    )
}
