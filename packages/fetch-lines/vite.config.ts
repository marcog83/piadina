import { defineConfig } from 'vite';
import getBaseConfig from '../../config/vite/base';

export default defineConfig(({ mode }) => getBaseConfig({ mode, __dirname }));
