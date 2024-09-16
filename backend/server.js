const express = require("express");
const { Pool } = require("pg");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Jimp = require('jimp');
const jwt = require("jsonwebtoken");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors"); // Assuming you're using the 'cors' package for Express
const JSZip = require("jszip");
const util = require("util");
const Groq = require('groq-sdk');
const { OpenAI } = require("openai");
// Create a new express application
const app = express();
const server = http.createServer(app);
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

function loadEnvVariables() {
  // Adjust if your .env file is located elsewhere. Using __dirname ensures it looks in the same directory as your server.js file.
  const envPath = path.join(__dirname, ".env");

  try {
    const data = fs.readFileSync(envPath, "utf-8");

    // Split the data on new line, compatible with both UNIX and Windows environments
    const envVariables = data.split(/\r?\n/);

    envVariables.forEach((variable) => {
      if (!variable.trim() || variable.startsWith("#")) return; // Skip empty lines and comments

      const [key, value] = variable.split("=");
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    });
  } catch (error) {
    console.error("Error loading .env variables:", error);
  }
}

// Call the function at the start of your application
loadEnvVariables();

const JWT_SECRET = process.env.LG_TOKEN;
const allowedOrigins = [
  "http://localhost:3002/",
  `http://${process.env.HOST}:${process.env.PORTFORAPP}`,
  `http://${process.env.HOST}:${process.env.PROXYPORT}`,
  'https://sage-twilight-26e49d.netlify.app', // Netlify URL
  'https://main--sage-twilight-26e49d.netlify.app', // Netlify branch URL
  'https://coconut-speckled-asterisk.glitch.me', // Glitch URL
  'https://connectedengager.eu-4.evennode.com',
  'https://connectedengager.com',
  'https://api.connectedengager.com'

];

const corsOptions = {
  origin: (origin, callback) => {
    console.log('Origin:', origin); // Log the origin for debugging
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Handle pre-flight requests for all routes
app.options('*', cors(corsOptions));

// Logging middleware for debugging
app.use((req, res, next) => {
  console.log('Incoming Request:', req.method, req.url);
  console.log('Request Origin:', req.headers.origin);
  
  next();
});

/**
 ,
  transports: process.env.NODE_ENV === 'development' ? ["polling"] : ["websocket", "polling"], // Only use polling locally, enable websocket in production

 */
// Socket.io configuration
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }
});
//const io = socketIo(server, {
const transporter = nodemailer.createTransport({
  service: process.env.RESET_EMAIL_PROVIDER, // Example using Gmail
  auth: {
    user: process.env.RESET_EMAIL,
    pass: `${process.env.RESET_EMAIL_CODE_1} ${process.env.RESET_EMAIL_CODE_2} ${process.env.RESET_EMAIL_CODE_3} ${process.env.RESET_EMAIL_CODE_4}`
  },
  tls: {
    rejectUnauthorized: false,
  },
});
app.use(express.json());
// Serve static files from the 'backend/imageUploaded' directory
const isLocal = process.env.NODE_ENV === 'development';

if (isLocal) {
  // Local environment configuration
  app.use(
    "/uploaded-images",
    express.static(path.join(__dirname, "imageUploaded"))
  );
} else {
  // Remote environment configuration
  app.use('/uploaded-images', (req, res, next) => {
    //console.log('Serving static file:', req.path);
    next();
  }, express.static(path.join(__dirname, 'backend/imageUploaded')));
}
// PostgreSQL connection configuration
const pool = new Pool({
  user: process.env.CONNECTION_POOL_USER,
  host: process.env.CONNECTION_POOL_HOST,
  database: process.env.CONNECTION_POOL_DATABASE,
  password: process.env.CONNECTION_POOL_PASSWORD,
  port: process.env.CONNECTION_POOL_PORT
});
const groq = new Groq({ apiKey: process.env.ADMIN_AI_KEY_1 });
const openaiAPIKey = process.env.ADMIN_AI_KEY_2;
function handleDatabaseError(error, res) {
  // Your error handling logic
  console.error("Database error:", error);
  res.status(500).send({ message: "An error occurred." });
}
// Verify database connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error("Error acquiring client", err.stack);
  }

  client.query("SELECT current_user;", (err, result) => {
    release();
    if (err) {
      return console.error("Error executing query", err.stack);
    }
  });
});

const clientSubmissions = {}; // { socketId: { userId: Number, submissionIds: Set(Number) } }
const activeUsersPerSubmission = {};

io.on("connection", (socket) => {
  console.log(`User connected with socket ID: ${socket.id}`);
  socket.on("postDeleted", ({ postId, submissionId }) => {
    //console.log(`Post deleted with ID: ${postId} in submission: ${submissionId}`);
    io.to(`submission-${submissionId}`).emit("postDeleted", { postId });
  });
  socket.on("register", ({ userId, submissionIds }) => {
    console.log(`User registered: ${userId} with socket ID: ${socket.id}`);
    if (!clientSubmissions[socket.id]) {
      clientSubmissions[socket.id] = {
        userId,
        activeUsers: new Set(),
        submissionIds: new Set(submissionIds),
      };
    }
    clientSubmissions[socket.id].activeUsers.add(userId);
  });

  socket.on("enter screen", ({ userId, submissionId }) => {
    //console.log(`User ${userId} entered screen for submission ${submissionId}`);
    socket.join(`submission-${submissionId}`);

    if (!activeUsersPerSubmission[submissionId]) {
      activeUsersPerSubmission[submissionId] = new Set();
    }
    activeUsersPerSubmission[submissionId].add(userId);

    io.to(`submission-${submissionId}`).emit(
      "active users update",
      Array.from(activeUsersPerSubmission[submissionId])
    );
  });

  socket.on("leave screen", ({ userId, submissionId }) => {
    //console.log(`User ${userId} left screen for submission ${submissionId}`);
    if (activeUsersPerSubmission[submissionId]) {
      activeUsersPerSubmission[submissionId].delete(userId);
      io.to(`submission-${submissionId}`).emit(
        "active users update",
        Array.from(activeUsersPerSubmission[submissionId])
      );
    }

    socket.leave(`submission-${submissionId}`);
  });

  socket.on("callUser", ({ userToCall, signalData, from }) => {
    console.log(`User ${from} calling user ${userToCall}`);
    console.log("Current clientSubmissions:", clientSubmissions);
    const recipientSocketId = Object.keys(clientSubmissions).find(
      (socketId) => clientSubmissions[socketId].userId === userToCall
    );

    if (recipientSocketId) {
      io.to(recipientSocketId).emit("incomingCall", {
        from,
        signal: signalData,
      });
      console.log(`Calling user ${userToCall} from ${from}`);
    } else {
      console.log(`User to call not found: ${userToCall}`);
    }
  });

  socket.on("acceptCall", ({ signal, to }) => {
    //console.log(`User accepted call from ${to}`);
    const callerSocketId = Object.keys(clientSubmissions).find(
      (socketId) => clientSubmissions[socketId].userId === to
    );

    if (callerSocketId) {
      io.to(callerSocketId).emit("callAccepted", signal);
      //console.log(`Call accepted by ${to}`);
    } else {
      console.log(`Caller not found for ${to}`);
    }
  });
  socket.on("error", (err) => {
    console.error(`Socket.io Error: ${err}`);
  });
  socket.on("disconnect", () => {
    console.log(`User disconnected with socket ID: ${socket.id}`);
    //console.log(`Socket disconnected: ${socket.id}`);
    if (clientSubmissions[socket.id]) {
      const { userId, submissionIds } = clientSubmissions[socket.id];
      submissionIds.forEach((submissionId) => {
        if (activeUsersPerSubmission[submissionId]) {
          activeUsersPerSubmission[submissionId].delete(userId);
          io.to(`submission-${submissionId}`).emit(
            "active users update",
            Array.from(activeUsersPerSubmission[submissionId])
          );
        }
      });
      delete clientSubmissions[socket.id];
    }
  });
});

// Set up storage location and file naming
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "backend/imageUploaded"); // Your directory path
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });

