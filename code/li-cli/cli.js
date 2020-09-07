#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const ejs = require('ejs');

inquirer.prompt([
  {
    type: 'input',
    name: 'name',
    message: 'please input name',
    default: 'my-project'
  },
  {
    type: 'input',
    name: 'desc',
    message: 'message'
  }
])
  .then(answer => {
    const temDir = path.join(__dirname, 'templates');

    const destDir = process.cwd();

    fs.readdir(temDir, (err, files) => {
      if (err) {
        throw err;
      }

      files.forEach(file => {
        ejs.renderFile(
          path.join(temDir, file),
          answer,
          (err, result) => {
            if (err) {
              throw err;
            }

            const fileName = path.join(temDir, file);
            fs.stat(fileName, (err, stats) => {
              if (err) {
                throw err
              }

              if (stats.isDirectory()) {

              } else {

                fs.writeFileSync(path.join(destDir, file), result);
              }
            })
          })
      })
    })
  })