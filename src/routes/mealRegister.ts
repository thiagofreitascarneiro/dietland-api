import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { checkSessionIdExists } from '../middleware/check-session-id-exist'

export async function transactionsRoutes(app: FastifyInstance) {
    
    app.post('/user', async (request, reply) => {

        const createUser = z.object({
            user: z.string(),
            email: z.string()
        })

        const { user, email } = createUser.parse(request.body)

        const existingUser = await knex('usermeal')
            .where('email', email)
            .first()
        
        if (existingUser) {
            return reply.status(400).send('Email already exists')
        }

        let sessionId = request.cookies.sessionId

        if (!sessionId) {
            sessionId = randomUUID()

            reply.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
            })
        }

        await knex('usermeal').insert({
            id: randomUUID(),
            user,
            email,
            session_id: sessionId,
        })

        return reply.status(201).send()
    })

    app.post('/createmeal', {
        preHandler: [checkSessionIdExists]
    }, async (request, reply) => {
        
        const createMealBodySchema = z.object({
            name: z.string(), 
            description: z.string(),
            isInDiet: z.boolean(),
            meal_date: z.string(),  
            meal_time: z.string(),
        })

        const { sessionId } = request.cookies

        const { name, description, isInDiet, meal_date, meal_time} = createMealBodySchema.parse(request.body)

        await knex('meal')
            .where('session_id', sessionId)
            .insert({
                id: randomUUID(),
                name,
                description,
                isInDiet,
                meal_date,
                meal_time,
                session_id: sessionId         
            })
    
        return reply.status(201).send()
    })

    app.get('/', {
        preHandler: [checkSessionIdExists]
    }, async (request, reply ) => {

        const { sessionId } = request.cookies

        console.log(sessionId)

        const meals = await knex('meal')
            .where('session_id', sessionId)
            .select()


        return { meals }
    })

    app.get('/userlist', async (request ) => {
        const usermeals = await knex('usermeal').select()

        return { 
            usermeals,
        }
    })

    app.get('/:id', {
        preHandler: [checkSessionIdExists]
    }, async (request) => {
        const getMealParamsSchema = z.object({
            id: z.string().uuid(),
        })

        const { sessionId } = request.cookies

        const { id } = getMealParamsSchema.parse(request.params)

        const meal = await knex('meal')
            .where({
                session_id: sessionId,
                id,
            })
            .first()

        return { meal }
    })
    
    app.get('/summary', {
        preHandler: [checkSessionIdExists]
    }, async (request) => {

        const { sessionId } = request.cookies

        const summary = await knex('meal')
            .where('session_id', sessionId)
            .count('id', { as: 'totalMeals'})
            .first();

        const mealWithinDietCount = await knex('meal')
            .where('session_id', sessionId)
            .where({ isInDiet: true })
            .count('id', {as: 'onDiet'}).first();

        const mealOutsideDietCount = await knex('meal')
            .where('session_id', sessionId)
            .where({ isInDiet: false })
            .count('id', {as: 'offDiet'}).first();

            const meals = await knex('meal').orderBy('created_at');

            let maxSequence = 0;
            let currentSequence = 0;
        
            meals.forEach((meal) => {
              if (meal.isInDiet) {
                currentSequence++;
                maxSequence = Math.max(maxSequence, currentSequence);
              } else {
                currentSequence = 0;
              }
            });

        return { 
            summary, 
            mealOutsideDietCount, 
            mealWithinDietCount,
            bestDietSequence: maxSequence, }
    });

    app.delete('/:id', {
        preHandler: [checkSessionIdExists]
     }, async (request, reply) => {
        const getMealParamsSchema = z.object({
            id: z.string().uuid(),
        })

        const { sessionId } = request.cookies

        const { id } = getMealParamsSchema.parse(request.params)

        const existingMeal = await knex('meal').where('id', id).first();

        if (!existingMeal) {
            return reply.status(404).send('Refeição não encontrada');
        }

        await knex('meal')
            .where({
                session_id: sessionId,
                id,
            })
            .del()

        return reply.status(200).send('Refeição excluída com sucesso');
    });

    app.patch('/:id', {
        preHandler: [checkSessionIdExists],
      }, async (request, reply) => {
        const updateMealParamsSchema = z.object({
          id: z.string().uuid(),
        });
      
        const updateMealBodySchema = z.object({
          name: z.string().optional(),
          description: z.string().optional(),
          isInDiet: z.boolean().optional(),
          meal_date: z.string().optional(),
          meal_time: z.string().optional(),
        });
      
        const { sessionId } = request.cookies;
        const { id } = updateMealParamsSchema.parse(request.params);
        const { name, description, isInDiet, meal_date, meal_time } = updateMealBodySchema.parse(request.body);
      
        const existingMeal = await knex('meal').where({ id, session_id: sessionId }).first();
        if (!existingMeal) {
          return reply.status(404).send('Refeição não encontrada');
        }
      
        const updatedFields = {
            name: name !== null ? name : existingMeal.name,
            description: description !== null ? description : existingMeal.description,
            isInDiet: isInDiet !== null ? isInDiet : existingMeal.isInDiet,
            meal_date: meal_date !== null ? meal_date : existingMeal.meal_date,
            meal_time: meal_time !== null ? meal_time : existingMeal.meal_time,
        };
      
        await knex('meal').where({ id, session_id: sessionId }).update(updatedFields);
      
        return reply.status(200).send('Refeição atualizada com sucesso');
    });
}