import { DynamicModule, Module } from '@nestjs/common';
import { SimulationClock } from './simulation/clock';
import { GeneratorConfig, SeededGenerator } from './simulation/seeded-generator';

export interface SimulationConfig extends GeneratorConfig { readonly startTime: string }

@Module({})
export class SimulationModule {
  static configure(config: SimulationConfig): DynamicModule {
    return {
      module: SimulationModule,
      providers: [
        { provide: SimulationClock, useFactory: () => new SimulationClock(config.startTime) },
        { provide: SeededGenerator, useFactory: (clock: SimulationClock) => new SeededGenerator(clock, config), inject: [SimulationClock] },
      ],
      exports: [SimulationClock, SeededGenerator],
    };
  }
}

@Module({})
export class AppModule {
  static configure(config: SimulationConfig): DynamicModule {
    return { module: AppModule, imports: [SimulationModule.configure(config)] };
  }
}
