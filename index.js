import inquirer from 'inquirer';
import { getDepartments, getRoles, getEmployees, addDepartment, addRole, addEmployee, deleteEmployee, deleteRole, getManagers, modifyEmployee, getEmployeeDetails, getRoleDetails, getEmployeesByDepartmentId, deleteDepartment, getEmployeesByManagerId, getDepartmentBudget } from './src/queries.js';

/**
 * Displays a welcome message to the console.
 */
const displayWelcomeMessage = () => {
  console.log(`
  Welcome to the Employee Management System!
  -----------------------------------------`);
};

/**
 * Displays a summary table of departments and employees.
 * Fetches departments, employees, and roles from the database.
 * Counts employees by department and displays the summary in a table format.
 */
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
      acc[departmentName] = [];
    }
    acc[departmentName].push(role.title);
    return acc;
  }, {});

  console.table(rolesByDepartment);
};

/**
 * Prompts the user to select an action from a list of options.
 * Calls the appropriate function based on the user's selection.
 */
const promptUser = async () => {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        'View All Departments',
        'View All Roles',
        'View All Employees',
        'Add Department',
        'Add Role',
        'Add Employee',
        'Update Employee Role',
        'Delete Employee',
        'Delete Role',
        'Delete Department',
        'View Employees by Manager',
        'View Employees by Department',
        'View Department Budget',
        'Exit'
      ]
    }
  ]);

  switch (action) {
    case 'View All Departments':
      return viewAllDepartments();
    case 'View All Roles':
      return viewAllRoles();
    case 'View All Employees':
      return viewAllEmployees();
    case 'Add Department':
      return addNewDepartment();
    case 'Add Role':
      return addNewRole();
    case 'Add Employee':
      return addNewEmployee();
    case 'Update Employee Role':
      return updateEmployeeRole();
    case 'Delete Employee':
      return removeEmployee();
    case 'Delete Role':
      return removeRole();
    case 'Delete Department':
      return removeDepartment();
    case 'View Employees by Manager':
      return viewEmployeesByManager();
    case 'View Employees by Department':
      return viewEmployeesByDepartment();
    case 'View Department Budget':
      return viewDepartmentBudget();
    case 'Exit':
      return process.exit();
  }
};

/**
 * Fetches and displays all departments.
 */
const viewAllDepartments = async () => {
  const departments = await getDepartments();
  console.table(departments);
  promptUser();
};

/**
 * Fetches and displays all roles.
 */
const viewAllRoles = async () => {
  const roles = await getRoles();
  console.table(roles);
  promptUser();
};

/**
 * Fetches and displays all employees.
 */
const viewAllEmployees = async () => {
  const employees = await getEmployees();
  console.table(employees);
  promptUser();
};

/**
 * Prompts the user to enter details for a new department and adds it to the database.
 */
const addNewDepartment = async () => {
  const { name } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Enter the name of the new department:'
    }
  ]);
  await addDepartment(name);
  console.log(`Added new department: ${name}`);
  promptUser();
};

/**
 * Prompts the user to enter details for a new role and adds it to the database.
 */
const addNewRole = async () => {
  const departments = await getDepartments();
  const { title, salary, department_id } = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'Enter the title of the new role:'
    },
    {
      type: 'input',
      name: 'salary',
      message: 'Enter the salary for the new role:'
    },
    {
      type: 'list',
      name: 'department_id',
      message: 'Select the department for the new role:',
      choices: departments.map(department => ({
        name: department.name,
        value: department.id
      }))
    }
  ]);
  await addRole({ title, salary, department_id });
  console.log(`Added new role: ${title}`);
  promptUser();
};

/**
 * Prompts the user to enter details for a new employee and adds them to the database.
 */
const addNewEmployee = async () => {
  const roles = await getRoles();
  const managers = await getManagers();
  const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([
    {
      type: 'input',
      name: 'first_name',
      message: 'Enter the first name of the new employee:'
    },
    {
      type: 'input',
      name: 'last_name',
      message: 'Enter the last name of the new employee:'
    },
    {
      type: 'list',
      name: 'role_id',
      message: 'Select the role for the new employee:',
      choices: roles.map(role => ({
        name: role.title,
        value: role.id
      }))
    },
    {
      type: 'list',
      name: 'manager_id',
      message: 'Select the manager for the new employee:',
      choices: managers.map(manager => ({
        name: `${manager.first_name} ${manager.last_name}`,
        value: manager.id
      }))
    }
  ]);
  await addEmployee({ first_name, last_name, role_id, manager_id });
  console.log(`Added new employee: ${first_name} ${last_name}`);
  promptUser();
};

