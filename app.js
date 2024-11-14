const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bcrypt = require("bcrypt")
const jsonwebtoken = require("jsonwebtoken")
const adminModel = require("./model/admin")
const officerModel = require("./model/officer")
const volunteerModel = require("./model/volunteer")
const userModel = require("./model/user")
const messageModel = require("./model/message")
const ResourceModel = require("./model/resources")
// const MissingPersonModel = require('./model/MissingPersonModel.js')
const session = require('express-session');
const routes = require("./routes/resources")
const multer = require('multer');
const path = require('path');
const post = require("./model/post")


const router = express.Router();
require('dotenv').config({ path: './model/email.env' });








const nodemailer = require("nodemailer")
const MissingPersonModel = require("./model/missing")
const ResourceRequest = require("./model/resource")

const app = express()
app.use(cors())
app.use(express.json())
app.use("/resources", require("./routes/resources"));


app.use(session({
    secret: 'yourSecretKey', // replace with a secure key in production
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to `true` if using HTTPS
}));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Store files in 'uploads' directory
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Append a timestamp to avoid duplicate filenames
    },
  });
  
  const upload = multer({ storage: storage });

  
mongoose.connect("mongodb+srv://alfiyakn:alfiyakn@cluster0.l8relji.mongodb.net/disasterDb?retryWrites=true&w=majority&appName=Cluster0")

//register missing people
// routes/missingPeople.js

//search missing people
app.get('/search-missing', async (req, res) => {
    console.log('Search missing people request received:', req.query);
    const { district } = req.query;
    try {
        const missingPeople = await MissingPersonModel.find({ district });
        res.status(200).json(missingPeople);
    } catch (error) {
        console.error('Error searching missing people:', error);
        res.status(500).json({ message: 'Error retrieving missing people.' });
    }
});



// Route to register a missing person
app.post('/register-missing', async (req, res) => {
    const { name, address, age, sex, district, place, missingDate } = req.body;
    
    try {
        const newMissingPerson = new MissingPersonModel({
            name,
            address,
            age,
            sex,
            district,
            place,
            contactNumber,
            missingDate,

        });
        await newMissingPerson.save();
        res.status(201).json({ message: 'Missing person registered successfully!' });
    } catch (error) {
        console.error('Error registering missing person:', error);
        res.status(500).json({ message: 'Error registering missing person.' });
    }
});

module.exports = router;

