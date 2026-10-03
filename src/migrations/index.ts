import * as migration_20261001_192730_initial from './20261001_192730_initial';
import * as migration_20261003_204332_payload_3_90 from './20261003_204332_payload_3_90';

export const migrations = [
  {
    up: migration_20261001_192730_initial.up,
    down: migration_20261001_192730_initial.down,
    name: '20261001_192730_initial',
  },
  {
    up: migration_20261003_204332_payload_3_90.up,
    down: migration_20261003_204332_payload_3_90.down,
    name: '20261003_204332_payload_3_90'
  },
];
