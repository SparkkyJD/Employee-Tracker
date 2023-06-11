const express = require('express');
const inquirer = require('inquirer');
const mysql = require('mysql2');
const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'company_db',
})
.promise();
// Starts application and prompts user to choose from a list of options
function startApp() {
  inquirer
    .prompt({
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        'View all departments',
        'View all roles',
        'View all employees',
        'Add a department',
        'Add a role',
        'Add an employee',
        'Update an employee',
        'Delete a department',
        'Delete a role',
        'Delete an employee',
        'Exit',
      ],
    })
    // runs function for whatever option is selected 
    .then((answer) => {
      switch (answer.action) {
        case 'View all departments':
          viewAllDepartments();
          break;
        case 'View all roles':
          viewAllRoles();
          break;
        case 'View all employees':
          viewAllEmployees();
          break;
        case 'Add a department':
          addDepartment();
          break;
        case 'Add a role':
          addRole();
          break;
        case 'Add an employee':
          addEmployee();
          break;
        case 'Update an employee':
          updateEmployee();
          break;
        case 'Delete a department':
          deleteDepartment();
          break;
        case 'Delete a role':
          deleteRole();
          break;
        case 'Delete an employee':
          deleteEmployee();
          break;
        case 'Exit':
          exitApp();
          break;
        default:
          console.log('Invalid choice. Please try again.');
          startApp();
          break;
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}
// displays all departments in the company_db
async function viewAllDepartments() {
  try {
    // retrieve all departments from company_db
    const [results] = await db.query('SELECT * FROM departments');
    // display results in a table
    console.table(results);
    // restarts app after function is completed
    startApp();
  } 
  catch (err) {
    console.error('Error retrieving departments:', err);
  }
}
// displays all roles in the company_db
async function viewAllRoles() {
  try {
    // retrieves all relevant roles data to table
    const [results] = await db.query(`
      SELECT roles.title, roles.id, departments.name AS department, roles.salary
      FROM roles
      INNER JOIN departments ON roles.department_id = departments.id
    `);
    console.table(results);
    startApp();
  } 
  catch (err) {
    console.error('Error retrieving roles:', err);
  }
}
// displays all employees in the company_db
async function viewAllEmployees() {
  try {
    // retrieves all relevant employee data using complex query
    const [results] = await db.query(`
      SELECT employees.id, employees.first_name, 
      employees.last_name, roles.title, departments.name AS department, roles.salary, 
      CONCAT(managers.first_name, ' ', managers.last_name) AS manager
      FROM employees
      INNER JOIN roles ON employees.role_id = roles.id
      INNER JOIN departments ON roles.department_id = departments.id
      LEFT JOIN employees AS managers ON employees.manager_id = managers.id
    `);
    console.table(results);
    startApp();
  } 
  catch (err) {
    console.error('Error retrieving employees:', err);
  }
}
// adds a department to the company_db
async function addDepartment() {
  try {
    // prompts user to input data
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'departmentName',
        message: 'Enter the name of the department:',
        validate: (input) => {
          // validates input is not empty
          if (input.trim() !== '') {
            return true;
          } else {
            return 'Please enter a department name.';
          }
        },
      },
    ]);
    // gets user input
    const departmentName = answers.departmentName;
    // inserts new department name into table 
    await db.query('INSERT INTO departments (name) VALUES (?)', [departmentName]);
    console.log('Department added successfully.');
    startApp();
  } 
  catch (err) {
    console.error('Error adding department:', err);
  }
}
// adds a role to the company_db
async function addRole() {
  try {
    // retrieves all depts from company_db
    const departments = await db.query('SELECT * FROM departments');
    // creates list of selectable dept choices from table
    const departmentChoices = departments[0].map((department) => {
      return {
        name: department.name,
        value: department.id,
      };
    });
    // prompts user to input role title, role salary and department 
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'roleTitle',
        message: 'Enter the title of the role:',
        validate: (input) => {
          if (input.trim() !== '') {
            return true;
          } else {
            return 'Please enter a role title.';
          }
        },
      },
      {
        type: 'input',
        name: 'roleSalary',
        message: 'Enter the salary for the role:',
        validate: (input) => {
          if (input.trim() !== '' && !isNaN(input)) {
            return true;
          } else {
            return 'Please enter a valid salary.';
          }
        },
      },
      {
        type: 'list',
        name: 'roleDepartment',
        message: 'Select the department for the role:',
        choices: departmentChoices,
      },
    ]);
    // gets data from user answers 
    const { roleTitle, roleSalary, roleDepartment } = answers;
    // insert users answers into table
    await db.query('INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)', [
      roleTitle,
      roleSalary,
      roleDepartment,
    ]);
    console.log('Role added successfully.');
    startApp();
  } 
  catch (err) {
    console.error('Error adding role:', err);
  }
}
// adds an employee to the company_db
async function addEmployee() {
  try {
    const roles = await db.query('SELECT * FROM roles');
    const roleChoices = roles[0].map((role) => {
      return {
        name: role.title,
        value: role.id,
      };
    });
    const employees = await db.query('SELECT * FROM employees');
    const managerChoices = employees[0].map((employee) => {
      return {
        name: `${employee.first_name} ${employee.last_name}`,
        value: employee.id,
      };
    });
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'firstName',
        message: 'Enter the first name of the employee:',
        validate: (input) => {
          if (input.trim() !== '') {
            return true;
          } else {
            return 'Please enter the first name of the employee.';
          }
        },
      },
      {
        type: 'input',
        name: 'lastName',
        message: 'Enter the last name of the employee:',
        validate: (input) => {
          if (input.trim() !== '') {
            return true;
          } else {
            return 'Please enter the last name of the employee.';
          }
        },
      },
      {
        type: 'list',
        name: 'roleId',
        message: 'Select the role for the employee:',
        choices: roleChoices,
      },
      {
        type: 'list',
        name: 'managerId',
        message: 'Select the manager for the employee:',
        choices: managerChoices,
      },
    ]);
    const { firstName, lastName, roleId, managerId } = answers;
    await db.query(
      'INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)',
      [firstName, lastName, roleId, managerId]
    );
    console.log('Employee added successfully.');
    startApp();
  } 
  catch (err) {
    console.error('Error adding employee:', err);
  }
}
// updates employee data to company_db
async function updateEmployee() {
  try {
    const employees = await db.query('SELECT * FROM employees');
    const employeeChoices = employees[0].map((employee) => {
      return {
        name: `${employee.first_name} ${employee.last_name}`,
        value: employee.id,
      };
    });
    const roles = await db.query('SELECT * FROM roles');
    const roleChoices = roles[0].map((role) => {
      return {
        name: role.title,
        value: role.id,
      };
    });
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'employeeId',
        message: 'Select the employee to update:',
        choices: employeeChoices,
      },
      {
        type: 'list',
        name: 'roleId',
        message: 'Select the new role for the employee:',
        choices: roleChoices,
      },
    ]);
    const { employeeId, roleId } = answers;
    await db.query('UPDATE employees SET role_id = ? WHERE id = ?', [roleId, employeeId]);
    console.log('Employee updated successfully.');
    startApp();
  } 
  catch (err) {
    console.error('Error updating employee:', err);
  }
}
// deletes a chosen department from company_db
async function deleteDepartment() {
  try {
    // retrieves dept data and creates dept selection choices 
    const departments = await db.query('SELECT * FROM departments');
    const departmentChoices = departments[0].map((department) => {
      return {
        name: department.name,
        value: department.id,
      };
    });
    // prompts user to delete dept from list
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'departmentId',
        message: 'Select the department to delete:',
        choices: departmentChoices,
      },
    ])
    // takes user answer id and deletes dept data
    const { departmentId } = answers;
    await db.query('DELETE FROM roles WHERE department_id = ?', [departmentId]);
    await db.query('DELETE FROM departments WHERE id = ?', [departmentId]);
    console.log('Department deleted successfully.');
    startApp();
  } 
  catch (err) {
    console.error('Error deleting department:', err);
  }
}
// deletes a chosen role from company_db
async function deleteRole() {
  try {
    const roles = await db.query('SELECT * FROM roles');
    const roleChoices = roles[0].map((role) => {
      return {
        name: role.title,
        value: role.id,
      };
    });
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'roleId',
        message: 'Select the role to delete:',
        choices: roleChoices,
      },
    ]);
    const { roleId } = answers;
    await db.query('DELETE FROM roles WHERE id = ?', [roleId]);
    console.log('Role deleted successfully.');
    startApp();
  } 
  catch (err) {
    console.error('Error deleting role:', err);
  }
}
// deletes a chosen employee from company_db
async function deleteEmployee() {
  try {
    const employees = await db.query('SELECT * FROM employees');
    const employeeChoices = employees[0].map((employee) => {
      return {
        name: `${employee.first_name} ${employee.last_name}`,
        value: employee.id,
      };
    });
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'employeeId',
        message: 'Select the employee to delete:',
        choices: employeeChoices,
      },
    ]);
    const { employeeId } = answers;
    await db.query('DELETE FROM employees WHERE id = ?', [employeeId]);
    console.log('Employee deleted successfully.');
    startApp();
  } 
  catch (err) {
    console.error('Error deleting employee:', err);
  }
}
// exits user from prompts
function exitApp() {
  console.log('Exiting application.');
  process.exit();
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startApp();
});