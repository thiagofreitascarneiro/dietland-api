import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'crypto'

export async function transactionsRoutes(app: FastifyInstance) {
    
    app.post('/user', async (request, reply) => {

        const createUser = z.object({
            user: z.string(),
            email: z.string()
        })

        console.log('JSON recebido:', request.body);

        const { user, email } = createUser.parse(request.body)

        let sessionId = request.cookies.sessionId

        if(!sessionId) {
            sessionId = randomUUID()

            reply.cookie('sessionId', sessionId, {
                path: '/user',
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

    app.get('/', async () => {
        const meals = await knex('meal').select()

        return { 
            meals
        }
    })

    app.get('/userlist', async () => {
        const usermeals = await knex('usermeal').select()

        return { 
            usermeals
        }
    })

    app.get('/:id', async (request) => {
        const getMealParamsSchema = z.object({
            id: z.string().uuid(),
        })

        const { id } = getMealParamsSchema.parse(request.params)

        const meal = await knex('meal').where('id', id).first()

        return { meal }
    })
    
    app.post('/createdmeal', async (request, reply) => {
        
        const createMealBodySchema = z.object({
            name: z.string(), 
            description: z.string(),
            isInDiet: z.boolean(),
        })

        const { name, description, isInDiet } = createMealBodySchema.parse(request.body)

        await knex('meal').insert({
            id: randomUUID(),
            name,
            description,
            isInDiet,
        })
    
        return reply.status(201).send()
    })

    app.get('/summary', async () => {
        const summary = await knex('meal')
            .count('id', { as: 'totalMeals'})
            .first();

        const mealWithinDietCount = await knex('meal')
            .where({ isInDiet: true })
            .count('id', {as: 'onDiet'}).first();

        const mealOutsideDietCount = await knex('meal')
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
}