import { Router } from 'express'
import sql from './db/db'
import { z } from 'zod';
import { hasWriteAccess, hasReadAccess } from './lib/hasAccess.js';

const router = Router()

router.get('/created-splits-data', async (req, res) => {

    const userId = req.session.userId;

    const values = await sql`
    select 
        a.split_id,
        b.split_name,
        a.num_expenses,
        a.total_amount,
        b.num_users
    from (
        select
            e.split_id,
            count(*) as num_expenses,
            sum(e.expense_amount) as total_amount
        from expenses e
        join splits s on e.split_id = s.split_id
        where s.created_by = ${userId} 
        group by e.split_id
    ) a join
    (
        select
            u.split_id,
            s.split_name,
            count(*) as num_users
        from user_splits u
        join splits s on u.split_id = s.split_id
        where s.created_by = ${userId}
        group by u.split_id
    ) b on a.split_id = b.split_id
    order by a.split_id desc
    ;
    `;

    res.json({
        success: true,
        data: values
    });
});

router.get('/joined-splits-data', async (req, res) => {

    const userId = req.session.userId;

    const values = await sql`   
        with joined_splits as (
            select
                split_id
            from user_splits 
            where user_id = ${userId}
        ),

        expense_details as (
            select
                e.split_id,
                count(*) as num_expenses,
                sum(e.expense_amount) as total_amount
            from expenses e
            join splits s on e.split_id = s.split_id
            where s.split_id in (select split_id from joined_splits)
            group by e.split_id
        ),

        user_counts as (
            select
                u.split_id,
                s.split_name,
                count(*) as num_users
            from user_splits u
            join splits s on u.split_id = s.split_id
            where s.split_id in (select split_id from joined_splits)
            group by u.split_id
        )

        select
            ed.split_id,
            uc.split_name,
            ed.num_expenses,
            ed.total_amount,
            uc.num_users
        from expense_details ed
        join user_counts uc on ed.split_id = uc.split_id
        order by ed.split_id desc
    `

    res.json({
        success: true,
        data: values
    });
});

router.get('/split/:splitId', async (req, res) => {
    const userId = req.session.userId;
    
    const validation = z.number().int().positive().safeParse(req.params.splitId);

    if (!validation.success) {
        return res.status(400).json({success: false, error: validation.error.errors.map(e => e.message).join(', ') });
    }

    const splitId = validation.data;

    if (!await hasReadAccess(userId, splitId)) {
        return res.status(403).json({ success: false, error: "You do not have access to this split" });
    }

    const expenses = await sql`
        select
            expense_name,
            expense_amount
        from expenses 
        where split_id = ${splitId}
        order by expense_id;
    `

    const users = await sql`
        select
            u.user_name
        from user_splits us
        join users u on us.user_id = u.user_id
        where us.split_id = ${splitId}
    `;

    res.json({
        success: true,
        data: {
            expenses,
            users
        }
    });
});

router.get('/access-level/:splitId', async (req, res) => {
    const userId = req.session.userId;

    const validation = z.number().int().positive().safeParse(req.params.splitId);

    if (!validation.success) {
        return res.status(400).json({success: false, error: validation.error.errors.map(e => e.message).join(', ') });
    }

    const splitId = validation.data;

    const hasWrite = await hasWriteAccess(userId, splitId);

    if(hasWrite){
        return res.json({
            success: true,
            data: {
                hasWrite,
                hasRead: true
            }
        });
    }

    const hasRead = await hasReadAccess(userId, splitId);

    res.json({
        success: true,
        data: {
            hasWrite,
            hasRead
        }
    });
});

router.post('/create-split', async (req, res) => {
    const userId = req.session.userId;

    const validation = z.object({
        split_name: z.string().trim().min(1).max(255)
    }).safeParse(req.body);

    if (!validation.success) {
        return res.status(400).json({success: false, error: validation.error.errors.map(e => e.message).join(', ') });
    }

    const { split_name } = validation.data;

    const values = await sql`
        insert into splits (split_name, created_by) values (${split_name}, ${userId})
        returning split_id, split_name
    `
    res.json({
        success: true,
        data: values[0]
    });

});

