import inquirer from 'inquirer';

inquirer.prompt([
  {
    type: 'input',
    name: 'test',
    message: 'Is inquirer working?'
  }
]).then(answers => {
  console.log(answers);
});