app.get('/test-image', (req, res) => {
  res.sendFile(path.join(__dirname, 'backend/imageUploaded/file-1719702423262.JPEG'));
});
// Define a test route
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error while testing database");
  }
});
function listDirectoryContents(directoryPath) {
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error(`Error listing directory contents: ${err.message}`);
    } else {
      console.log(`Contents of ${directoryPath}:`);
      files.forEach(file => {
        console.log(file);
      });
    }
  });
}
//999
function adminFace(gender, orientation){
  if (orientation === "Heterosexual") {
    return gender === "Female" ? "Male" : "Female";
  } else if (orientation === "Lesbian") {
    return "Female";
  } else if (orientation === "Homosexual") {
    return gender === "Female" ? "Female" : "Male";
  }
  return "Man"; // Default fallback
};
const handleFilterUsers = async (userId, sexpref) => {
  try {
    const queryConditions = ["sex = $1"];
    const queryParams = [sexpref];

    const query = `
      SELECT id, username, email, sexual_orientation, hobbies, floats_my_boat, sex, about_you 
      FROM users 
      WHERE ${queryConditions.join(" AND ")}
      ORDER BY id DESC
      LIMIT 5
    `;

    // Fetch filtered users based on criteria
    const filteredUsers = await pool.query(query, queryParams);

    // Delete existing connection requests for the user
    const deleteQuery = `
      DELETE FROM connection_requests WHERE requester_id = $1
    `;
    await pool.query(deleteQuery, [userId]);

    // Populate connection_requests for each filtered user
    if (filteredUsers.rows.length > 0) {
      const insertQuery = `
        INSERT INTO connection_requests (requester_id, requested_id, status)
        SELECT $1, id, 'pending' 
        FROM unnest($2::int[]) AS id
        WHERE id != $1 AND NOT EXISTS (
          SELECT 1 FROM connection_requests WHERE requester_id = $1 AND requested_id = id
        )
      `;
      await pool.query(insertQuery, [
        userId,
        filteredUsers.rows.map((user) => user.id),
      ]);
    }

    return {
      success: true,
      message: "Connection requests sent.",
      filteredUsers: filteredUsers.rows,
    };
  } catch (error) {
    console.error("Error in handleFilterUsers:", error);
    throw new Error("Failed to filter users.");
  }
};


app.get("/api/authorised/:userId", async (req, res) => {
  let tokenMatches = false;
  let token = "";
  const authHeader = req.headers.authorization;
  const userId = req.params.userId;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // If not, respond with 401 Unauthorized and a message
    return res
      .status(401)
      .json({ error: "Unauthorized: Missing or invalid Authorization header" });
  }
  if (authHeader && authHeader.startsWith("Bearer ")) {
    // Extract the token from the Authorization header
    token = authHeader.substring(7, authHeader.length);
  }

  try {
    // Query the users table for the user with the given userId
    const queryResult = await pool.query(
      "SELECT token FROM users WHERE id = $1",
      [userId]
    );

    if (queryResult.rows.length > 0) {
      const userToken = queryResult.rows[0].token;

      // Check if the token from the database matches the token provided in the request
      tokenMatches = userToken === token;
    }
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Internal server error" });
  }

  res.json(tokenMatches);
});
// Login route

app.post("/api/login", async (req, res) => {
  //console.log("Login request received:", req.body);
  try {
    const { username, password } = req.body;
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (result.rows.length > 0) {
      const user = result.rows[0];

      const match = await bcrypt.compare(password, user.password);
      if (match) {
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
          expiresIn: "1h",
        }); // Adjust expiresIn as needed
        await pool.query("UPDATE users SET token = $1 WHERE id = $2", [
          token,
          user.id,
        ]);

        // Include userId in the response
        res.json({
          success: true,
          message: "Login successful.",
          userId: user.id,
          token: token,
        });
      } else {
        res
          .status(401)
          .json({ success: false, message: "Invalid credentials." });
      }
    } else {
      res.status(404).json({ success: false, message: "User not found." });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send({ message: "An error occurred." });
  }
});

async function processZipFile(
  zipFilePath,
  userId,
  originalFileName,
  zipData = null,
  removeZip = true
) {
  let data;
  if (zipData) {
    data = zipData;
  } else {
    data = fs.readFileSync(zipFilePath);
  }
  const zip = await JSZip.loadAsync(data);
  const zipFiles = Object.keys(zip.files);
  let jsonFileCount = 0;
  let isValid = true;
  let imageFileCount = 0;
  let interactionData;
  const mediaFiles = [];

  zipFiles.forEach((filename) => {
    if (filename.endsWith(".json")) {
      jsonFileCount++;
    } else if (filename.match(/\.(jpg|jpeg|png)$/i)) {
      imageFileCount++;
    } else {
      isValid = false;
    }
  });

  if (jsonFileCount !== 1) {
    isValid = false; // There must be exactly one JSON file
  }

  if (!isValid) {
    throw new Error(
      "ZIP archive contents are invalid. It should contain exactly one JSON file and any number of image files."
    );
  }

  // Process valid ZIP contents here
  for (const [filename, fileData] of Object.entries(zip.files)) {
    if (filename.endsWith(".json")) {
      const content = await fileData.async("string");
      interactionData = JSON.parse(content);
    } else {
      // Prepare for saving media files later
      const mediaData = await fileData.async("nodebuffer");
      mediaFiles.push({ filename, mediaData });
    }
  }

  if (!interactionData) {
    throw new Error("No JSON file found in the ZIP archive.");
  }

  // Derive the interaction title from the original file name
  const interactionTitle = originalFileName
    .replace(/_/g, " ")
    .replace(".zip", "");

  // Insert the interaction title and userId into the database
  const submissionResult = await pool.query(
    "INSERT INTO user_submissions (user_id, title) VALUES ($1, $2) RETURNING id",
    [userId, interactionTitle]
  );
  const submissionId = submissionResult.rows[0].id;
  //console.log("submissionId:", submissionId);
  // Save media files to the server and update interactionData with new paths
  for (const { filename, mediaData } of mediaFiles) {
    const sanitizedFilename = filename.replace("uploaded-images\\", "");
    const fullPath = path.join(__dirname, "imageUploaded", sanitizedFilename);
    const relativePath = `/uploaded-images/${sanitizedFilename}`;
    // Ensure the directory exists
    await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });

    // Save the media file
    await fs.promises.writeFile(fullPath, mediaData);

    // Update interactionData entries with the new file path
    interactionData = interactionData.map((entry) => {
      if (entry.uploaded_path && entry.uploaded_path.includes(filename)) {
        return { ...entry, uploaded_path: relativePath }; // Ensures the use of relativePath
      }
      return entry;
    });
  }

  const uniqueUserIds = [
    ...new Set(interactionData.map((entry) => entry.posting_user_id)),
  ];

  // Insert unique posting_user_ids into submission_members
  for (const postingUserId of uniqueUserIds) {
    await pool.query(
      "INSERT INTO submission_members (submission_id, participating_user_id) VALUES ($1, $2)",
      [submissionId, postingUserId]
    );
  }

  // Insert interaction data into the database
  for (const entry of interactionData) {
    await pool.query(
      "INSERT INTO submission_dialog (submission_id, posting_user_id, text_content, uploaded_path, created_at) VALUES ($1, $2, $3, $4, $5)",
      [
        submissionId,
        entry.posting_user_id,
        entry.content,
        entry.uploaded_path,
        entry.created_at,
      ]
    );
  }

  // Cleanup: Remove the uploaded ZIP file after processing
  if (removeZip) {
    await util.promisify(fs.unlink)(zipFilePath);
  }
  // Return a JSON response indicating success
  return {
    message: `Successfully processed ZIP file with ${jsonFileCount} JSON file and ${imageFileCount} image files.`,
    submissionId: submissionId,
  };
}

app.post("/api/register", async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      username,
      email,
      password,
      hobby,
      sexualOrientation,
      floatsMyBoat,
      sex,
      aboutYou,
      aboutMyBotPal,
      admin_face, // New field from the frontend
      worldX, // New field for the X coordinate
      worldY  // New field for the Y coordinate
    } = req.body;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await client.query("BEGIN"); // Start transaction
    
    // Insert the new User along with worldX and worldY coordinates
    const userInsertResult = await client.query(
      `INSERT INTO users 
        (username, email, password, hobbies, sexual_orientation, floats_my_boat, sex, about_you, about_my_bot_pal, admin_face, worldX, worldY) 
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
      RETURNING id`,
      [
        username,
        email,
        hashedPassword,
        hobby,
        sexualOrientation,
        floatsMyBoat,
        sex,
        aboutYou,
        aboutMyBotPal,
        admin_face, // Save the admin_face value to the database
        worldX,     // Save the X coordinate
        worldY      // Save the Y coordinate
      ]
    );
    
    const newUserId = userInsertResult.rows[0].id;
    
    // Extract the admin's ID
    const existingAdminId = parseInt(process.env.SYSTEM_ADMIN_ID);
    const [userOneId, userTwoId] =
      newUserId < existingAdminId
        ? [newUserId, existingAdminId]
        : [existingAdminId, newUserId];

    // Insert the connection record
    await client.query(
      "INSERT INTO connections (user_one_id, user_two_id) VALUES ($1, $2)",
      [userOneId, userTwoId]
    );

    await client.query("COMMIT");

    // Insert welcome submission for the new user by the admin
    const submissionInsertResult = await client.query(
      "INSERT INTO user_submissions (user_id, title) VALUES ($1, $2) RETURNING id",
      [existingAdminId, `Welcome ${username}`]
    );
    const submissionId = submissionInsertResult.rows[0].id;

    // Insert new admin and new user as participants in the submission
    await client.query(
      "INSERT INTO submission_members (submission_id, participating_user_id) VALUES ($1, $2)",
      [submissionId, existingAdminId]
    );

    await client.query(
      "INSERT INTO submission_members (submission_id, participating_user_id) VALUES ($1, $2)",
      [submissionId, newUserId]
    );
    
    await client.query(
      "INSERT INTO submission_dialog (submission_id, posting_user_id, text_content) VALUES ($1, $2, $3)",
      [submissionId, existingAdminId, process.env.ADMIN_MESSAGE_1]
    );
    
    // Send connection requests based on user preferences
    const sexpref = adminFace(sex, sexualOrientation);
    await handleFilterUsers(newUserId, sexpref);

    // Send the response to the client
    res.json({ id: newUserId, username: username });
  } catch (error) {
    await client.query("ROLLBACK"); // Roll back the transaction on error
    if (error.code === "23505") {
      // Unique constraint violation
      res.status(409).send("Email already exists");
    } else {
      res.status(500).send("An error occurred during registration.");
    }
  } finally {
    client.release(); // Release the client back to the pool
  }
});



