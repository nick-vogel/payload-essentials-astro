import * as migration_20261001_192730_initial from './20261001_192730_initial';

export const migrations = [
  {
    up: migration_20261001_192730_initial.up,
    down: migration_20261001_192730_initial.down,
    name: '20261001_192730_initial'
  },
];
