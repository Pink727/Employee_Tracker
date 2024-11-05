import inquirer from 'inquirer';
import { getDepartments, getRoles, getEmployees, addDepartment, addRole, addEmployee, updateEmployeeRole, deleteEmployee } from './src/queries.js';

const mainMenu = async () => {
  const { action } = await inquirer.prompt({
    name: 'action',
    type: 'list',
    message: 'What would you like to do?',
    choices: [
      'View all departments',
      'View all roles',
      'View all employees',
      'Add a department',
      'Add a role',
      'Add an employee',
      'Update an employee role',
      'Delete an employee',
      'Exit'
    ],
  });

  switch (action) {
    case 'View all departments':
      const departments = await getDepartments();
      console.table(departments);
      break;
    case 'View all roles':
      const roles = await getRoles();
      console.table(roles);
      break;
    case 'View all employees':
      const employees = await getEmployees();
      console.table(employees);
      break;
    case 'Add a department':
      const { departmentName } = await inquirer.prompt({
        name: 'departmentName',
        type: 'input',
        message: 'Enter the name of the department:',
      });
      await addDepartment(departmentName);
      console.log('Department added!');
      break;
    case 'Add a role':
      const { roleTitle, roleSalary, roleDepartmentId } = await inquirer.prompt([
        { name: 'roleTitle', type: 'input', message: 'Enter the title of the role:' },
        { name: 'roleSalary', type: 'input', message: 'Enter the salary of the role:' },
        { name: 'roleDepartmentId', type: 'input', message: 'Enter the department ID of the role:' },
      ]);
      await addRole(roleTitle, roleSalary, roleDepartmentId);
      console.log('Role added!');
      break;
    case 'Add an employee':
      const { firstName, lastName, roleId, managerId } = await inquirer.prompt([
        { type: 'input', name: 'firstName', message: 'Enter the first name of the employee:' },
        { type: 'input', name: 'lastName', message: 'Enter the last name of the employee:' },
        { type: 'input', name: 'roleId', message: 'Enter the role ID of the employee:' },
        { type: 'input', name: 'managerId', message: 'Enter the manager ID of the employee (leave blank if none):' },
      ]);
      await addEmployee(firstName, lastName, roleId, managerId || null);
      console.log('Employee added successfully');
      break;
    case 'Update an employee role':
      const employeesForUpdate = await getEmployees();
      const { employeeIdForUpdate } = await inquirer.prompt([
        {
          name: 'employeeIdForUpdate',
          type: 'list',
          message: 'Select the employee to update:',
          choices: employeesForUpdate.map(employee => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id
          }))
        }
      ]);
      const { newRoleId } = await inquirer.prompt([
        { name: 'newRoleId', type: 'input', message: 'Enter the new role ID of the employee:' },
      ]);
      await updateEmployeeRole(employeeIdForUpdate, newRoleId);
      console.log('Employee role updated!');
      break;
    case 'Delete an employee':
      const employeesForDelete = await getEmployees();
      const { employeeIdForDelete } = await inquirer.prompt([
        {
          name: 'employeeIdForDelete',
          type: 'list',
          message: 'Select the employee to delete:',
          choices: employeesForDelete.map(employee => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id
          }))
        }
      ]);
      await deleteEmployee(employeeIdForDelete);
      console.log('Employee deleted!');
      break;
    case 'Exit':
      process.exit();
  }

  mainMenu();
};

mainMenu();