app.put("/api/update_profile/:id", async (req, res) => {
  const { id } = req.params;
  let {
    username,
    email,
    password,
    hobby,
    sexualOrientation,
    floatsMyBoat,
    sex,
    aboutYou,
    aboutMyBotPal,
    admin_face,
    worldX,  // Add worldX to the request body
    worldY   // Add worldY to the request body
  } = req.body;

  // Validation for password length if it's not empty
  if (password && password.trim().length < 8) {
    return res.status(400).send("Password must be at least 8 characters long");
  }

  // Optionally, hash the new password before storing it
  const saltRounds = 10;
  const hashedPassword = password
    ? await bcrypt.hash(password, saltRounds)
    : undefined;

  // Substitute empty strings with specified default values for enum fields
  sexualOrientation = sexualOrientation === "" ? "Undisclosed" : sexualOrientation;
  hobby = hobby === "" ? "Other" : hobby;
  floatsMyBoat = floatsMyBoat === "" ? "Other (Not Listed)" : floatsMyBoat;

  const updateQuery = `
    UPDATE users SET
    username = COALESCE($1, username),
    email = COALESCE($2, email),
    password = COALESCE($3, password),
    hobbies = COALESCE($4, hobbies),
    sexual_orientation = COALESCE($5, sexual_orientation),
    floats_my_boat = COALESCE($6, floats_my_boat),
    sex = COALESCE($7, sex),
    about_you = COALESCE($8, about_you),
    about_my_bot_pal = COALESCE($9, about_my_bot_pal),
    admin_face = COALESCE($10, admin_face),
    worldX = COALESCE($11, worldX),  -- Include worldX
    worldY = COALESCE($12, worldY)   -- Include worldY
    WHERE id = $13
    RETURNING *;
  `;

  const values = [
    username,
    email,
    hashedPassword ? hashedPassword : null,
    hobby,
    sexualOrientation,
    floatsMyBoat,
    sex,
    aboutYou,
    aboutMyBotPal,
    admin_face,
    worldX,  // Include the value for worldX
    worldY,  // Include the value for worldY
    id,
  ];

  try {
    const result = await pool.query(updateQuery, values);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).send("Failed to update profile");
  }
});


//999
app.post("/api/filter-users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      username,
      sexualOrientation,
      hobbies,
      floatsMyBoat,
      sex,
      aboutYou,
    } = req.body;

    // Initialize the query parts
    let queryConditions = [];
    let queryParams = [];
    let paramCounter = 1;

    // Dynamically build query conditions and parameters
    if (username) {
      queryConditions.push(`username ILIKE '%' || $${paramCounter++} || '%'`);
      queryParams.push(username);
    }
    if (sexualOrientation) {
      queryConditions.push(`sexual_orientation = $${paramCounter++}`);
      queryParams.push(sexualOrientation);
    }
    if (hobbies) {
      queryConditions.push(`hobbies = $${paramCounter++}`);
      queryParams.push(hobbies);
    }
    if (floatsMyBoat) {
      queryConditions.push(`floats_my_boat = $${paramCounter++}`);
      queryParams.push(floatsMyBoat);
    }
    if (sex) {
      queryConditions.push(`sex = $${paramCounter++}`);
      queryParams.push(sex);
    }
    if (aboutYou) {
      queryConditions.push(`about_you ILIKE '%' || $${paramCounter++} || '%'`);
      queryParams.push(aboutYou);
    }
console.log("filter-users-queryConditions",queryConditions)
    let query = `
      SELECT id, username, email, sexual_orientation, hobbies, floats_my_boat, sex, about_you 
      FROM users 
      WHERE ${
        queryConditions.length > 0 ? queryConditions.join(" AND ") : "1=1"
      }
    `;

    // Fetch filtered users based on criteria
    const filteredUsers = await pool.query(query, queryParams);
    // Delete existing connection requests for the user
    const deleteQuery = `
      DELETE FROM connection_requests WHERE requester_id = $1
    `;
    await pool.query(deleteQuery, [userId]);
    // Populate connection_requests for each filtered user
    if (filteredUsers.rows.length > 0) {
      const insertQuery = `
        INSERT INTO connection_requests (requester_id, requested_id, status)
        SELECT $1, id, 'pending' 
        FROM unnest($2::int[]) AS id
        WHERE id != $1 AND NOT EXISTS (
          SELECT 1 FROM connection_requests WHERE requester_id = $1 AND requested_id = id
        )
      `;
      await pool.query(insertQuery, [
        userId,
        filteredUsers.rows.map((user) => user.id),
      ]);
    }

    res.json({
      success: true,
      message: "Connection requests sent.",
      filteredUsers: filteredUsers.rows,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ message: "An error occurred.", error: error.message });
  }
});

app.get("/api/connection-requests/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // SQL query to join connection_requests and users tables
    const query = `
      SELECT cr.id, cr.requester_id, cr.requested_id, cr.status, cr.created_at, cr.updated_at,
             u.username, u.email, u.profile_picture, u.sexual_orientation, u.hobbies, u.floats_my_boat, u.sex, u.about_you
      FROM connection_requests cr
      JOIN users u ON cr.requested_id = u.id
      WHERE cr.requester_id = $1
    `;

    const { rows } = await pool.query(query, [userId]);

    res.json(rows);
  } catch (error) {
    console.error("Error fetching connection requests:", error);
    res.status(500).send({
      message: "An error occurred while fetching connection requests.",
    });
  }
});
app.get("/api/connection-requested/:userId", async (req, res) => {
  const { userId } = req.params; // Extract userId from the request URL

  // SQL query to fetch details of connection requests aimed at the specified user
  const query = `
    SELECT 
      cr.id AS request_id, 
      cr.requester_id, 
      cr.requested_id, 
      cr.status, 
      cr.created_at, 
      cr.updated_at,
      u.id, 
      u.username, 
      u.profile_picture, 
      u.sexual_orientation, 
      u.hobbies, 
      u.floats_my_boat, 
      u.sex,
      u.about_you
    FROM 
      connection_requests AS cr
    JOIN 
      users AS u ON cr.requester_id = u.id
    WHERE 
      cr.requested_id = $1;
  `;

  try {
    // Execute the query with the userId provided in the URL
    const { rows } = await pool.query(query, [userId]);

    // Send the result back to the client
    res.json(rows);
  } catch (error) {
    console.error("Error fetching connection requests:", error);
    res
      .status(500)
      .send("An error occurred while fetching connection requests.");
  }
});
app.post("/api/enable-selected-connections/:loggedInUserId", async (req, res) => {
  const { loggedInUserId } = req.params;
  const { selectedUserIds } = req.body;

  try {
    await pool.query("BEGIN");

    for (const requestedId of selectedUserIds) {
      const requesterIdInt = parseInt(requestedId, 10);
      const requestedIdInt = parseInt(loggedInUserId, 10);

      await pool.query(
        `DELETE FROM connection_requests WHERE requester_id = $1 AND requested_id = $2`,
        [requesterIdInt, requestedIdInt]
      );

      const [userOneId, userTwoId] = requesterIdInt < requestedIdInt
        ? [requesterIdInt, requestedIdInt]
        : [requestedIdInt, requesterIdInt];

      await pool.query(
        `INSERT INTO connections (user_one_id, user_two_id) VALUES ($1, $2)`,
        [userOneId, userTwoId]
      );

      io.emit('connections_change', {
        user_one_id: userOneId,
        user_two_id: userTwoId,
      });
    }

    await pool.query("COMMIT");
    res.json({ success: true, message: "Connections successfully enabled." });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error enabling connections:", error);
    res.status(500).send({
      success: false,
      message: "An error occurred while enabling connections.",
    });
  }
});
app.post("/api/delete-from-connection-requests/:id", async (req, res) => {
  const { id } = req.params; // Extracting the id from the request parameters

  try {
    // Perform the delete operation
    const deleteQuery =
      "DELETE FROM connection_requests WHERE id = $1 RETURNING *;"; // RETURNING * is optional and returns the deleted row
    const result = await pool.query(deleteQuery, [id]);

    if (result.rowCount === 0) {
      // If no row was deleted, send a 404 response
      res
        .status(404)
        .send({ success: false, message: "Connection request not found." });
    } else {
      // On successful deletion, return the deleted record or a success message
      const deletedRequest = result.rows[0];

      // Emit connection_requests_change event
      io.emit("connection_requests_change", { requested_id: deletedRequest.requested_id });

      res.json({
        success: true,
        message: "Connection request successfully deleted.",
        deletedRecord: deletedRequest,
      });
    }
  } catch (error) {
    console.error("Error deleting connection request:", error);
    res.status(500).send({
      success: false,
      message: "An error occurred while deleting the connection request.",
    });
  }
});

