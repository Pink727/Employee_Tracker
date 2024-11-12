import inquirer from 'inquirer';
import { getDepartments, getRoles, getEmployees, addDepartment, addRole, addEmployee, deleteEmployee, deleteRole, getManagers, modifyEmployee, getEmployeeDetails, getRoleDetails, getEmployeesByDepartmentId, deleteDepartment } from './src/queries.js';

const displayWelcomeMessage = () => {
  console.log(`
  Welcome to the Employee Management System!
  -----------------------------------------`);
};

const displaySummaryTable = async () => {
  const departments = await getDepartments();
  const employees = await getEmployees();
  const roles = await getRoles();

  // Create a map to count employees by department
  const employeeCountByDepartment = employees.reduce((acc, employee) => {
    const role = roles.find(role => role.id === employee.role_id);
    if (role) {
      if (!acc[role.department_id]) {
        acc[role.department_id] = 0;
      }
      acc[role.department_id]++;
    }
    return acc;
  }, {});

  console.table([
    { 'Total Departments': departments.length, 'Total Employees': employees.length }
  ]);

  const rolesByDepartment = roles.reduce((acc, role) => {
    const department = departments.find(dept => dept.id === role.department_id);
    const departmentName = department?.name || 'Unknown';
    if (!acc[departmentName]) {
      acc[departmentName] = {
        roles: [],
        employeeCount: employeeCountByDepartment[department?.id] || 0
      };
    }
    acc[departmentName].roles.push({
      'Role ID': role.id,
      'Role Title': role.title
    });
    return acc;
  }, {});

  for (const [departmentName, { roles, employeeCount }] of Object.entries(rolesByDepartment)) {
    console.log(`\nDepartment: ${departmentName} (Employees: ${employeeCount})`);
    console.table(roles);
  }
};

const addNewEmployee = async () => {
  const roles = await getRoles();
  const managers = await getManagers();
  
  const roleChoices = roles.map(role => ({
    name: role.title,
    value: role.id
  }));
  roleChoices.unshift({ name: 'Cancel', value: null });

  const managerChoices = managers.map(emp => ({
    name: `${emp.first_name} ${emp.last_name}`,
    value: emp.id
  }));
  managerChoices.unshift({ name: 'None', value: null });

  const answers = await inquirer.prompt([
    {
      name: 'firstName',
      type: 'input',
      message: 'Enter the first name of the employee:'
    },
    {
      name: 'lastName',
      type: 'input',
      message: 'Enter the last name of the employee:'
    },
    {
      name: 'roleId',
      type: 'list',
      message: 'Enter the role ID of the employee:',
      choices: roleChoices
    },
    {
      name: 'managerId',
      type: 'list',
      message: 'Select the manager of the employee (if any):',
      choices: managerChoices
    }
  ]);

  if (answers.roleId === null) {
    console.log('Operation canceled.');
    return;
  }

  // Ensure that firstName and lastName are not null or empty
  if (!answers.firstName || !answers.lastName) {
    console.error("First name and last name are required.");
    return;
  }

  await addEmployee(answers.firstName, answers.lastName, answers.roleId, answers.managerId);
  console.log('Employee added successfully!');
};

const modifyEmployeeDetails = async () => {
  const employees = await getEmployees();
  const roles = await getRoles();

  const employeeChoices = employees.map(emp => ({
    name: `${emp.first_name} ${emp.last_name}`,
    value: emp.id
  }));
  employeeChoices.unshift({ name: 'Cancel', value: null });

  const roleChoices = roles.map(role => ({
    name: role.title,
    value: role.id
  }));
  roleChoices.unshift({ name: 'No Change', value: null });

  const { employeeId } = await inquirer.prompt({
    name: 'employeeId',
    type: 'list',
    message: 'Select the employee to modify:',
    choices: employeeChoices
  });

  if (employeeId === null) {
    console.log('Operation canceled.');
    return;
  }

  const managerChoices = employees
    .filter(emp => emp.id !== employeeId)
    .map(emp => ({
      name: `${emp.first_name} ${emp.last_name}`,
      value: emp.id
    }));
  managerChoices.unshift({ name: 'No Change', value: null });

  const answers = await inquirer.prompt([
    {
      name: 'newRoleId',
      type: 'list',
      message: 'Select the new role for the employee:',
      choices: roleChoices
    },
    {
      name: 'newManagerId',
      type: 'list',
      message: 'Select the new manager for the employee (if any):',
      choices: managerChoices
    }
  ]);

  // Get the current role and manager if "No Change" is selected
  const employee = employees.find(emp => emp.id === employeeId);
  const newRoleId = answers.newRoleId || employee.role_id;
  const newManagerId = answers.newManagerId || employee.manager_id;

  await modifyEmployee(employeeId, newRoleId, newManagerId);
  console.log('Employee details modified successfully!');
};

const displayEmployees = async () => {
  const employeeDetails = await getEmployeeDetails();
  console.table(employeeDetails);
};

const displayRoles = async () => {
  const roleDetails = await getRoleDetails();
  console.table(roleDetails);
};

const displayEmployeesByDepartment = async () => {
  const departments = await getDepartments();
  const departmentChoices = departments.map(dept => ({
    name: dept.name,
    value: dept.id
  }));
  departmentChoices.unshift({ name: 'Cancel', value: null });

  const { departmentId } = await inquirer.prompt({
    name: 'departmentId',
    type: 'list',
    message: 'Select the department:',
    choices: departmentChoices
  });

  if (departmentId === null) {
    console.log('Operation canceled.');
    return;
  }

  const employeeDetails = await getEmployeesByDepartmentId(departmentId);
  console.table(employeeDetails);
};

