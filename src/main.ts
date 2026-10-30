import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Candle } from './simulation/candle';
import { SeededGenerator } from './simulation/seeded-generator';

export const SMOKE_CONFIG = Object.freeze({ seed: 'bot-crypto-mvp-001-a-v1', startTime: '2026-01-01T00:00:00.000Z' });

export async function runSmoke(): Promise<readonly Candle[]> {
  const app = await NestFactory.createApplicationContext(AppModule.configure(SMOKE_CONFIG), { logger: false });
  try {
    const generator = app.get(SeededGenerator);
    const sample: Candle[] = [];
    for (let step = 0; step < 3; step++) sample.push(...generator.next());
    return Object.freeze(sample);
  } finally {
    await app.close();
  }
}

if (require.main === module) {
  runSmoke().then((sample) => {
    console.log(JSON.stringify({ ...SMOKE_CONFIG, synthetic: true, sample }, null, 2));
  }).catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
