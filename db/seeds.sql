-- seeds.sql
INSERT INTO departments (name) VALUES
  ('Development'),
  ('Design'),
  ('Quality Assurance'),
  ('Project Management');


INSERT INTO roles (title, salary, department_id) VALUES
  ('Software Engineer', 80000, 1),
  ('Front-end Developer', 70000, 1),
  ('Back-end Developer', 75000, 1),
  ('UI/UX Designer', 60000, 2),
  ('Graphic Designer', 55000, 2),
  ('QA Engineer', 65000, 3),
  ('Project Manager', 90000, 4);

INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES
  ('Rick', 'Sanchez', 1, NULL),
  ('Morty', 'Smith', 2, 1),
  ('Mr', 'Meeseeks', 3, 2),
  ('Bird', 'Person', 4, 2),
  ('Scary', 'Terry', 5, 1),
  ('Gear', 'Head', 6, 5),
  ('Sleepy', 'Gary', 6, 5),
  ('Pickle', 'Rick', 6, 5);