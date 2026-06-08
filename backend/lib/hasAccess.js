import sql from "../db/db.js";

export async function hasWriteAccess(userId, splitId) {
    const access = await sql`
            select exists (
                select split_id 
                from splits
                where split_id = ${splitId} and created_by = ${userId}
            ) as has_access
        `;

    return access[0].has_access;
}

export async function hasReadAccess(userId, splitId) {
    const access = await sql`
        select exists (
            select split_id 
            from splits
            where split_id = ${splitId} and created_by = ${userId}
        ) or exists (
            select split_id
            from user_splits
            where split_id = ${splitId} and user_id = ${userId}
        ) as has_access
    `;

    return access[0].has_access;
}