import { outro } from '@clack/prompts';
import colors from 'picocolors';

export const exitProgram = ({ code = 0, message = 'No se ha creado el commit' } = {}) => {
  outro(colors.yellow(message));
  process.exit(code);
};