app.get("/api/connected/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const query = `
      SELECT * FROM (
        (SELECT 
          null as connection_id, -- Placeholder for the current user
          id, 
          username, 
          email, 
          sexual_orientation, 
          hobbies, 
          floats_my_boat, 
          sex,
          about_you,
          admin_face 
        FROM 
          users 
        WHERE 
          id = $1)

        UNION

        (SELECT 
          connections.id as connection_id, -- Include connection ID for associated users
          U2.id, 
          U2.username, 
          U2.email, 
          U2.sexual_orientation, 
          U2.hobbies, 
          U2.floats_my_boat, 
          U2.sex,
          U2.about_you,
          U2.admin_face
        FROM 
          users U1
          JOIN connections ON U1.id = connections.user_one_id OR U1.id = connections.user_two_id
          JOIN users U2 ON U2.id = connections.user_one_id OR U2.id = connections.user_two_id
        WHERE 
          U1.id = $1 AND U2.id != $1)
      ) AS combined_result
      ORDER BY username;
    `;

    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "An error occurred." });
  }
});


app.delete("/api/delete-requests-from-me/:userId", async (req, res) => {
  const { userId } = req.params; // Extract userId from the request URL

  try {
    // Delete all connection requests where the requester_id matches the userId provided
    const result = await pool.query(
      "DELETE FROM connection_requests WHERE requester_id = $1 RETURNING *;",
      [userId]
    );

    // Check if rows were deleted
    if (result.rowCount > 0) {
      // Emit connection_requests_change event for each deleted request
      result.rows.forEach(deletedRequest => {
        io.emit("connection_requests_change", { requested_id: deletedRequest.requested_id });
      });

      res.json({
        success: true,
        message: `Deleted ${result.rowCount} connection request(s) from user ${userId}.`,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "No connection requests found to delete for this user.",
      });
    }
  } catch (error) {
    console.error("Error deleting connection requests from user:", error);
    res.status(500).send({
      success: false,
      message: "An error occurred while deleting connection requests.",
    });
  }
});

app.delete("/api/delete-requests-to-me/:userId", async (req, res) => {
  const { userId } = req.params; // Extract userId from the request URL parameters

  try {
    // Prepare and execute the DELETE query
    const query = `DELETE FROM connection_requests WHERE requested_id = $1`;
    const result = await pool.query(query, [userId]);

    // Check if rows were deleted
    if (result.rowCount > 0) {
      res.json({
        success: true,
        message: "Connection requests successfully deleted.",
      });
    } else {
      res.json({
        success: false,
        message: "No connection requests found for the user.",
      });
    }
  } catch (error) {
    console.error("Error deleting connection requests:", error);
    res.status(500).send({
      success: false,
      message: "An error occurred while deleting connection requests.",
    });
  }
});

app.delete("/api/delete-connection/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("BEGIN");

    const query = "DELETE FROM connections WHERE id = $1 RETURNING *";
    const result = await pool.query(query, [id]);

    if (result.rowCount === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ message: "Connection not found." });
    }

    await pool.query("COMMIT");

    // Emit the connection change event
    const deletedConnection = result.rows[0];
    io.emit('connections_change', {
      user_one_id: deletedConnection.user_one_id,
      user_two_id: deletedConnection.user_two_id,
    });

    res.status(200).json({ message: "Connection successfully deleted." });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error deleting connection:", error);
    res.status(500).send("An error occurred while deleting the connection.");
  }
});
app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, profile_picture, profile_video, email, sexual_orientation, hobbies, floats_my_boat, sex, about_you, admin_face FROM users ORDER BY username"
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "An error occurred." });
  }
});

app.get("/api/connected-users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "(SELECT users.id, users.username, users.profile_picture, users.profile_video, users.email, users.sexual_orientation, users.hobbies, users.floats_my_boat, users.sex, users.about_you, NULL as connection_id FROM users WHERE id = $1) UNION (SELECT U2.id, U2.username, U2.profile_picture, U2.profile_video, U2.email, U2.sexual_orientation, U2.hobbies, U2.floats_my_boat, U2.sex, U2.about_you, connections.id as connection_id FROM users U1 JOIN connections ON U1.id = connections.user_one_id OR U1.id = connections.user_two_id JOIN users U2 ON U2.id = connections.user_one_id OR U2.id = connections.user_two_id WHERE U1.id = $1 AND U2.id != $1) ORDER BY username",
      [id] // Passing the id as a parameter to the SQL query
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "An error occurred." });
  }
});

async function findUserById(userId) {
  try {
    const query = `SELECT profile_picture FROM users WHERE id = $1`;
    const values = [userId];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return null; // User not found
    }

    // Assuming profile_picture stores either a path or a URL
    const userProfilePicture = result.rows[0].profile_picture;
    return userProfilePicture;
  } catch (error) {
    console.error("Error finding user by ID:", error);
    throw error; // Rethrow the error for calling function to handle
  }
}
app.post("/api/upload-audio", upload.single("audio"), async (req, res) => {
  try {
    const { submissionId, userId } = req.body; // Extract the submissionId and userId from the request body
    const uploadedFilePath = path.join(
      "/uploaded-images", // Ensure all audio files go to the 'uploaded-audio' directory
      path.basename(req.file.path)
    );

    // Insert into the submission_dialog table
    const result = await pool.query(
      "INSERT INTO submission_dialog (submission_id, posting_user_id, uploaded_path, type) VALUES ($1, $2, $3, 'audio') RETURNING *",
      [submissionId, userId, uploadedFilePath]
    );

    const newPost = result.rows[0];

    // Fetch interested users
    const userQuery = `SELECT participating_user_id FROM submission_members WHERE submission_id = $1`;
    const resUsers = await pool.query(userQuery, [submissionId]);
    const interestedUserIds = resUsers.rows.map((row) => row.participating_user_id);
    
    // Emit the post update to interested users
    newPost.interestedUserIds = interestedUserIds;
    io.to(`submission-${submissionId}`).emit("postUpdated", { updatedPost: newPost });

    res.json(newPost); // Return the new database entry
  } catch (error) {
    console.error("Failed to upload audio file:", error);
    res.status(500).send("Error uploading audio file.");
  }
});


app.get("/api/users/:userId/profile-picture", async (req, res) => {
  const { userId } = req.params;

  try {
    const profilePicturePath = await findUserById(userId);
    if (!profilePicturePath) {
      return res
        .status(404)
        .json({ message: "User not found or no profile picture set" });
    }

    // Adjust the path to be relative to the static directory you've set up in Express
    // Assuming profilePicturePath format is "backend/imageUploaded/file-name.jpg"
    const urlPath = profilePicturePath.replace(
      /^backend\\imageUploaded\\/,
      "/uploaded-images/"
    );
    res.json({ profilePicture: urlPath });
  } catch (error) {
    console.error("Error fetching profile picture:", error);
    res.status(500).send("Internal Server Error");
  }
});

async function deleteFile(filePath) {
  try {
    await fs.promises.unlink(filePath);
    //console.log(`Successfully deleted file: ${filePath}`);
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error(`File not found, removing from schedule: ${filePath}`);
    } else {
      console.error(
        `Error deleting file: ${filePath}. Error: ${error.message}`
      );
      throw error;
    }
  }
}

async function scheduleFileForDeletion(client, filePath) {
  try {
    await client.query(
      "INSERT INTO scheduled_deletions (file_path) VALUES ($1)",
      [filePath]
    );
    console.log(`Scheduled file for deletion: ${filePath}`);
  } catch (error) {
    console.error(
      `Error scheduling file for deletion: ${filePath}. Error: ${error.message}`
    );
  }
}

async function restoreOriginalProfilePicture(client, userId, originalFilePath) {
  try {
    await client.query("BEGIN");
    await client.query("UPDATE users SET profile_picture = $1 WHERE id = $2", [
      originalFilePath,
      userId,
    ]);
    await client.query("COMMIT");
    //console.log("Successfully restored original profile picture");
  } catch (restoreError) {
    await client.query("ROLLBACK");
    console.error(
      `Error restoring original profile picture: ${restoreError.message}`
    );
  }
}

async function generateThumbnail(filePath, thumbnailPath) {
  try {
      // Ensure the directory exists
      const dir = path.dirname(thumbnailPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
  
    const image = await Jimp.read(filePath);
    const longerDimension = image.bitmap.width > image.bitmap.height ? 'width' : 'height';

    if (longerDimension === 'width') {
      image.resize(100, Jimp.AUTO); // Resize keeping the width as 100
    } else {
      image.resize(Jimp.AUTO, 100); // Resize keeping the height as 100
    }

    await image.writeAsync(thumbnailPath);
    //console.log(`Thumbnail generated at ${thumbnailPath}`);
  } catch (error) {
    console.error(`Error generating thumbnail: ${error.message}`);
    throw error;
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

app.post(
  "/api/users/:userId/profile-picture",
  upload.single("file"),
  async (req, res) => {
    const client = await pool.connect();
    let originalFilePath = null;
    let originalThumbnailPath = null;
    const newFilePath = req.file.path;
    const newThumbnailPath = path.join(
      path.dirname(newFilePath),
      "thumb-" + path.basename(newFilePath)
    );

    try {
      const userId = req.params.userId;

      await client.query("BEGIN");

      // Retrieve the current profile picture path for the user, if it exists
      const { rows: existingUser } = await client.query(
        "SELECT profile_picture FROM users WHERE id = $1 FOR UPDATE",
        [userId]
      );

      if (existingUser.length > 0 && existingUser[0].profile_picture) {
        originalFilePath = existingUser[0].profile_picture;
        originalThumbnailPath = path.join(
          path.dirname(originalFilePath),
          "thumb-" + path.basename(originalFilePath)
        );
      }

      // Update the user's profile picture path in the database
      const result = await client.query(
        "UPDATE users SET profile_picture = $1 WHERE id = $2 RETURNING *",
        [newFilePath, userId]
      );

      await client.query("COMMIT");

      // Generate thumbnail while maintaining aspect ratio
      await generateThumbnail(newFilePath, newThumbnailPath);

      // Ensure all file operations are completed before attempting to delete old files
      await delay(100); // Small delay to ensure file locks are released

      //listDirectoryContents(path.dirname(newFilePath));
      // If there was an existing profile picture, delete the file and its thumbnail after the transaction is committed
      if (originalFilePath) {
        try {
          await deleteFile(originalFilePath);
          await deleteFile(originalThumbnailPath);
        } catch (err) {
          console.error(
            `Error deleting old profile picture and thumbnail: ${err.message}`
          );
          // Schedule the files for deletion
          await scheduleFileForDeletion(client, originalFilePath);
          await scheduleFileForDeletion(client, originalThumbnailPath);
        }
      }

      res.json(result.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      console.error(error);

      // Cleanup: Delete the newly uploaded file and its thumbnail if an error occurs
      if (newFilePath) {
        try {
          await deleteFile(newFilePath);
        } catch (cleanupError) {
          console.error("Error during cleanup:", cleanupError);
          // Schedule the new files for deletion
          await scheduleFileForDeletion(client, newFilePath);
        }

        try {
          await deleteFile(newThumbnailPath);
        } catch (cleanupError) {
          console.error("Error during thumbnail cleanup:", cleanupError);
          // Schedule the new files for deletion
          await scheduleFileForDeletion(client, newThumbnailPath);
        }
      }

      // Restore original profile picture if an error occurs
      if (originalFilePath) {
        await restoreOriginalProfilePicture(
          client,
          req.params.userId,
          originalFilePath
        );
      }

      handleDatabaseError(error, res);
    } finally {
      client.release();
    }
  }
);
//Cleanup files
async function cleanupScheduledDeletions() {
  const client = await pool.connect();

  try {
    const { rows: filesToDelete } = await client.query(
      "SELECT id, file_path FROM scheduled_deletions"
    );

    for (const file of filesToDelete) {
      const { id, file_path } = file;

      try {
        await deleteFile(file_path);
        await client.query("DELETE FROM scheduled_deletions WHERE id = $1", [
          id,
        ]);
        console.log(`Successfully deleted scheduled file: ${file_path}`);
      } catch (error) {
        if (error.code === "ENOENT") {
          // Remove the record from the table if the file does not exist
          await client.query("DELETE FROM scheduled_deletions WHERE id = $1", [
            id,
          ]);
          console.log(`Removed non-existent file from schedule: ${file_path}`);
        } else {
          console.error(
            `Error deleting scheduled file: ${file_path}. Error: ${error.message}`
          );
        }
        // Continue with next file
      }
    }
  } catch (error) {
    console.error(`Error during cleanup: ${error.message}`);
  } finally {
    client.release();
  }
}

// Schedule the cleanup job to run periodically
setInterval(cleanupScheduledDeletions, 60000); // Run every 60 seconds

// Separate multer configuration for profile video uploads
const videoUpload = multer({
  storage: multer.diskStorage({
    destination: "backend/imageUploaded", // Adjust directory path as needed
    filename: (req, file, cb) => {
      cb(null, "profile-video-" + Date.now() + path.extname(file.originalname));
    },
  }),
  fileFilter: (req, file, cb) => {
    // Accept videos only
    if (!file.originalname.match(/\.(mp4|mov)$/)) {
      req.fileValidationError = "Only video files are allowed!";
      return cb(new Error("Only video files are allowed!"), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB size limit
}).single("profileVideo");

app.post("/api/users/:userId/upload-profile-video", (req, res) => {
  videoUpload(req, res, async (err) => {
    if (req.fileValidationError) {
      return res.status(400).send(req.fileValidationError);
    }
    if (err instanceof multer.MulterError) {
      return res.status(500).send(err.message);
    } else if (err) {
      return res.status(500).send(err.message);
    }

    // No error thrown by multer, file has been uploaded successfully
    const userId = req.params.userId;
    const profileVideoPath = req.file.path; // The file path where the video is stored

    try {
      const result = await pool.query(
        "UPDATE users SET profile_video = $1 WHERE id = $2 RETURNING *",
        [profileVideoPath, userId]
      );

      if (result.rows.length > 0) {
        res.status(200).json({
          message: "Profile video updated successfully.",
          user: result.rows[0],
        });
      } else {
        res.status(404).send({ message: "User not found." });
      }
    } catch (error) {
      console.error("Error updating profile video:", error);
      res.status(500).send({ message: "Error updating profile video." });
    }
  });
});

app.delete("/api/submission-dialog/:dialogId", async (req, res) => {
  const { dialogId } = req.params;

  try {
    const selectQuery =
      "SELECT uploaded_path FROM submission_dialog WHERE id = $1";
    const selectResult = await pool.query(selectQuery, [dialogId]);

    if (selectResult.rows.length > 0) {
      const { uploaded_path } = selectResult.rows[0];

      if (uploaded_path) {
        const filePath = path.join(
          __dirname,
          "imageUploaded",
          path.basename(uploaded_path)
        );
        try {
          if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath); // Asynchronously delete the file
          }
        } catch (err) {
          return res.status(500).send("Error deleting the file.");
        }
      }

      // Proceed to delete the database record whether or not a file was present/deleted
      const deleteQuery = "DELETE FROM submission_dialog WHERE id = $1";
      await pool.query(deleteQuery, [dialogId]);

      res.json({ message: "Dialog record deleted successfully." });
    } else {
      res.status(404).send("Dialog record not found.");
    }
  } catch (error) {
    console.error("Error in deletion process:", error);
    res.status(500).send("Error during the deletion process.");
  }
});

/** */
app.post(
  "/api/users/:submissionId/uploaded-item",
  upload.single("file"),
  async (req, res) => {
    try {
      const submissionId = req.params.submissionId;
      const postingUserId = req.body.userId; // Extract the posting_user_id from the request body
      const uploadedFilePath = path.join(
        "/uploaded-images",
        path.basename(req.file.path)
      ); // Store only the relative path

      // Insert into the submission_dialog table
      const result = await pool.query(
        "INSERT INTO submission_dialog (submission_id, posting_user_id, uploaded_path) VALUES ($1, $2, $3) RETURNING *",
        [submissionId, postingUserId, uploadedFilePath]
      );

      const newPost = result.rows[0];
      // Emit postUpdated event to all clients viewing the same engagement
      const interestedUsersQuery = `SELECT participating_user_id FROM submission_members WHERE submission_id = $1`;
      const interestedUsersResult = await pool.query(interestedUsersQuery, [submissionId]);
      const interestedUserIds = interestedUsersResult.rows.map((row) => row.participating_user_id);

      io.to(`submission-${submissionId}`).emit("postUpdated", { updatedPost: newPost, interestedUserIds });

      res.json(newPost);
    } catch (error) {
      console.error(error);
      handleDatabaseError(error, res);
    }
  }
);


app.post(
  "/api/submission-dialog/:dialogId/update-item",
  upload.single("file"),
  async (req, res) => {
    const dialogId = req.params.dialogId; // Get the dialog ID from the URL parameter
    try {
      // Start a transaction
      await pool.query("BEGIN");

      // Retrieve the current uploaded_path
      const selectQuery =
        "SELECT uploaded_path FROM submission_dialog WHERE id = $1";
      const selectResult = await pool.query(selectQuery, [dialogId]);
      if (selectResult.rows.length > 0 && selectResult.rows[0].uploaded_path) {
        // Delete the old file
        const oldFilePath = selectResult.rows[0].uploaded_path;
        const fullOldFilePath = path.join(
          __dirname,
          "imageUploaded",
          path.basename(oldFilePath)
        );
        if (fs.existsSync(fullOldFilePath)) {
          await fs.promises.unlink(fullOldFilePath);
          console.log(`Deleted old file: ${fullOldFilePath}`);
        }
      } else {
        throw new Error("No existing file path found.");
      }

      // Construct the new file path
      const uploadedFilePath = path.join(
        "/uploaded-images",
        path.basename(req.file.path)
      );

      // Update the uploaded_path in the submission_dialog table
      const updateQuery =
        "UPDATE submission_dialog SET uploaded_path = $1 WHERE id = $2 RETURNING *";
      const updateResult = await pool.query(updateQuery, [
        uploadedFilePath,
        dialogId,
      ]);
      if (updateResult.rows.length) {
        // Commit the transaction
        await pool.query("COMMIT");

        // Emit postUpdated event to all clients viewing the same engagement
        const updatedPost = updateResult.rows[0];
        const submissionId = updatedPost.submission_id;
        const interestedUsersQuery = `SELECT participating_user_id FROM submission_members WHERE submission_id = $1`;
        const interestedUsersResult = await pool.query(interestedUsersQuery, [submissionId]);
        const interestedUserIds = interestedUsersResult.rows.map((row) => row.participating_user_id);

        io.to(`submission-${submissionId}`).emit("postUpdated", { updatedPost, interestedUserIds });
        //console.log("updatedPost", updatedPost);
        res.json(updatedPost); // Send back the updated record
      } else {
        throw new Error("No dialog found to update.");
      }
    } catch (error) {
      // Rollback in case of error
      await pool.query("ROLLBACK");
      console.error(error);
      res.status(500).send("Server error occurred while updating the item.");
    }
  }
);


app.patch("/api/submission-dialog/:dialogId", async (req, res) => {
  const dialogId = req.params.dialogId;
  const newTextContent = req.body.text_content;

  if (!newTextContent.trim()) {
    return res.status(400).send("Text content is required.");
  }

  try {
    // Start a transaction
    await pool.query("BEGIN");

    // Update text_content in the submission_dialog table
    const updateQuery =
      "UPDATE submission_dialog SET text_content = $1 WHERE id = $2 RETURNING *";
    const result = await pool.query(updateQuery, [newTextContent, dialogId]);

    if (result.rows.length) {
      const updatedPost = result.rows[0];
      const submissionId = updatedPost.submission_id;

      // Commit the transaction
      await pool.query("COMMIT");

      // Emit postUpdated event to all clients viewing the same engagement
      const query = `SELECT participating_user_id FROM submission_members WHERE submission_id = $1`;
      const interestedUsersResult = await pool.query(query, [submissionId]);
      const interestedUserIds = interestedUsersResult.rows.map((row) => row.participating_user_id);

      io.to(`submission-${submissionId}`).emit("postUpdated", { updatedPost, interestedUserIds });

      res.json(updatedPost); // Send back the updated record
    } else {
      res.status(404).send("Submission dialog not found.");
    }
  } catch (error) {
    // Rollback in case of error
    await pool.query("ROLLBACK");
    console.error(error);
    res
      .status(500)
      .send("Server error occurred while updating the text content.");
  }
});


app.get("/api/users/:submissionId/posts", async (req, res) => {
  try {
    //console.log("Posting list api submissionId",req.params.submissionId)
    const submissionId = req.params.submissionId;

    // New query to fetch from the submission_dialog table
    const query = `
    SELECT 
    sd.id, 
    sd.submission_id, 
    sd.posting_user_id, 
    sd.text_content AS content,
    sd.uploaded_path, 
    sd.created_at,
    u.username,
    u.profile_picture,
    CASE 
        WHEN sd.uploaded_path IS NULL THEN 'text' 
        ELSE 'media' 
    END AS type 
FROM 
    submission_dialog sd
JOIN 
    users u ON sd.posting_user_id = u.id
WHERE 
    sd.submission_id = $1
ORDER BY 
    sd.created_at DESC;
    `;

    const result = await pool.query(query, [submissionId]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error occurred while fetching posts.");
  }
});
app.post("/api/update-the-group", async (req, res) => {
  try {
    const { submissionId, userIds } = req.body; // Get submissionId and userIds from request body

    // Begin a transaction
    await pool.query("BEGIN");

    // Delete all existing members (except the creator) from the group
    await pool.query(
      "DELETE FROM submission_members WHERE submission_id = $1 AND participating_user_id != (SELECT user_id FROM user_submissions WHERE id = $1)",
      [submissionId]
    );

    // Insert the new set of members
    for (const userId of userIds) {
      await pool.query(
        "INSERT INTO submission_members (submission_id, participating_user_id) VALUES ($1, $2)",
        [submissionId, userId]
      );
    }

    // Commit the transaction
    await pool.query("COMMIT");

    res.send({ message: "Group updated successfully." });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error(error);
    res
      .status(500)
      .send({ message: "An error occurred while updating the group." });
  }
});
app.get("/api/closed-interaction-zip/:submissionId", async (req, res) => {
  const submissionId = req.params.submissionId;
  const title = req.query.title || "interaction"; // Get title from query parameter, fallback to 'interaction'

  try {
    // Fetch posts for the given submissionId
    const query = `
      SELECT
        sd.id,
        sd.submission_id,
        sd.posting_user_id,
        sd.text_content AS content,
        sd.uploaded_path,
        sd.created_at,
        u.username,
        u.profile_picture,
        CASE
          WHEN sd.uploaded_path IS NULL THEN 'text'
          ELSE 'media'
        END AS type
      FROM
        submission_dialog sd
      JOIN
        users u ON sd.posting_user_id = u.id
      WHERE
        sd.submission_id = $1
      ORDER BY
        sd.created_at DESC;
    `;
    const result = await pool.query(query, [submissionId]);
    const posts = result.rows;

    const zip = new JSZip();
    // Title for the ZIP based on the title query parameter or default to 'interaction.zip'
    const zipTitle = `${title.replace(/\s+/g, "_")}.zip`;

    // Add JSON file to the ZIP
    zip.file(
      `${zipTitle.replace(".zip", ".json")}`,
      JSON.stringify(posts, null, 2)
    );

    // Determine base directory for images 
    const baseDir = isLocal ? path.join(__dirname, "imageUploaded") : path.join(__dirname, "backend/imageUploaded");

    // Loop through posts to add any media files to the ZIP
    for (const post of posts.filter((post) => post.uploaded_path)) {
      // Resolve the full path for the uploaded file based on the environment
      const sanitizedPath = post.uploaded_path.replace("uploaded-images\\", "").replace("uploaded-images/", "");
      const fullPath = path.join(baseDir, sanitizedPath);
      console.log("fullPath", fullPath);

      // Ensure the file exists before attempting to add it to the ZIP
      if (fs.existsSync(fullPath)) {
        zip.file(path.basename(fullPath), fs.readFileSync(fullPath));
      } else {
        console.log(`File not found: ${fullPath}`);
      }
    }

    zip
      .generateNodeStream({ type: "nodebuffer", streamFiles: true })
      .pipe(res)
      .on("finish", function () {
        res.status(200).end();
      });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error occurred while creating ZIP.");
  }
});

app.post(
  "/api/build-interaction-from-files",
  upload.single("zipFile"),
  async (req, res) => {
    // Ensure a file was uploaded and the userId is present
    if (!req.file || !req.body.userId) {
      return res.status(400).json({
        error: "No ZIP file was uploaded, or userId is missing.",
      });
    }

    const zipFilePath = req.file.path;
    const userId = req.body.userId;
    const originalFileName = req.file.originalname;

    try {
      // Process the ZIP file using the extracted function
      const result = await processZipFile(
        zipFilePath,
        userId,
        originalFileName
      );
      res.json(result);
    } catch (error) {
      console.error("Error processing ZIP file:", error);
      res.status(500).json({
        error: "Error processing ZIP file.",
      });
    }
  }
);


async function deleteExpiredInteractions() {
  await pool.query("BEGIN");

  try {
    // Get the paths of all images to be deleted
    const { rows: imagesToDelete } = await pool.query(`
      SELECT uploaded_path FROM submission_dialog
      WHERE submission_id IN (
        SELECT id FROM user_submissions
        WHERE (2 * 24 * 60 * 60 - EXTRACT(epoch FROM NOW() - lastuser_addition)) < 0
      )
    `);

    // Determine base directory for images
    const baseDir = isLocal ? path.join(__dirname, "imageUploaded") : path.join(__dirname, "backend/imageUploaded");

    // Delete the images from the filesystem
    for (const row of imagesToDelete) {
      const pathType = typeof row.uploaded_path;

      if (pathType === "string" && row.uploaded_path.trim() !== "") {
        // Removing the 'uploaded-images' segment from the path
        const sanitizedPath = row.uploaded_path.replace(/^.*[\\\/]uploaded-images[\\\/]/, "");
        const fullPath = path.join(baseDir, sanitizedPath);

        try {
          if (fs.existsSync(fullPath)) {
            await fs.promises.unlink(fullPath);
            console.log(`Successfully deleted: ${fullPath}`);
          } else {
            console.log(`File not found: ${fullPath}, skipping deletion.`);
          }
        } catch (error) {
          console.error(`Failed to delete file ${fullPath}: `, error);
        }
      } else {
        console.log("Invalid path encountered, skipping deletion.");
      }
    }

    // Continue with database deletions as before...
    // First, delete from the submission_dialog table
    await pool.query(`
      DELETE FROM submission_dialog
      WHERE submission_id IN (
        SELECT id FROM user_submissions
        WHERE (2 * 24 * 60 * 60 - EXTRACT(epoch FROM NOW() - lastuser_addition)) < 0
      )
    `);

    // Next, delete from the submission_members table
    await pool.query(`
      DELETE FROM submission_members
      WHERE submission_id IN (
        SELECT id FROM user_submissions
        WHERE (2 * 24 * 60 * 60 - EXTRACT(epoch FROM NOW() - lastuser_addition)) < 0
      )
    `);

    // Finally, delete from the user_submissions table
    await pool.query(`
      DELETE FROM user_submissions
      WHERE (2 * 24 * 60 * 60 - EXTRACT(epoch FROM NOW() - lastuser_addition)) < 0
    `);

    // Commit the transaction
    await pool.query("COMMIT");
  } catch (error) {
    console.error("Error during transaction, rolling back:", error);
    await pool.query("ROLLBACK");
    // Decide if you want to rethrow the error or handle it differently
  }
}

app.post("/api/end_interaction", async (req, res) => {
  const { submissionId } = req.body; // Extract the submissionId from the request body

  try {
    await pool.query("BEGIN");

    const updateQuery = `
      UPDATE user_submissions
      SET lastuser_addition = lastuser_addition - interval '2 days'
      WHERE id = $1
    `;

    await pool.query(updateQuery, [submissionId]);

    await pool.query("COMMIT");

    res.json({ message: "Interaction ended successfully." });
  } catch (error) {
    console.error("Error during ending interaction:", error);
    await pool.query("ROLLBACK");
    res.status(500).send("Failed to end interaction");
  }
});

app.get("/api/my_interaction_titles", async (req, res) => {
  try {
    const loggedInId = req.query.logged_in_id;
    if (!loggedInId) {
      return res.status(400).send({ message: "Logged in ID is required." });
    }
    await deleteExpiredInteractions();

    const query = `
      SELECT 
        us.id AS submission_id, 
        us.title, 
        TO_CHAR(us.created_at, 'Day, DD Month YYYY HH24:MI') AS formatted_created_at,
        TO_CHAR(us.created_at, 'Mon DD HH24:MI') AS formatted_created_at_mobile,
        CONCAT(
          FLOOR(EXTRACT(epoch FROM interval '2 days' - (NOW() - us.lastuser_addition))/86400) || ' Days ',
          FLOOR((EXTRACT(epoch FROM interval '2 days' - (NOW() - us.lastuser_addition)) % 86400) / 3600) || ' Hours ',
          FLOOR((EXTRACT(epoch FROM interval '2 days' - (NOW() - us.lastuser_addition)) % 3600) / 60) || ' Minutes ',
          FLOOR(EXTRACT(epoch FROM interval '2 days' - (NOW() - us.lastuser_addition)) % 60) || ' Seconds'
        ) AS expected_end,
        (us.lastuser_addition + interval '2 days') AS end_timestamp, -- Add this line
        us.user_id, 
        u.username
      FROM 
        submission_members sm
      JOIN 
        user_submissions us ON sm.submission_id = us.id
      JOIN 
        users u ON us.user_id = u.id
      WHERE 
        sm.participating_user_id = $1;
    `;

    const result = await pool.query(query, [loggedInId]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "An error occurred while fetching interaction titles.",
    });
  }
});

app.get("/api/interaction_user_list", async (req, res) => {
  try {
    const submissionId = req.query.submission_id; // Get the submission ID from the query parameters

    if (!submissionId) {
      return res.status(400).send({ message: "Submission ID is required." });
    }

    const query = `
      SELECT u.id, u.username, us.title 
      FROM submission_members sm 
      JOIN users u ON sm.participating_user_id = u.id 
      JOIN user_submissions us ON sm.submission_id = us.id 
      WHERE sm.submission_id = $1 AND sm.participating_user_id != us.user_id;
    `;

    const result = await pool.query(query, [submissionId]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message:
        "An error occurred while fetching user list for the interaction.",
    });
  }
});

app.get("/api/interaction_feed_user_list", async (req, res) => {
  try {
    const submissionId = req.query.submission_id; // Get the submission ID from the query parameters

    if (!submissionId) {
      return res.status(400).send({ message: "Submission ID is required." });
    }

    const query = `
      SELECT u.id, u.username, us.title, u.profile_picture, u.admin_face
      FROM submission_members sm 
      JOIN users u ON sm.participating_user_id = u.id 
      JOIN user_submissions us ON sm.submission_id = us.id 
      WHERE sm.submission_id = $1;
    `;

    const result = await pool.query(query, [submissionId]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message:
        "An error occurred while fetching user list for the interaction.",
    });
  }
});

app.get("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT 
        id, 
        username, 
        email, 
        profile_picture, 
        profile_video, 
        sexual_orientation, 
        hobbies, 
        floats_my_boat, 
        sex, 
        about_you, 
        about_my_bot_pal, 
        admin_face, 
        worldX,   
        worldY    
      FROM users WHERE id = $1`,
      [id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "An error occurred." });
  }
});


