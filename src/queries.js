import pool from './connection.js';

export const getDepartments = async () => {
  const res = await pool.query('SELECT * FROM department');
  return res.rows;
};

export const getRoles = async () => {
  const res = await pool.query('SELECT * FROM role');
  return res.rows;
};

export const getEmployees = async () => {
  const res = await pool.query('SELECT * FROM employee');
  return res.rows;
};

export const addDepartment = async (name) => {
  await pool.query('INSERT INTO department (name) VALUES ($1)', [name]);
};

export const addRole = async (title, salary, department_id) => {
  await pool.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [title, salary, department_id]);
};

export const addEmployee = async (first_name, last_name, role_id, manager_id) => {
  await pool.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [first_name, last_name, role_id, manager_id]);
};

export const updateEmployeeRole = async (employee_id, role_id) => {
  await pool.query('UPDATE employee SET role_id = $1 WHERE id = $2', [role_id, employee_id]);
};

export const deleteEmployee = async (employee_id) => {
  await pool.query('DELETE FROM employee WHERE id = $1', [employee_id]);
};