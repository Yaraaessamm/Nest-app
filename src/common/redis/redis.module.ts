import { Module } from '@nestjs/common';
import { createClient } from 'redis';

@Module({
  imports: [],
  controllers: [],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async () => {
        const redis = await createClient({
          url: process.env.REDIS_URL,
        });
        await redis.connect();
        console.log('redis connected successfully');
        redis.on('error', (err) => {
          console.log('redis connected error', err);
        });
        return redis;
      },
    },
  ],
  exports: ["REDIS_CLIENT"],
})
export class RedisModule {}