//create post
app.post('/createpost', upload.single('image'), async (req, res) => {
    try {
      const { email, message } = req.body;
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  
      // Create and save the post in the database
      const newPost = new post({ email, message, imageUrl });
      await newPost.save();
  
      res.json({ status: 'success', message: 'Post created successfully!' });
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ status: 'error', message: 'Failed to create post.' });
    }
  });
  //view post by volunteer
 /* app.get('/viewposts', async (req, res) => {
    try {
        const posts = await post.find().sort({ createdAt: -1 });

        // Join posts with user data based on email
        const postsWithUserData = await Promise.all(posts.map(async (post) => {
            const user = await userModel.findOne({ email: post.email }); // Updated to use post.email
            
            return {
                _id: post._id,
                message: post.message,
                userName: user ? user.name : 'User not found',
                district: user ? user.district : 'User not found',
                createdAt: post.createdAt,
                imageUrl: post.imageUrl,
            };
        }));

        res.json({ status: 'success', posts: postsWithUserData });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch posts' });
    }
});*/

  //view post
  app.get('/viewposts', async (req, res) => {
    try {
        const posts = await post.find().sort({ createdAt: -1 });

        // Join posts with user data based on email
        const postsWithUserData = await Promise.all(posts.map(async (post) => {
            const user = await userModel.findOne({ email: post.email }); // Updated to use post.email
            
            return {
                _id: post._id,
                message: post.message,
                userName: user ? user.name : 'Aseera',
                district: user ? user.district : 'Idukki',
                createdAt: post.createdAt,
                imageUrl: post.imageUrl,
            };
        }));

        res.json({ status: 'success', posts: postsWithUserData });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch posts' });
    }
});


  
  
  
  
  //add user
  app.post("/adduser", async (req, res) => {
    let input = req.body;
    let token = req.headers.token;

    try {
        // Log the received token and input data for verification
        console.log("Received Token:", token);
        console.log("Received Input:", input);

        // Verify the token
        const decoded = jsonwebtoken.verify(token, "rescue-app");
        console.log("Decoded Token:", decoded);

        if (decoded && decoded.email) {
            let hashedPassword = bcrypt.hashSync(input.password, 10);
            const plainPassword = input.password; // For email
            input.password = hashedPassword;

            let result = new userModel(input);
            await result.save(); // Try saving user and check if it fails

            // Email setup using Nodemailer
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER, // Email from .env
                    pass: process.env.EMAIL_PASS  // Password from .env
                }
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: input.email,
                subject: 'Your Account Details',
                text: `Welcome! Your user ID is ${input.email} and your password is ${plainPassword}. Please keep these details safe.`
            };

            // Send email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error("Email Error:", error);
                    return res.status(500).json({ "status": "error", "message": "Failed to send email" });
                } else {
                    console.log('Email sent:', info.response);
                    return res.status(201).json({ "status": "success" });
                }
            });
        } else {
            return res.status(401).json({ "status": "failed", "message": "Unauthorized" });
        }
    } catch (error) {
        console.error("Error in /adduser route:", error); // Log the exact error here
        if (error.name === "JsonWebTokenError") {
            res.status(401).json({ "status": "failed", "message": "Invalid token" });
        } else if (error.name === "ValidationError") {
            res.status(400).json({ "status": "error", "message": "Validation error" });
        } else {
            res.status(500).json({ "status": "error", "message": "Internal server error" });
        }
    }
});
//admin signup
app.post("/adminSignUp", (req, res) => {
    let input = req.body
    let hashedPassword = bcrypt.hashSync(input.password, 10)
    input.password = hashedPassword
    console.log(input)
    let result = new adminModel(input)
    result.save()
    res.json({ "status": "success" })
})
//officer signup
app.post("/officerSignUp", (req, res) => {
    let input = req.body
    let hashedPassword = bcrypt.hashSync(input.password, 10)
    input.password = hashedPassword
    console.log(input)
    let result = new officerModel(input)
    result.save()
    res.json({ "status": "success" })
})
//volunteer signup
/*app.post("/addvolunteer", (req, res) => {
    let input = req.body
    let hashedPassword = bcrypt.hashSync(input.password, 10)
    input.password = hashedPassword
    console.log(input)
    let result = new volunteerModel(input)
    result.save()
    res.json({ "status": "success" })
})*/
//resource request
app.post('/requestresource', async (req, res) => {
    const { district, resourceCategory, quantity } = req.body;
    
    if (!district || !resourceCategory || !quantity) {
      return res.status(400).json({ message: "All fields are required." });
    }
  
    try {
      const newRequest = new ResourceRequest({
        district,
        resourceCategory,
        quantity,
        status: 'Pending',
        dateRequested: new Date(),
      });
      await newRequest.save();
      res.status(201).json(newRequest);
    } catch (error) {
      console.error("Error creating resource request:", error); // Log the error for debugging
      res.status(500).json({ message: "Error creating resource request." });
    }
  });
  
  app.get('/viewrequests', async (req, res) => {
    try {
      // Fetch all resource requests without filtering by role or district
      const requests = await ResourceRequest.find();
  
      // Respond with the list of requests
      res.status(200).json(requests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      res.status(500).json({ error: 'Error fetching requests' });
    }
  });
  
  // Update Resource Request Status API
// Assuming you have an Express setup
app.patch('/updateresource/:id', async (req, res) => {
    const { id } = req.params;
    const { resourceQuantity } = req.body;
  
    console.log("Resource ID:", id); // Log the ID to verify
    console.log("New Resource Quantity:", resourceQuantity); // Log the new quantity
  
    try {
      const updatedResource = await ResourceModel.findByIdAndUpdate(
        id,
        { resourceQuantity },
        { new: true } // Return the updated resource after modification
      );
  
      if (!updatedResource) {
        return res.status(404).json({ message: "Resource not found." });
      }
      res.status(200).json(updatedResource);
    } catch (error) {
      console.error("Error updating resource quantity:", error); // Log error details
      res.status(500).json({ message: "Error updating resource quantity." });
    }
  });
  
  
//Add resource
app.post("/addresource", async (req, res) => {
    const token = req.headers.token;
    const email = req.headers.email;

    // Verify token and email
    try {
        const decoded = jsonwebtoken.verify(token, "rescue-app");
        if (!decoded || decoded.email !== email) {
            return res.status(403).json({ "status": "error", "message": "Invalid token or email." });
        }

        const { district, localBodyType, localBody, resourceCategory, resourceName, resourceQuantity } = req.body;

        // Create and save the new resource
        const newResource = new ResourceModel({
            district,
            localBodyType,  // Include localBodyType here
            localBody,
            resourceCategory,
            resourceName,
            resourceQuantity,
            addedBy: email,
        });

        await newResource.save();
        return res.status(201).json({ "status": "success", "message": "Resource added successfully." });
    } catch (error) {
        console.error('Error adding resource:', error);
        return res.status(500).json({ "status": "error", "message": "Internal server error." });
    }
});

//delete resources
// Route to delete a resource by ID
app.delete('/resources/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await ResourceModel.findByIdAndDelete(id);
        res.status(200).json({ message: "Resource deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting resource" });
    }
});