async function system_reply({ userId, content, submissionId, interestedUserIds, user_id }) {
  let pretrainText = "";
  const systemInfo = process.env.SYSTEM_SUMMARY;
  
  const userQuery = "SELECT sexual_orientation, hobbies, floats_my_boat, sex, about_my_bot_pal FROM users WHERE id = $1";
  const userResult = await pool.query(userQuery, [user_id]);
  const userInfo = userResult.rows[0];

  const botInfo = userInfo.about_my_bot_pal;
  pretrainText = `You are chatting with a bot that has the following characteristics: ${botInfo} and always answers with less than 150 characters`;

  const userPreferences = `
    User's sexual orientation: ${userInfo.sexual_orientation},
    Hobbies: ${userInfo.hobbies},
    Floats their boat: ${userInfo.floats_my_boat},
    Sex: ${userInfo.sex}.
  `;

  pretrainText += ` ${systemInfo}`;
  pretrainText += ` ${userPreferences}`;

  try {
    if (!content) {
      throw new Error("Content is missing for the system reply");
    }

    let systemResponse;
    if (process.env.AI_ENGINE === '1') {
      // Use Groq
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: pretrainText
          },
          {
            role: "user",
            content: content
          }
        ],
        model: "llama3-8b-8192",
        temperature: 1,
        max_tokens: 150,
        top_p: 1,
        stream: false,
        stop: null
      });
      systemResponse = chatCompletion.choices[0]?.message?.content || '';

    } else if (process.env.AI_ENGINE === '2') {
      // Use OpenAI with the new AI/ML engine and custom baseURL
      const api = new OpenAI({
        apiKey: openaiAPIKey,
        baseURL: "https://api.aimlapi.com/v1",  // Custom base URL
      });

      const chatCompletion = await api.chat.completions.create({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        messages: [
          { role: "system", content: pretrainText },
          { role: "user", content: content }
        ],
        temperature: 0.7,
        max_tokens: 150,
      });

      systemResponse = chatCompletion.choices[0]?.message?.content || '';
    }

    if (!systemResponse) {
      throw new Error("Received empty response from AI");
    }

    // Insert the system's reply into the database
    const insertResult = await pool.query(
      "INSERT INTO submission_dialog (submission_id, posting_user_id, text_content) VALUES ($1, $2, $3) RETURNING *",
      [submissionId, userId, systemResponse]
    );

    const newSystemPost = insertResult.rows[0];
    newSystemPost.interestedUserIds = interestedUserIds;

    // Emit the post update to interested users
    io.emit("post update", newSystemPost);

  } catch (error) {
    console.error('Error generating system reply:', error);
  }
}

