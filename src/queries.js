import pool from './connection.js'; // Adjust the import according to your project structure

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

// Fetch only managers from the database
export const getManagers = async () => {
  const res = await pool.query(`
    SELECT DISTINCT e.id, e.first_name, e.last_name
    FROM employee e
    JOIN employee m ON e.id = m.manager_id
  `);
  return res.rows;
};

// Fetch detailed employee information
export const getEmployeeDetails = async () => {
  const query = `
    SELECT e.id, e.first_name, e.last_name, r.title AS role_title, r.salary, d.name AS department_name, 
           CONCAT(m.first_name, ' ', m.last_name) AS manager_name
    FROM employee e
    JOIN role r ON e.role_id = r.id
    JOIN department d ON r.department_id = d.id
    LEFT JOIN employee m ON e.manager_id = m.id
  `;
  const res = await pool.query(query);
  return res.rows;
};

// Fetch detailed role information
export const getRoleDetails = async () => {
  const query = `
    SELECT r.id, r.title, r.salary, d.name AS department_name
    FROM role r
    JOIN department d ON r.department_id = d.id
  `;
  const res = await pool.query(query);

  // Format the salary for each role
  const roleDetails = res.rows.map(role => ({
    ...role,
    salary: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(role.salary)
  }));

  return roleDetails;
};

// Fetch employees by department ID from the database
export const getEmployeesByDepartmentId = async (departmentId) => {
  const query = `
    SELECT e.id, e.first_name, e.last_name, r.title AS role_title, r.salary, d.name AS department_name, 
           CONCAT(m.first_name, ' ', m.last_name) AS manager_name
    FROM employee e
    JOIN role r ON e.role_id = r.id
    JOIN department d ON r.department_id = d.id
    LEFT JOIN employee m ON e.manager_id = m.id
    WHERE d.id = $1
  `;
  const res = await pool.query(query, [departmentId]);
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
export const addEmployee = async (firstName, lastName, roleId, managerId) => {
  const query = `
    INSERT INTO employee (first_name, last_name, role_id, manager_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [firstName, lastName, roleId, managerId];

  try {
    const res = await pool.query(query, values);
  } catch (err) {
    console.error("Error adding employee:", err);
  }
};

// Fetch employees by role ID from the database
export const getEmployeesByRoleId = async (roleId) => {
  const res = await pool.query('SELECT * FROM employee WHERE role_id = $1', [roleId]);
  return res.rows;
};

// Fetch employees by manager ID from the database
export const getEmployeesByManagerId = async (managerId) => {
  const query = `
    SELECT e.id, e.first_name, e.last_name, r.title AS role_title, r.salary, d.name AS department_name
    FROM employee e
    JOIN role r ON e.role_id = r.id
    JOIN department d ON r.department_id = d.id
    WHERE e.manager_id = $1
  `;
  const res = await pool.query(query, [managerId]);
  return res.rows;
};

// Delete an employee from the database
export const deleteEmployee = async (employeeId) => {
  await pool.query('DELETE FROM employee WHERE id = $1', [employeeId]);
};

// Delete a role from the database
export const deleteRole = async (roleId) => {
  await pool.query('DELETE FROM role WHERE id = $1', [roleId]);
};

// Modify an employee's role and manager
export const modifyEmployee = async (employeeId, newRoleId, newManagerId) => {
  const query = `
    UPDATE employee
    SET role_id = $1, manager_id = $2
    WHERE id = $3
    RETURNING *;
  `;
  const values = [newRoleId, newManagerId, employeeId];

  try {
    const res = await pool.query(query, values);
    return res.rows[0];
  } catch (err) {
    console.error("Error modifying employee:", err);
  }
};

// Delete a department from the database
export const deleteDepartment = async (departmentId) => {
  await pool.query('DELETE FROM department WHERE id = $1', [departmentId]);
};

// Fetch the total budget of a department
export const getDepartmentBudget = async (departmentId) => {
  const query = `
    SELECT SUM(r.salary) AS total_budget
    FROM employee e
    JOIN role r ON e.role_id = r.id
    WHERE r.department_id = $1
  `;
  const res = await pool.query(query, [departmentId]);
  const totalBudget = res.rows[0].total_budget;

  // Format the total budget
  const formattedBudget = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalBudget);
  return formattedBudget;
};