router.post('/add-user-to-split', async (req, res) => {
    const userId = req.session.userId;

    const validation = z.object({
        split_id: z.number().int().positive(),
        user_name: z.string().trim().min(5).max(255).regex(/^[a-zA-Z0-9_]+$/)
    }).safeParse(req.body);

    if (!validation.success) {
        return res.status(400).json({success: false, error: validation.error.errors.map(e => e.message).join(', ') });
    }

    const { split_id, user_name } = validation.data;

    if (!await hasWriteAccess(userId, split_id)) {
        return res.status(403).json({ success: false, error: "You do not have access to this split" });
    }

    const user_id_q = await sql`select user_id from users where user_name = ${user_name}`;

    if (user_id_q.length === 0) {
        return res.status(400).json({ success: false, error: "User does not exist" });
    }

    const addingUserId = user_id_q[0].user_id;

    const canAdd = await sql`
        select not exists (select * from user_splits where split_id = ${split_id} and user_id = ${addingUserId})
        as can_add
    `;

    if (!canAdd[0].can_add) {
        return res.status(400).json({ success: false, error: "Invalid split ID or username" });
    }

    await sql`
        insert into user_splits (user_id, split_id)
        values (${addingUserId}, ${split_id})
        on conflict do nothing
    `

    res.json({
        success: true,
        message: "User added to split successfully"
    });

});

router.post('/add-expense', async (req, res) => {
    const userId = req.session.userId;

    const validation = z.object({
        split_id: z.number().int().positive(),
        expense_name: z.string().trim().min(1).max(255),
        expense_amount: z.number().positive()
    }).safeParse(req.body);

    if (!validation.success) {
        return res.status(400).json({success: false, error: validation.error.errors.map(e => e.message).join(', ') });
    }

    const { split_id, expense_name, expense_amount } = validation.data;

    if (!await hasWriteAccess(userId, split_id)) {
        return res.status(403).json({ success: false, error: "You do not have access to this split" });
    }

    await sql`
        insert into expenses (expense_name, expense_amount, split_id)
        values (${expense_name}, ${expense_amount}, ${split_id})
    `

    res.json({
        success: true,
        message: "Expense added successfully"
    });

});

router.update('/remove-user-from-split', async (req, res) => {
    const userId = req.session.userId;

    const validation = z.object({
        split_id: z.number().int().positive(),
        user_name: z.string().trim().min(5).max(255).regex(/^[a-zA-Z0-9_]+$/)
    }).safeParse(req.body);

    if (!validation.success) {
        return res.status(400).json({success: false, error: validation.error.errors.map(e => e.message).join(', ') });
    }

    const { split_id, user_name } = validation.data;

    if (!await hasWriteAccess(userId, split_id)) {
        return res.status(403).json({ success: false, error: "You do not have access to this split" });
    }

    const user_id_q = await sql`select user_id from users where user_name = ${user_name}`;

    if (user_id_q.length === 0) {
        return res.status(400).json({ success: false, error: "User does not exist" });
    }

    const removingUserId = user_id_q[0].user_id;

    await sql`
        delete from user_splits
        where split_id = ${split_id} and user_id = ${removingUserId}
    `

    res.json({
        success: true,
        message: "User removed from split successfully"
    });

});

router.update('/remove-expense', async (req, res) => {
    const userId = req.session.userId;

    const validation = z.object({
        split_id: z.number().int().positive(),
        expense_name: z.string().trim().min(1).max(255)
    }).safeParse(req.body);

    if (!validation.success) {
        return res.status(400).json({success: false, error: validation.error.errors.map(e => e.message).join(', ') });
    }

    const { split_id, expense_name } = validation.data;

    if (!await hasWriteAccess(userId, split_id)) {
        return res.status(403).json({ success: false, error: "You do not have access to this split" });
    }

    await sql`
        delete from expenses
        where split_id = ${split_id} and expense_name = ${expense_name}
    `

    res.json({
        success: true,
        message: "Expense removed successfully"
    });

});

router.update('/leave-split', async (req, res) => {
    const userId = req.session.userId;

    const validation = z.object({
        split_id: z.number().int().positive()
    }).safeParse(req.body);

    if (!validation.success) {
        return res.status(400).json({success: false, error: validation.error.errors.map(e => e.message).join(', ') });
    }

    const { split_id } = validation.data;

    if (!await hasReadAccess(userId, split_id)) {
        return res.status(403).json({ success: false, error: "You do not have access to this split" });
    }

    await sql`
        delete from user_splits
        where split_id = ${split_id} and user_id = ${userId}
    `

    res.json({
        success: true,
        message: "Left split successfully"
    });

});

router.delete('/delete-split', async (req, res) => {
    const userId = req.session.userId;

    const validation = z.object({
        split_id: z.number().int().positive()
    }).safeParse(req.body);

    if (!validation.success) {
        return res.status(400).json({success: false, error: validation.error.errors.map(e => e.message).join(', ') });
    }

    const { split_id } = validation.data;

    if (!await hasWriteAccess(userId, split_id)) {
        return res.status(403).json({ success: false, error: "You do not have access to this split" });
    }

    await sql`
        delete from splits
        where split_id = ${split_id}
    `

    res.json({
        success: true,
        message: "Split deleted successfully"
    });

});

export default router;