export interface SplitCardValues {
    split_id: number;
    split_name: string;
    num_expenses: number;
    total_amount: number;
    num_users: number;
}

export interface Expense {
    expense_id: number;
    expense_name: string;
    expense_amount: number | string;
}

export interface SplitUser {
    user_name: string;
}