//view resource
// Route to get all resources
app.get('/viewresources', async (req, res) => {
    try {
        const resources = await ResourceModel.find().sort({ dateAdded: -1 }); // Sort by newest
        res.status(200).json(resources);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving resources" });
    }
});
//DISTRICT
app.post('/setDistrict', (req, res) => {
    const { district } = req.body;

    if (district) {
        // Store district in session
        req.session.district = district;
        res.status(200).json({ message: 'District stored in session' });
    } else {
        res.status(400).json({ message: 'District is required' });
    }
});

//Add Volunteer
/*app.post("/addvolunteer",(req,res)=>{
    let input=req.body
    let token = req.headers.token;
    const decoded = jsonwebtoken.verify(token, "rescue-app");

    if (decoded && decoded.email) {
        let hashedPassword = bcrypt.hashSync(input.password, 10);
        input.password = hashedPassword;
    let stud=new volunteerModel(input)
    stud.save()
    res.json({"status":"success"})
    }
})*/
// signin


app.post("/signIn", async (req, res) => {
    let input = req.body;
    try {
        let response;
        let userRole = null; // Variable to store the user's role
        response = await adminModel.find({ email: input.email });
        if (response.length > 0) {
            userRole = "admin";  // Assign role if admin is found
        }
        if (response.length === 0) {
            response = await volunteerModel.find({ email: input.email });
            if (response.length > 0) {
                userRole = "volunteer";  // Assign role if volunteer is found
            }
        }
        if (response.length === 0) {
            response = await officerModel.find({ email: input.email });
            if (response.length > 0) {
                userRole = "officer";  // Assign role if officer is found
            }
        }
        if (response.length === 0) {
            response = await userModel.find({ email: input.email });
            if (response.length > 0) {
                userRole = "user";  // Assign role from userModel if user is found
            }
        }
        if (response.length > 0) {
            const validator = bcrypt.compareSync(input.password, response[0].password);
            if (validator) {
                jsonwebtoken.sign({ email: input.email, role: userRole }, "rescue-app", { expiresIn: "2d" }, (error, token) => {
                    if (error) {
                        res.json({ "status": "invalid authentication" });
                    } else {
                        res.json({ "status": "success", "token": token, "role": userRole, "email": input.email }); // Include role in the response

                    }
                });
            } else {
                res.json({ "status": "invalid password1" });
            }
        } else {
            res.json({ "status": "invalid email" });
        }
    } catch (error) {
        console.error('Error during sign-in:', error);
        res.json({ "status": "error" });
    }
});