/**
 * Prompts the user to select an employee and a new role, then updates the employee's role in the database.
 */
const updateEmployeeRole = async () => {
  const employees = await getEmployees();
  const roles = await getRoles();
  const { employee_id, role_id } = await inquirer.prompt([
    {
      type: 'list',
      name: 'employee_id',
      message: 'Select the employee to update:',
      choices: employees.map(employee => ({
        name: `${employee.first_name} ${employee.last_name}`,
        value: employee.id
      }))
    },
    {
      type: 'list',
      name: 'role_id',
      message: 'Select the new role for the employee:',
      choices: roles.map(role => ({
        name: role.title,
        value: role.id
      }))
    }
  ]);
  await modifyEmployee(employee_id, { role_id });
  console.log(`Updated employee's role`);
  promptUser();
};

/**
 * Prompts the user to select an employee and removes them from the database.
 */
const removeEmployee = async () => {
  const employees = await getEmployees();
  const { employee_id } = await inquirer.prompt([
    {
      type: 'list',
      name: 'employee_id',
      message: 'Select the employee to remove:',
      choices: employees.map(employee => ({
        name: `${employee.first_name} ${employee.last_name}`,
        value: employee.id
      }))
    }
  ]);
  await deleteEmployee(employee_id);
  console.log(`Removed employee`);
  promptUser();
};

/**
 * Prompts the user to select a role and removes it from the database.
 */
const removeRole = async () => {
  const roles = await getRoles();
  const { role_id } = await inquirer.prompt([
    {
      type: 'list',
      name: 'role_id',
      message: 'Select the role to remove:',
      choices: roles.map(role => ({
        name: role.title,
        value: role.id
      }))
    }
  ]);
  await deleteRole(role_id);
  console.log(`Removed role`);
  promptUser();
};

/**
 * Prompts the user to select a department and removes it from the database.
 */
const removeDepartment = async () => {
  const departments = await getDepartments();
  const { department_id } = await inquirer.prompt([
    {
      type: 'list',
      name: 'department_id',
      message: 'Select the department to remove:',
      choices: departments.map(department => ({
        name: department.name,
        value: department.id
      }))
    }
  ]);
  await deleteDepartment(department_id);
  console.log(`Removed department`);
  promptUser();
};

/**
 * Prompts the user to select a manager and displays all employees managed by that manager.
 */
const viewEmployeesByManager = async () => {
  const managers = await getManagers();
  const { manager_id } = await inquirer.prompt([
    {
      type: 'list',
      name: 'manager_id',
      message: 'Select the manager to view employees:',
      choices: managers.map(manager => ({
        name: `${manager.first_name} ${manager.last_name}`,
        value: manager.id
      }))
    }
  ]);
  const employees = await getEmployeesByManagerId(manager_id);
  console.table(employees);
  promptUser();
};

/**
 * Prompts the user to select a department and displays all employees in that department.
 */
const viewEmployeesByDepartment = async () => {
  const departments = await getDepartments();
  const { department_id } = await inquirer.prompt([
    {
      type: 'list',
      name: 'department_id',
      message: 'Select the department to view employees:',
      choices: departments.map(department => ({
        name: department.name,
        value: department.id
      }))
    }
  ]);
  const employees = await getEmployeesByDepartmentId(department_id);
  console.table(employees);
  promptUser();
};

/**
 * Prompts the user to select a department and displays the total utilized budget for that department.
 */
const viewDepartmentBudget = async () => {
  const departments = await getDepartments();
  const { department_id } = await inquirer.prompt([
    {
      type: 'list',
      name: 'department_id',
      message: 'Select the department to view budget:',
      choices: departments.map(department => ({
        name: department.name,
        value: department.id
      }))
    }
  ]);
  const budget = await getDepartmentBudget(department_id);
  console.log(`Total utilized budget for department: ${budget}`);
  promptUser();
};

// Start the application
displayWelcomeMessage();
promptUser();