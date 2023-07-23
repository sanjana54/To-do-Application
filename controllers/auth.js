const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
let uemail;

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});

exports.register = (req, res) => {
  console.log(req.body);

  //const name = req.body.name;
  //const email = req.body.email;
  //const password = req.body.password;
  //const passwordConfirm = req.body.passwordConfirm;

  const { name, email, password, passwordConfirm } = req.body;

  db.query(
    "SELECT email FROM users WHERE email = ?",
    [email],
    async (error, results) => {
      if (error) {
        console.log(error);
      }

      if (results.length > 0) {
        return res.render("register", {
          message: "This email is already in use",
        });
      } else if (password !== passwordConfirm) {
        return res.render("register", {
          message: "Passwords do not match!",
        });
      }

      let hashedPassword = await bcrypt.hash(password, 8);
      console.log(hashedPassword);

      db.query("INSERT INTO users SET ?",{ name: name, email: email, password: hashedPassword },(error, results) => {
        if (error) {
            console.log(error);
        } else {
            console.log(results);
            return res.render("register", {
                message: "User registered!",
            });
        }
        });
    });

    //res.send("testing");
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  
  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (error, results) => {
      if (error) {
        console.log(error);
      }

      if (results.length === 0) {
        return res.render("login", {
          message: "Invalid email or password",
        });
      }

      const user = results[0];
      const isPasswordMatch = await bcrypt.compare(password, user.password);

      if (!isPasswordMatch) {
        return res.render("login", {
          message: "Invalid email or password",
        });
      }

      // Generate a JSON Web Token (JWT) for authentication
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      // Store the token in a cookie
      res.cookie("jwt", token, {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
        httpOnly: true,
        signed: true,
      });

      req.session.user = {
        id: results[0].id,
        email: results[0].email,
        // Add any other relevant user data to the session object
      };

      uemail = email;
      console.log("uuuuu" + email);
      res.redirect("/home");
    }
  );


};

/*router.get("/home", (req, res) => {
  if (req.session && req.session.user) {
    res.render("home");
  } else {
    res.redirect("/login");
  }
});
*/

exports.view = (req, res) => {

  if (req.session && req.session.user) {
    db.query('SELECT * FROM task_table WHERE email = ?',[uemail], (err, rows) => {
      // When done with the connection, release it
      if (!err) {
        console.log('abar dekhi  '+ uemail)
        res.render('home', { rows});
      } else {
        console.log(err);
      }
      console.log('The data from task table: \n', rows);
    });
  
  }

  else {
    res.redirect("/login");
  }
 
}



exports.form = (req, res) => {
  res.render('add_task');
  console.log("form er time e -> " + uemail);
}


exports.create = (req, res) => {
  //res.render('add_task');
  const { task, task_detail, date } = req.body;
  //const uemail = req.session.email;
  // User the connection
  console.log('add korar time e mail -> ' + uemail);
  db.query("INSERT INTO task_table SET ?", {task: task, task_details: task_detail, date_added: date, email: uemail }, (err, rows) => {
    if (!err) {
      res.render('add_task', {  alert: 'User added successfully.' });
    } else {
      console.log(err);
    }
    console.log('The data from task  table: \n', rows);
  });
}


exports.edit = (req, res) => {
  //res.render('edit_task');
  
  db.query('SELECT * FROM task_table WHERE Id = ?', [req.params.Id], (err, rows) => {
    // When done with the connection, release it
    if (!err) {
      res.render('edit_task', { rows});
    } else {
      console.log(err);
    }
    console.log('The data from task table: \n', rows);
  });

}


exports.update = (req, res) => {
  
  const { task, task_detail, date } = req.body;
  // User the connection
  
  db.query('UPDATE task_table SET task = ?, task_details = ?, date_added = ? WHERE Id = ?', [task, task_detail, date, req.params.Id], (err, rows) => {
    // When done with the connection, release it
    if (!err) {
      //res.render('edit_task', { rows});
      db.query('SELECT * FROM task_table WHERE Id = ?', [req.params.Id], (err, rows) => {
        // When done with the connection, release it
        if (!err) {
          res.render('edit_task', { rows, alert: `${task} has been updated.` });
        } else {
          console.log(err);
        }
        console.log('The data from task table: \n', rows);
      });

    } else {
      console.log(err);
    }
    console.log('The data from task table: \n', rows);
  });

}


exports.delete = (req, res) => {
  //res.render('edit_task');
  
  db.query('DELETE FROM task_table WHERE Id = ?', [req.params.Id], (err, rows) => {
    // When done with the connection, release it
    if (!err) {
      res.redirect('/');
    } else {
      console.log(err);
    }
    console.log('The data from task table: \n', rows);
  });

}


exports.viewall = (req, res) => {
  db.query('SELECT * FROM task_table WHERE Id = ?', [req.params.Id], (err, rows) => {
      // When done with the connection, release it
      if (!err) {
        res.render('view_task', { rows});
      } else {
        console.log(err);
      }
      console.log('The data from task table: \n', rows);
    });
  
}