//user signin
/*app.post("/userSignIn", (req, res) => {
    input = req.body
    userModel.find({ userid: input.userid }).then(
        (response) => {
            if (response.length > 0) {
                const validator = bcrypt.compareSync(input.password, response[0].password)
                if (validator) {
                    jsonwebtoken.sign({ userid: input.userid }, "rescue-app", { expiresIn: "1d" },
                        (error, token) => {
                            if (error) {
                                res.json({ "status": "Something went wrong" })
                            } else {
                                res.json({ "status": "success", "token": token })
                            }
                        }
                    )
                } else {
                    res.json({ "status": "Invalid password" })
                }
            } else {
                res.json({ "status": "Invalid user-Id" })
            }
        }
    ).catch()
})*/
//delete user

app.post("/delete", async (req, res) => {
    const { _id } = req.body;
    const token = req.headers["token"]; // Ensure the token is being passed properly

    try {
        // Ensure _id is valid before passing to DB
        if (!_id) {
            return res.status(400).json({ success: false, message: "Invalid ID" });
        }

        // Perform deletion (MongoDB example) - Fix: Use 'new' with mongoose.Types.ObjectId
        const result = await userModel.deleteOne({ _id: new mongoose.Types.ObjectId(_id) });

        if (result.deletedCount === 1) {
            res.json({ success: true, message: "User deleted successfully" });
        } else {
            res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});



//report generation
app.post('/report', async (req, res) => {
    const { district } = req.body;

    try {

        const victims = await userModel.find({ district });

        // Total number of victims
        const totalVictims = victims.length;
        console.log(totalVictims)
        // Count the number of men, women, and children
        const numberOfWomen = victims.filter(userModel => userModel.sex.toLowerCase() === 'female').length;
        const numberOfMen = victims.filter(userModel => userModel.sex.toLowerCase() === 'male').length;
        const numberOfChildren = victims.filter(userModel => parseInt(userModel.age) < "18").length;

        // Send the report back
        res.status(200).json({
            district,
            totalVictims,
            numberOfWomen,
            numberOfMen,
            numberOfChildren,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
//post complaint by user
// Create a new complaint
app.post("/create", async (req, res) => {
    const { message } = req.body; // Extract the message from request body
    const token = req.headers.token;

    jsonwebtoken.verify(token, "rescue-app", async (error, decoded) => {
        if (decoded && decoded.email) {
            try {
                // Find the user by email to get the district
                const user = await userModel.findOne({ email: decoded.email });
                
                if (!user) {
                    return res.status(404).json({ status: "error", message: "User not found" });
                }

                // Create a new message with user's district
                const newMessage = new messageModel({
                    message,
                    email: decoded.email,
                    district: user.district, // Use the district from the user
                });

                // Save the new message to the database
                const savedMessage = await newMessage.save();

                // Return the newly created message object in the response
                res.status(201).json({ 
                    status: "success", 
                    message: "Complaint created successfully", 
                    complaint: savedMessage // Include the saved complaint
                });
            } catch (error) {
                console.error("Error creating complaint:", error);
                res.status(500).json({ status: "error", message: "Error creating complaint" });
            }
        } else {
            res.status(401).json({ status: "invalid authentication" });
        }
    });
});
//delete complaint
app.delete('/deletecomplaint/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Your logic to find and delete the complaint by ID
        await messageModel.findByIdAndDelete(id);
        res.status(200).json({ message: "Complaint deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error deleting complaint." });
    }
});



//complaint by collector
app.post('/viewmessage', async (req, res) => {
    const token = req.headers.token;

    jsonwebtoken.verify(token, "rescue-app", async (error, decoded) => {
        if (error) {
            return res.status(401).json({ status: "invalid authentication" });
        }

        if (decoded && decoded.email) {
            try {
                const officer = await officerModel.findOne({ email: decoded.email });
                

                if (!officer) {
                    return res.status(404).json({ status: "officer not found" });
                }

            

                // Fetch messages for the officer's district
                const messages = await messageModel.find({ district: officer.district });
                

                // Return messages found or empty array
                res.json(messages);
            } catch (error) {
                console.error("Error fetching messages:", error);
                res.status(500).json({ status: "error", message: "Error fetching messages" });
            }
        } else {
            res.status(401).json({ status: "invalid authentication" });
        }
    });
});






// Get all complaints
// Get all complaints for the authenticated user
app.get('/viewcomplaints', async (req, res) => {
    const token = req.headers.token;

    jsonwebtoken.verify(token, "rescue-app", async (error, decoded) => {
        if (decoded && decoded.email) {
            try {
                // Find complaints associated with the user's email
                const complaints = await messageModel.find({ email: decoded.email }); // Filter by user email
                res.json({ status: 'success', complaints });
            } catch (error) {
                console.error('Error fetching complaints:', error);
                res.status(500).json({ status: 'error', message: 'Failed to fetch complaints' });
            }
        } else {
            res.json({ status: 'invalid authentication' });
        }
    });
});




//reply by collector
app.post("/reply", async (req, res) => {
    const { messageId, reply } = req.body;
    const token = req.headers.token;

    jsonwebtoken.verify(token, "rescue-app", async (error, decoded) => {
        if (error || !decoded || !decoded.email) {
            return res.json({ status: "invalid authentication" });
        }

        try {
            // Save the reply in the message's replies array
            await messageModel.updateOne(
                { _id: messageId },
                {
                    $push: {
                        replies: {
                            replyMessage: reply,
                            repliedBy: decoded.email,
                            repliedDate: new Date()
                        }
                    }
                }
            );

            // Respond with success
            res.json({ status: "success", message: "Reply sent." });
        } catch (error) {
            console.error("Error sending reply:", error);
            res.status(500).json({ status: "error", error: error.message });
        }
    });
});




//view user
app.post("/viewall", (req, res) => {


    let token = req.headers.token;


    jsonwebtoken.verify(token, "rescue-app", (error, decoded) => {
        if (error) {
            console.log("Token verification error:", error);
            return res.json({ "status": "invalid authentication" });
        }

        if (decoded && decoded.email) {
            userModel.find().then((items) => {
                res.json(items);
            }).catch((err) => {
                console.log("Database error:", err);
                res.json({ "status": "error" });
            });
        } else {
            res.json({ "status": "invalid authentication" });
        }
    });
});

//View Resources by Officer
routes.post('/searchResources', async (req, res) => {
    const { district, localBodyType } = req.body;

    try {
        // Only count the specified categories
        const specifiedCategories = ['medicine', 'dress', 'food', 'water', 'napkins'];
        
        // Fetch and aggregate resources based on district and localBodyType, filtering to only specified categories
        const resources = await ResourceModel.aggregate([
            {
                $match: {
                    district,
                    localBodyType,
                    resourceCategory: { $in: specifiedCategories }
                }
            },
            {
                $group: {
                    _id: "$resourceCategory",
                    totalQuantity: { $sum: "$resourceQuantity" }
                }
            }
        ]);

        // Create a response array with all specified categories, defaulting to 0 if a category is missing
        const resourceData = specifiedCategories.map(category => {
            const foundResource = resources.find(resource => resource._id === category);
            const totalQuantity = foundResource ? foundResource.totalQuantity : 0;
            return {
                category,
                totalQuantity,
                availability: totalQuantity > 0 ? "Available" : "Not Available"
            };
        });

        res.json(resourceData);
    } catch (error) {
        console.error("Error fetching resources:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.post('/search-missing-count',async (req,res)=>{
    const { district } = req.body;
    try {
        
        const victims = await MissingPersonModel.find({ district });
        
        // Total number of victims
        const totalVictims = victims.length;
        // Count the number of men, women, and children
        const numberOfWomen = victims.filter(MissingPersonModel => MissingPersonModel.sex.toLowerCase() === 'female').length;
        const numberOfMen = victims.filter(MissingPersonModel => MissingPersonModel.sex.toLowerCase() === 'male').length;
        const numberOfChildren = victims.filter(MissingPersonModel => parseInt(MissingPersonModel.age) < "18").length;
        console.log(totalVictims)

        // Send the report back
        res.status(200).json({
            totalVictims,
            district,
            numberOfWomen,
            numberOfMen,
            numberOfChildren,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    
})


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
module.exports = router;


app.listen(8080, () => {
    console.log("server started")
})