import { intro, outro, text, select, confirm, multiselect, isCancel } from '@clack/prompts';
import { COMMIT_TYPES } from './commit-types.js';
import colors from 'picocolors';
import { getChangedFiles, getStagedFiles, gitAdd, gitCommit } from './git.js';
import { trytm } from '@bdsqqq/try';
import { exitProgram } from './utils.js';

intro(colors.inverse(` Asistente para la creación de commits por ${colors.yellow(' @clack ')}`));

const [changedFiles, errorChangedFiles] = await trytm(getChangedFiles());
const [stagedFiles, errorStagedFiles] = await trytm(getStagedFiles());

if (errorChangedFiles ?? errorStagedFiles) {
  outro(colors.red('Error: Comprueba que estás en un repositorio de git'));
  process.exit(1);
}

if (stagedFiles.length === 0 && changedFiles.length > 0) {
  const files = await multiselect({
    message: `${colors.cyan('Por favor Selecciona los archivos que quieres preparar para hacer commit')}`,
    options: changedFiles.map((file) => ({ value: file, label: file }))
  });

  if (isCancel(files)) {
    exitProgram();
  }
  await gitAdd({ files });
}

const commitType = await select({
  message: 'Selecciona el tipo de commit',
  options: Object.entries(COMMIT_TYPES).map(([key, value]) => ({
    value: key,
    label: `${value.emoji} ${key.padEnd(8, ' ')} - ${value.description}`
  }))
});

const commitMessage = await text({
  message: 'Introduce el mensaje del commit',
  validate: (value) => {
    if (value.length === 0) {
      return 'El mensaje del commit no puede estar vacío';
    }
    if (value.length > 50) {
      return 'El mensaje del commit no puede tener más de 50 caracteres';
    }
  }
});

if (isCancel(commitMessage)) {
  exitProgram();
}

const { emoji, release } = COMMIT_TYPES[commitType];
let breakingChange = false;
if (release) {
  breakingChange = await confirm({
    initialValue: false,
    message: `${colors.cyan('¿Tiene este commit cambios que rompen la compatibilidad anterior?')}
   ${colors.yellow(
     'Si la respuesta es si, deberías crear un commit de tipo "BREAKING CHANGE" y al hacer el release se creará una nueva versión mayor'
   )}`
  });

  if (isCancel(breakingChange)) {
    exitProgram();
  }
}

let commit = `${emoji} ${commitType}: ${commitMessage}`;
commit = breakingChange ? `${commit} BREAKING CHANGE` : commit;

const shouldContinue = await confirm({
  initialValue: true,
  message: `¿Quieres crear el commit con el siguiente mensaje?

    ${colors.green(colors.bold(commit))}

    ${colors.cyan('¿Confirmas?')}`
});

if (isCancel(shouldContinue)) {
  exitProgram();
}

await gitCommit({ commit });

outro(colors.green('✔ Commit creado con éxito. ¡Gracias por usar el asistente!'));