app.post("/api/users/:submissionId/text-entry", async (req, res) => {
  try {
    const submissionId = req.params.submissionId; // Extract submissionId from the URL parameters

    const { userId, textContent } = req.body; // Extracting userId and textContent from the request body

    // Validate the received data
    if (!userId || !textContent) {
      return res
        .status(400)
        .json({ message: "User ID and text content are required." });
    }

    // Start a transaction
    await pool.query("BEGIN");

    // Insert into the submission_dialog table
    const insertResult = await pool.query(
      "INSERT INTO submission_dialog (submission_id, posting_user_id, text_content) VALUES ($1, $2, $3) RETURNING *",
      [submissionId, userId, textContent]
    );

    // Update the lastuser_addition field in the user_submissions table where id is equal to submissionId
    const updateResult = await pool.query(
      "UPDATE user_submissions SET lastuser_addition = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [submissionId]
    );

    // Commit the transaction
    await pool.query("COMMIT");

    // Respond with the new dialog entry
    const newPost = insertResult.rows[0];

    // Fetch interested users
    const userQuery = `SELECT participating_user_id FROM submission_members WHERE submission_id = $1`;
    const resUsers = await pool.query(userQuery, [submissionId]);
    const interestedUserIds = resUsers.rows.map((row) => row.participating_user_id);
      // Commit the transaction
      await pool.query("COMMIT");

      // Respond with the new dialog entry
      newPost.interestedUserIds = interestedUserIds;
  
      // Emit the post update to interested users
      io.emit("post update", newPost);
  
      // Call the system_reply function if the SYSTEM_ADMIN_ID is in interestedUserIds
      const systemAdminId = parseInt(process.env.SYSTEM_ADMIN_ID, 10);
      if (interestedUserIds.includes(systemAdminId)) {

        system_reply({
          userId: systemAdminId,
          content: textContent,
          submissionId,
          interestedUserIds,
          user_id: userId,
        });
      }
  
      // Respond with the new dialog entry
      res.json({
        dialogEntry: newPost,
        submissionUpdate: updateResult.rows[0],
      });
  
    } catch (error) {
      // Rollback the transaction on error
      await pool.query("ROLLBACK");
  
      console.error(error);
      res.status(500).json({
        message: "An error occurred while updating the interaction.",
        error: error,
      });
    }
  });
