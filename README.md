# <span style="color:#78909c">Paxxium</span>
### Intro
I started building Paxxium during the backend course of my coding bootcamp during the time ChatGPT was becoming popular. As soon as I realized there was an API I started building. I didn't know React and had very little experience building out a server with Python and Flask but decided what better way to learn? 

Paxxium is currently built using Google's infrastructure, I am using Firebase and Google cloud. The project is set up to be easily deployed with a serverless architecture. 


## Setup Instructions

To get started with Paxxium, you'll need to set up several services. These instructions will guide you through setting up Firebase, Google Cloud, and obtaining necessary API keys. Ensure you have billing accounts set up for paid services like OpenAI.

### Prerequisites
- **Firebase Account**
- **Google Cloud Account**
- **[GNews API Key](https://gnews.io/)**
- **[OpenAI API Key](https://openai.com/product)** (Paid)
- **[SerpAPI Key](https://serpapi.com/)**


**Note:** OpenAI requires a paid account for API access to GPT-4 models.

### Firebase Setup

1. **Create a New Project:**
   - Navigate to Firebase and create a new project. Give it a name and feel free to disable analytics.

     <img src="readme/newProject.png" width="200">

2. **Add a Web App:**
   - Add a new web app to your Firebase project.

     <img src="readme/addApp.png" width="200">

3. **Configuration:**
   - Note the configuration data provided upon creating a new web app. This information will be added to the client-side `.env` file.

     <img src="readme/clientFirebaseConfig.png" width="400">

4. **Enable Services:**
   - Go to 'All Products' and add the following services:
     - Authentication (Enable Email/Password)
     - Firestore Database (Not Realtime)
     - Storage

5. **Service Accounts:**
   - Under 'Project Settings' > 'Service Accounts', generate a new private key. This JSON file is for server-side Admin SDK use and should be added to the `fb_config` folder.

### Google Cloud KMS Setup

1. **API Activation:**
   - In Google Cloud Console, ensure your project is selected.
   - Search for `Cloud Key Management Service` and enable the API.
   
     <img src="readme/ckmsApi.png" width="400">

2. **Create a Key Ring and Key:**
   - Navigate to Security > Key Management and create a key ring, then a key within that ring. 
   After you have created the key ring and key copy the resource name for the `KMS_KEY_NAME` variable in the server `.env` file.

     <img src="readme/gcloudKeyNav.png" width="200">

     <img src="readme/kmsKeyPath.png" width="300">

3. **Service Account for KMS:**
   - Under 'IAM & Admin' > 'Service Accounts', create a new service account.
   - Assign the role `Cloud KMS CryptoKey Encrypter/Decrypter`.

     <img src="readme/role.png" width="300">

   - Add a key to this account, choosing JSON format. This file is also added to the `fb_config` folder.

     <img src="readme/kmsKey.png" width="400">


That completes the setup for Firebase and Google Cloud. Next, we can clone the repo and and set up the config we obtained from the previous steps.

## Cloning the Repository

First, clone the Paxxium project repository from GitHub:
[https://github.com/makeiteasierapps/paxxium](https://github.com/makeiteasierapps/paxxium)


