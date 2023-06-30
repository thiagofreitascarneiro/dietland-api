import { knex } from 'knex'

declare module 'knex/types/tables' {
    export interface Tables {
        meal: {
            id: string;
            created_at: string;
            name: string;
            description: string;
            isInDiet: boolean;
            session_id?: string;
            meal_date: string;
            meal_time: string;
            user: string;
            email: string;
        }
    }
}