app.post("/api/user_submissions", async (req, res) => {
  try {
    const { user_id, title, userIds } = req.body;
    console.log("Received request:", { user_id, title, userIds }); // Log request data

    if (!user_id || !title || !userIds || !Array.isArray(userIds)) {
      return res
        .status(400)
        .json({ message: "User ID, title, and userIds are required." });
    }

    // Insert into user_submissions table
    const submissionResult = await pool.query(
      "INSERT INTO user_submissions (user_id, title) VALUES ($1, $2) RETURNING *", // Return all columns
      [user_id, title]
    );

    const submissionId = submissionResult.rows[0].id;
    console.log("Inserted submission:", submissionResult.rows[0]); // Log the inserted submission

    // Insert into submission_members table
    await Promise.all(
      userIds.map((userId) => {
        return pool.query(
          "INSERT INTO submission_members (submission_id, participating_user_id) VALUES ($1, $2)",
          [submissionId, userId]
        ).then(() => console.log(`Inserted submission member for user ${userId}`)); // Log each insertion
      })
    );

    // Emit the 'new_engagement' event to the users
    userIds.forEach((userId) => {
      console.log("Current clientSubmissions:", clientSubmissions); // Log current state
      const recipientSocketId = Object.keys(clientSubmissions).find(
        (socketId) => clientSubmissions[socketId].userId === userId
      );

      console.log(`User ${userId} has recipient socket ID: ${recipientSocketId}`); // Log recipient socket ID

      if (recipientSocketId) {
        io.to(recipientSocketId).emit("new_engagement", {
          userIds,
        });
        console.log(`Emitted new_engagement to user ${userId} with socket ID ${recipientSocketId}`); // Log emission
      } else {
        console.log(`No recipient socket ID found for user ${userId}`); // Log missing socket ID
      }
    });

    // Return the inserted row from user_submissions table
    res.json(submissionResult.rows[0]);
  } catch (error) {
    console.error("Error in /api/user_submissions:", error);
    handleDatabaseError(error, res);
  }
});


