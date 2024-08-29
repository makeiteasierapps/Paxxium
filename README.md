# <span style="color:#78909c">Welcome to Paxxium!</span>

The goal of this project is to create an AI platform that helps the user solve their real world problems. I am moving towards everything being local and self hosting so the below instructions will become deprecated soon. 

## Setup Instructions

To get things set up you will need to set up a Firebase project with a couple of services. For the backend please head over to the Paxxserv repo and follow the instructions there.

- **[Paxxserv](https://github.com/makeiteasierapps/paxxserv)**
- **[Firebase](https://firebase.google.com/)**

### Firebase Setup

1. **Create a New Project:**
   - Navigate to Firebase and create a new project. Give it a name and feel free to disable analytics.

     <img src="readme/newProject.png" width="200">

2. **Add a Web App:**
   - Add a new web app to your Firebase project.

     <img src="readme/addApp.png" width="200">

3. **Configuration:**
   - Note the configuration data provided upon creating a new web app. This information will be added to the `.env` file in Paxxserv.

     <img src="readme/clientFirebaseConfig.png" width="400">

4. **Enable Services:**
   - Go to 'All Products' and add the following services:
     - Authentication (Enable Email/Password)
     - Storage

5. **Service Accounts:**
   - Under 'Project Settings' > 'Service Accounts', generate a new private key. This JSON file is for server-side Admin SDK use and should be added to the `fb_config` folder in Paxxserv.


That completes the setup for Firebase. 

## Cloning the Repository

Clone the Paxxium project repository from GitHub:
[https://github.com/makeiteasierapps/paxxium](https://github.com/makeiteasierapps/paxxium)

From the project root `npm install`

To start the project `npm start`


