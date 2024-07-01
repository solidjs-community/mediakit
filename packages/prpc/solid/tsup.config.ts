import { defineConfig } from 'tsup'
import * as preset from 'tsup-preset-solid'

const preset_options: preset.PresetOptions = {
  entries: [
    {
      entry: 'src/index.ts',
      dev_entry: true,
      server_entry: true,
    },
  ],
  drop_console: false,
  cjs: true,
}
const parsed_data = preset.parsePresetOptions(preset_options);
export default defineConfig(preset.generateTsupOptions(parsed_data))