// In your server code

const crypto = require("crypto");
//email ex
app.post("/api/password_reset_request", async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email exists in the database
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Email does not exist" });
    }

    // Generate a secure token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Save this token in the database associated with the user's email
    await pool.query("UPDATE users SET token = $1 WHERE email = $2", [
      resetToken,
      email,
    ]);

    // Create reset URL
    // HOST PORTFORAPP
    const resetUrl = `https://${process.env.HOST}:${process.env.PORTFORAPP}/password-reset?token=${resetToken}`;

    // Send email
    const mailOptions = {
      from: process.env.RESET_EMAIL,
      to: email,
      subject: "Password Reset Request",
      text: `Please click on the following link to reset your password: ${resetUrl}`,
    };

    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        console.error("Error sending email: ", error);
        // If there's an error sending the email, consider whether you should also roll back the token update
        return res.status(500).json({ message: "Error sending email" });
      }
      res.status(200).json({
        success: true,
        message: "Reset password link has been sent to your email.",
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/update_user_password", async (req, res) => {
  const { token, password } = req.body;

  try {
    // First, verify the token by finding the user it belongs to
    const user = await pool.query("SELECT * FROM users WHERE token = $1", [
      token,
    ]);

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Optionally, check if the token has expired (if you've implemented expiration)

    // Hash the new password before storing it
    const saltRounds = 10; // You can adjust salt rounds as needed
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update the user's password and clear the token from the database
    await pool.query(
      "UPDATE users SET password = $1, token = NULL WHERE token = $2",
      [hashedPassword, token]
    );

    // Respond to the client that the password has been reset
    res.json({ message: "Password successfully updated" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Server error while updating password" });
  }
});
//999
app.post("/api/notify_offline_users", async (req, res) => {
  const { type, title, loggedInUserName, associatedUsers, scheduledTime } = req.body;
  console.log("type", type)
  console.log("title", title)
  console.log("loggedInUserName", loggedInUserName)
  console.log("associatedUsers", associatedUsers)
  console.log("scheduledTime", scheduledTime)
  try {
    for (const user of associatedUsers) {
      const { rows } = await pool.query(
        "SELECT email, username FROM users WHERE id = $1",
        [user.id]
      );
      const email = rows[0].email;
      const username = rows[0].username;
      let formattedTime = "";
      if (scheduledTime) {
        const dateObj = new Date(scheduledTime); // Convert to Date object
        const isToday = dateObj.toDateString() === new Date().toDateString();
        const isTomorrow =
          dateObj.toDateString() ===
          new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString();
        const dayText = isToday
          ? "today"
          : isTomorrow
          ? "tomorrow"
          : "the day after tomorrow";
        formattedTime = `${dayText} at ${dateObj.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
      }
      const getMessage = () => {
        switch (type) {
          case "Text":
          case "audio":
          case "picture":
            return `Hey ${username}, ${loggedInUserName} has added a ${type} post to the '${title}' interaction you are part of in the ConnectedEngaged application.\n Please login to catch up at: ${process.env.ROOT_DOMAIN}`;
          case "connection_accepted":
            return `Hey ${username}, ${loggedInUserName} has accepted your connection request you made in the ConnectedEngaged application.\n Please login to catch up at: ${process.env.ROOT_DOMAIN}`;
          case "call_request":
            return `Hey ${username}, ${loggedInUserName} has requested a video call with you ${formattedTime}.\nPlease login to the ConnectedEngaged application to join the call: ${process.env.ROOT_DOMAIN}`;
          default:
            return "unknown type";
        }
      };

      const getSubject = () => {
        switch (type) {
          case "Text":
          case "audio":
          case "picture":
            return `${loggedInUserName} has posted to ${title}`;
          case "connection_accepted":
            return `${loggedInUserName} has accepted your connection request`;
          case "call_request":
            return `${loggedInUserName} has requested a video call`;
          default:
            return "unknown type";
        }
      };

      const message = getMessage();
      const subject = getSubject();

      const mailOptions = {
        from: process.env.RESET_EMAIL,
        to: email,
        subject: subject,
        text: message,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email to:", email, error);
        } else {
          console.log("Email sent:", info.response);
        }
      });
    }
    res.status(200).json({
      success: true,
      message: "Email notifications have been sent.",
    });
  } catch (error) {
    console.error("Error notifying users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
// Start the server
const PORT = process.env.PORT || process.env.PROXYPORT;

server.listen(PORT, () => {
  console.log(`**9905**Server running on port ${PORT}`);
});
