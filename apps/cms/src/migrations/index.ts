import * as migration_20261001_192730_initial from './20261001_192730_initial';
import * as migration_20261003_204332_payload_3_90 from './20261003_204332_payload_3_90';
import * as migration_20261003_205639_media_on_disk from './20261003_205639_media_on_disk';

export const migrations = [
  {
    up: migration_20261001_192730_initial.up,
    down: migration_20261001_192730_initial.down,
    name: '20261001_192730_initial',
  },
  {
    up: migration_20261003_204332_payload_3_90.up,
    down: migration_20261003_204332_payload_3_90.down,
    name: '20261003_204332_payload_3_90',
  },
  {
    up: migration_20261003_205639_media_on_disk.up,
    down: migration_20261003_205639_media_on_disk.down,
    name: '20261003_205639_media_on_disk'
  },
];
