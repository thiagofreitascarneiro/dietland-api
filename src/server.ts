/* eslint-disable prettier/prettier */
import fastify from 'fastify'
import cookie from '@fastify/cookie'

import { env } from './env'
import { transactionsRoutes } from './routes/mealRegister'

const app = fastify()

app.register(cookie)
app.register(transactionsRoutes, {
    prefix: 'meal',
})

app.listen({
    port: env.PORT,
}).then(() => {
    console.log('HTTP Server Running!!')
})

