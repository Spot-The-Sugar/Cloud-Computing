const { nanoid } = require("nanoid");
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "sts_dummy",
  password: "",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
  } else {
    console.log("Connected to the database");
  }
});

const registerUser = async (request, h) => {
  try {
    const { name, email, pass } = request.payload;
    const hashedPass = await bcrypt.hash(pass, 10);

    const query =
      "INSERT INTO table_user(user_name, user_email, user_pass) VALUES(?, ?, ?)";

    await new Promise((resolve, reject) => {
      db.query(query, [name, email, hashedPass], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    const response = h.response({
      status: "success",
      message: "User created successfully",
    });
    response.code(200);
    return response;
  } catch (err) {
    const response = h.response({
      status: "fail",
      message: err.message,
    });
    response.code(500);
    return response;
  }
};

const loginUser = async (request, h) => {
  const { email, pass } = request.payload;

  try {
    const query = "SELECT * FROM table_user WHERE user_email = ?";

    const user = await new Promise((resolve, reject) => {
      db.query(query, [email], (err, rows, field) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows[0]);
        }
      });
    });

    if (!user) {
      const response = h.response({
        status: "fail",
        message: "Account invalid",
      });
      response.code(400);
      return response;
    }

    const isPassValid = await bcrypt.compare(pass, user.user_pass);

    if (!isPassValid) {
      const response = h.response({
        status: "fail",
        message: "Account invalid",
      });
      response.code(400);
      return response;
    }

    const token = jwt.sign({ userId: user.user_id }, "secret_key");

    const response = h.response({
      status: "success",
      message: "login successful",
      data: { token },
    });
    response.code(200);
    return response;
  } catch (err) {
    const response = h.response({
      status: "fail",
      message: err.message,
    });
    response.code(500);
    return response;
  }
};

const getUser = async (request, h) => {
  try {
    const token = request.headers.authorization.replace("Bearer ", "");
    let decodedToken;

    try {
      decodedToken = jwt.verify(token, "secret_key");
    } catch (err) {
      const response = h.response({
        status: "missed",
        message: "User is not authorized!",
      });
      response.code(401);
      return response;
    }

    const userId = decodedToken.userId;

    const query = "SELECT * FROM table_user WHERE user_id = ?";

    const user = await new Promise((resolve, reject) => {
      db.query(query, [userId], (err, rows, field) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows[0]);
        }
      });
    });

    if (!user) {
      const response = h.response({
        status: "fail",
        message: "User is not found!",
      });
      response.code(400);
      return response;
    }

    const { user_pass, ...userData } = user;

    const response = h.response({
      status: "success",
      message: "read successful",
      data: userData,
    });
    response.code(200);
    return response;
  } catch (err) {
    const response = h.response({
      status: "fail",
      message: err.message,
    });
    response.code(500);
    return response;
  }
};

const updateUser = async (request, h) => {
  const { name, age, height, weight, limit } = request.payload;

  const token = request.headers.authorization.replace("Bearer ", "");
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, "secret_key");
  } catch (err) {
    const response = h.response({
      status: "missed",
      message: "User is not authorized!",
    });
    response.code(401);
    return response;
  }

  const userId = decodedToken.userId;

  try {
    const query =
      "UPDATE table_user SET user_name = ?, user_age = ?, user_height = ?, user_weight = ?, sugar_limit = ? WHERE user_id = ?";

    // will add userId later
    await new Promise((resolve, reject) => {
      db.query(
        query,
        [name, age, height, weight, limit, userId],
        (err, rows, field) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });

    const response = h.response({
      status: "success",
      message: "update successful",
    });
    response.code(200);
    return response;
  } catch (err) {
    const response = h.response({
      status: "fail",
      message: err.message,
    });
    response.code(500);
    return response;
  }
};

const getHistory = async (request, h) => {
  try {
    const token = request.headers.authorization.replace("Bearer ", "");
    let decodedToken;

    try {
      decodedToken = jwt.verify(token, "secret_key");
    } catch (err) {
      const response = h.response({
        status: "missed",
        message: "User is not authorized!",
      });
      response.code(401);
      return response;
    }

    const userId = decodedToken.userId;

    const query = "SELECT * FROM table_scan WHERE user_id = ?";

    const history = await new Promise((resolve, reject) => {
      db.query(query, [userId], (err, rows, field) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    if (history.length === 0) {
      const response = h.response({
        status: "success",
        message: "There is no current history",
      });
      response.code(200);
      return response;
    }

    const response = h.response({
      status: "success",
      message: "read successful",
      data: history,
    });
    response.code(200);
    return response;
  } catch (err) {
    const response = h.response({
      status: "fail",
      message: err.message,
    });
    response.code(500);
    return response;
  }
};

const getHistoryById = async (request, h) => {
  try {
    const token = request.headers.authorization.replace("Bearer ", "");
    let decodedToken;

    try {
      decodedToken = jwt.verify(token, "secret_key");
    } catch (err) {
      const response = h.response({
        status: "missed",
        message: "User is not authorized!",
      });
      response.code(401);
      return response;
    }

    const userId = decodedToken.userId;
    const scanId = request.params.scanId;

    const query = "SELECT * FROM table_scan WHERE user_id = ? AND scan_id = ?";

    const history = await new Promise((resolve, reject) => {
      db.query(query, [userId, scanId], (err, rows, field) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows[0]);
        }
      });
    });

    if (!history) {
      const response = h.response({
        status: "fail",
        message: "scanId not found",
      });
      response.code(403);
      return response;
    }

    const response = h.response({
      status: "success",
      message: "read successful",
      data: history,
    });
    response.code(200);
    return response;
  } catch (err) {
    const response = h.response({
      status: "fail",
      message: err.message,
    });
    response.code(500);
    return response;
  }
};

module.exports = { registerUser, loginUser, getUser, updateUser, getHistory, getHistoryById };
