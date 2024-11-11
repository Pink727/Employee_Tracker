import pool from './connection.js';

// Fetch all departments from the database
export const getDepartments = async () => {
  const res = await pool.query('SELECT * FROM department');
  return res.rows;
};

// Fetch all roles from the database
export const getRoles = async () => {
  const res = await pool.query('SELECT * FROM role');
  return res.rows;
};

// Fetch all employees from the database
export const getEmployees = async () => {
  const res = await pool.query('SELECT * FROM employee');
  return res.rows;
};

// Add a new department to the database
export const addDepartment = async (name) => {
  await pool.query('INSERT INTO department (name) VALUES ($1)', [name]);
};

// Add a new role to the database
export const addRole = async (title, salary, department_id) => {
  await pool.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [title, salary, department_id]);
};

// Add a new employee to the database
export const addEmployee = async ({ first_name, last_name, role_id, manager_id }) => {
  const query = `
    INSERT INTO employee (first_name, last_name, role_id, manager_id)
    VALUES ($1, $2, $3, $4)
  `;
  const values = [first_name, last_name, role_id, manager_id];
  await pool.query(query, values);
};

// Update the role of an existing employee in the database
export const updateEmployeeRole = async (employee_id, role_id) => {
  await pool.query('UPDATE employee SET role_id = $1 WHERE id = $2', [role_id, employee_id]);
};

// Delete an employee from the database
export const deleteEmployee = async (employee_id) => {
  await pool.query('DELETE FROM employee WHERE id = $1', [employee_id]);
};

// Fetch all employees with a specific role ID from the database
export const getEmployeesByRoleId = async (roleId) => {
  const res = await pool.query('SELECT * FROM employee WHERE role_id = $1', [roleId]);
  return res.rows;
};

// Delete a role from the database if it is not assigned to any employees
export const deleteRole = async (roleId) => {
  const employees = await getEmployeesByRoleId(roleId);
  if (employees.length > 0) {
    throw new Error(`Cannot delete role with ID ${roleId} because it is still assigned to employees.`);
  }

  const query = 'DELETE FROM role WHERE id = $1';
  await pool.query(query, [roleId]);
};