const deleteADepartment = async () => {
  const departments = await getDepartments();
  const departmentChoices = departments.map(dept => ({
    name: dept.name,
    value: dept.id
  }));
  departmentChoices.unshift({ name: 'Cancel', value: null });

  const { departmentId } = await inquirer.prompt({
    name: 'departmentId',
    type: 'list',
    message: 'Select the department to delete:',
    choices: departmentChoices
  });

  if (departmentId === null) {
    console.log('Operation canceled.');
    return;
  }

  const employeeDetails = await getEmployeesByDepartmentId(departmentId);

  if (employeeDetails.length > 0) {
    console.log('The following employees are in this department:');
    console.table(employeeDetails);

    const { update } = await inquirer.prompt({
      name: 'update',
      type: 'confirm',
      message: 'Would you like to update the employee information?'
    });

    if (update) {
      await modifyEmployeeDetails();
      return;
    } else {
      console.log('Department deletion canceled.');
      return;
    }
  }

  const { confirm } = await inquirer.prompt({
    name: 'confirm',
    type: 'confirm',
    message: 'Are you sure you want to delete this department? This action cannot be undone.'
  });

  if (confirm) {
    await deleteDepartment(departmentId);
    console.log('Department deleted successfully!');
  } else {
    console.log('Department deletion canceled.');
  }
};

const deleteARole = async () => {
  const roles = await getRoles();
  const roleChoices = roles.map(role => ({
    name: role.title,
    value: role.id
  }));
  roleChoices.unshift({ name: 'Cancel', value: null });

  const { roleId } = await inquirer.prompt({
    name: 'roleId',
    type: 'list',
    message: 'Select the role to delete:',
    choices: roleChoices
  });

  if (roleId === null) {
    console.log('Operation canceled.');
    return;
  }

  const { confirm } = await inquirer.prompt({
    name: 'confirm',
    type: 'confirm',
    message: 'Are you sure you want to delete this role? This action cannot be undone.'
  });

  if (confirm) {
    await deleteRole(roleId);
    console.log('Role deleted successfully!');
  } else {
    console.log('Role deletion canceled.');
  }
};

const mainMenu = async () => {
  const { action } = await inquirer.prompt({
    name: 'action',
    type: 'list',
    message: 'What would you like to do?',
    choices: [
      'View all departments',
      'View all roles',
      'View all employees',
      'View employees by department',
      'Add a department',
      'Add a role',
      'Add an employee',
      'Modify an employee',
      'Delete an employee',
      'Delete a role',
      'Delete a department',
      'Exit'
    ]
  });

  switch (action) {
    case 'View all departments':
      await displaySummaryTable();
      break;
    case 'View all roles':
      await displayRoles();
      break;
    case 'View all employees':
      await displayEmployees();
      break;
    case 'View employees by department':
      await displayEmployeesByDepartment();
      break;
    case 'Add a department':
      await addNewDepartment();
      break;
    case 'Add a role':
      await addNewRole();
      break;
    case 'Add an employee':
      await addNewEmployee();
      break;
    case 'Modify an employee':
      await modifyEmployeeDetails();
      break;
    case 'Delete an employee':
      await deleteAnEmployee();
      break;
    case 'Delete a role':
      await deleteARole();
      break;
    case 'Delete a department':
      await deleteADepartment();
      break;
    default:
      console.log('Goodbye!');
      process.exit();
  }

  await mainMenu(); // Loop back to the main menu
};

const addNewDepartment = async () => {
  const { name } = await inquirer.prompt({
    name: 'name',
    type: 'input',
    message: 'Enter the name of the department:'
  });

  const { confirm } = await inquirer.prompt({
    name: 'confirm',
    type: 'confirm',
    message: `Are you sure you want to add the department "${name}"?`
  });

  if (!confirm) {
    console.log('Operation canceled.');
    return;
  }

  await addDepartment(name);
  console.log('Department added successfully!');
};

const addNewRole = async () => {
  const departments = await getDepartments();
  const departmentChoices = departments.map(dept => ({
    name: dept.name,
    value: dept.id
  }));
  departmentChoices.unshift({ name: 'Cancel', value: null });

  const answers = await inquirer.prompt([
    {
      name: 'title',
      type: 'input',
      message: 'Enter the title of the role:'
    },
    {
      name: 'salary',
      type: 'input',
      message: 'Enter the salary of the role:'
    },
    {
      name: 'departmentId',
      type: 'list',
      message: 'Select the department for the role:',
      choices: departmentChoices
    }
  ]);

  if (answers.departmentId === null) {
    console.log('Operation canceled.');
    return;
  }

  await addRole(answers.title, answers.salary, answers.departmentId);
  console.log('Role added successfully!');
};

const deleteAnEmployee = async () => {
  const employees = await getEmployees();
  const employeeChoices = employees.map(emp => ({
    name: `${emp.first_name} ${emp.last_name}`,
    value: emp.id
  }));
  employeeChoices.unshift({ name: 'Cancel', value: null });

  const { employeeId } = await inquirer.prompt({
    name: 'employeeId',
    type: 'list',
    message: 'Select the employee to delete:',
    choices: employeeChoices
  });

  if (employeeId === null) {
    console.log('Operation canceled.');
    return;
  }

  await deleteEmployee(employeeId);
  console.log('Employee deleted successfully!');
};

// Example usage
const main = async () => {
  displayWelcomeMessage();
  await mainMenu();
};

main();