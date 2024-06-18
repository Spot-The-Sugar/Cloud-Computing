const { nanoid } = require("nanoid");
// const mysql = require("mysql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mysql = require('promise-mysql');

const createUnixSocketPool = async config => {
  return mysql.createPool({
    user: process.env.DB_USER, // e.g. 'my-db-user'
    password: process.env.DB_PASS, // e.g. 'my-db-password'
    database: process.env.DB_NAME, // e.g. 'my-database'
    socketPath: process.env.INSTANCE_UNIX_SOCKET, // e.g. '/cloudsql/project:region:instance'
  });
};

let pool;
(async () => {
    pool = await createUnixSocketPool();
})();


const registerUser = async (request, h) => {
  try {
    const { name, email, pass } = request.payload;
    const hashedPass = await bcrypt.hash(pass, 10);

    const query =
      "INSERT INTO table_user(user_name, user_email, user_pass) VALUES(?, ?, ?)";

    await pool.query(query, [name, email, hashedPass]);

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

    const users = await pool.query(query, [email]);
    const user = users[0];

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
    const { user_pass, ...userData } = user;

    const response = h.response({
      status: "success",
      message: "login successful",
      data: { token, userData },
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

    const users = await pool.query(query, [userId]);
    const user = users[0];

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
    const query = "UPDATE table_user SET user_name = ?, user_age = ?, user_height = ?, user_weight = ?, sugar_limit = ? WHERE user_id = ?";

    await pool.query(query, [name, age, height, weight, limit, userId]);

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

    const query = "SELECT * FROM table_scan INNER JOIN table_product ON table_scan.product_id=table_product.product_id WHERE user_id = ?";

    const history = await pool.query(query, [userId]);

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

    const query = "SELECT * FROM table_scan INNER JOIN table_product ON table_scan.product_id=table_product.product_id WHERE user_id = ? AND scan_id = ?";

    const history = await pool.query(query, [userId, scanId]);

    if (history === 0) {
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

const getGradeById = async (request, h) => {
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
    const gradeId = request.params.gradeId;

    const query = "SELECT * FROM table_grade WHERE grade_id = ?";

    const grades = await pool.query(query, [gradeId]);
    const grade = grades[0];

    if (!grade) {
      const response = h.response({
        status: "fail",
        message: "gradeId not found",
      });
      response.code(403);
      return response;
    }

    const response = h.response({
      status: "success",
      message: "read successful",
      data: grade,
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

const consumeProduct = async (request, h) => {
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
  const currentDate = new Date().toISOString().split('T')[0];

  const { consumeSugar } = request.payload;

  try {
    const query = "SELECT * FROM table_consume WHERE user_id = ?";
    const query2 = "INSERT INTO table_consume(consume_sugar, consume_date, user_id) VALUES(?, ?, ?)";
    const query3 = "UPDATE table_consume SET consume_sugar = ?, consume_date = ? WHERE user_id = ?";

    const checkConsume = await pool.query(query, [userId]);
    const consumeRecord = checkConsume[0];

    if (!consumeRecord) {
      await pool.query(query2, [consumeSugar, currentDate, userId]);

      const response = h.response({
        status: "success",
        message: "insert successful",
      });
      response.code(200);
      return response;
    }

    const currentConsume = parseFloat(consumeRecord.consume_sugar);
    const newConsume = parseFloat(consumeSugar) + currentConsume;

    if (checkConsume) {
      await pool.query(query3, [newConsume, currentDate, userId]);
    }

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

const getSugarConsume = async (request, h) => {
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

    const query = "SELECT u.user_name, u.sugar_limit, c.consume_sugar, c.consume_date FROM table_user u JOIN table_consume c ON u.user_id = c.user_id WHERE u.user_id = ?";

    const trackers = await pool.query(query, [userId]);
    const tracker = trackers[0];

    if (!tracker) {
      const response = h.response({
        status: "fail",
        message: "Data not found!",
      });
      response.code(400);
      return response;
    }
    
    const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    const consumeDate = new Date(tracker.consume_date).toISOString().split('T')[0];

    if (currentDate !== consumeDate) {
      // If the dates differ, reset consume_sugar to 0
      const resetQuery = "UPDATE table_consume SET consume_sugar = 0, consume_date = ? WHERE user_id = ?";

      await pool.query(resetQuery, [currentDate, userId]);

      tracker.consume_sugar = 0; // Update the local tracker object to reflect the reset
      tracker.consume_date = currentDate; // Update the local tracker object to reflect the new date
    }

    const response = h.response({
      status: "success",
      message: "read successful",
      data: tracker,
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

module.exports = { registerUser, loginUser, getUser, updateUser, getHistory, getHistoryById, getGradeById, consumeProduct, getSugarConsume };
