# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh



All user except admin must be asked for approval first as per :
1. admin can access all collegeadmins, all professors, all alumni in user management and all students in student managemnet. 
2. college admin can access professors and alumni of same department in user management and students of same department in student management. 
3. professor can access alumni of same department and same branch in user management and students of same department and same branch in student management 