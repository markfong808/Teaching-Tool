# Introduction

Welcome to the UWB Canvas Meeting Scheduler. This is a project that is currently still in development and will be launched near mid-August 2024.

The user interface is crafted using ReactJS, ensuring a responsive and intuitive design. The backend API is powered by Python Flask.
This framework processes instructor availability and student-instructor appointments. MySQL serves as the project's database engine, maintaining user accounts, records of instructor availability, student-instructor appointment bookings, and other relevant data.

# Getting Started

Welcome to the UWB Canvas Meeting Scheduler! This guide will help you get started with running the code locally and setting up any necessary API keys.

## Installation process

1. **Clone the Repository**:

```bash
git clone https://software-engineering-studio@dev.azure.com/software-engineering-studio/studio-course/_git/teaching-tools-scheduling
```

### Node JS installation process
**Before running the React frontend, you need to install Node.js onto your computer (https://nodejs.org/en/download).**

``` Step 1.
Select the latest version of Node.js and download.
```

``` Step 2.
A message will popup indicating that the file is a Node.js file.
```

``` Step 3.
Walkthrough the Setup windows and click on the checkbox automatically install all the necessary tools under the Tools for Native Modules window.
```

``` Step 4.
Install Node.js
```

``` Step 5.
You'll be redirected to Powershell that asks you to press enter to install all tools needed.
```

``` Step 6.
You'll need to exit out of the Powershell and restart by searching "Install Additional Tools for Node.js" in Windows search.
```

``` Step 7.
To ensure that Node.js has been installed: Go to the terminal and enter node -v. Then enter npm -v. You should see the node and npm respective versions.
```

``` Step 8.
Now that you have the Node.js installed you should be able to run the frontend.
```



### Setting Up the Frontend

2. **Navigate to the frontend Directory**:
   In your terminal, change to the frontend directory:

```bash
cd scheduling-tools/frontend/
```

3. **Install the frontend dependencies**:

```bash
npm install
```

4. **Start the React app**:

```bash
npm start
```

- The React app will be accessible at `http://localhost:3000`.

#### Before launching the React App, please start your backend server by following the instructions below:

### Setting Up the Backend

5. **Navigate to the Backend Directory**:
   Open your terminal and navigate to the backend directory of the project:

```bash
cd scheduling-tools/backend
```

#### Follow Backend Setup Instructions:

Refer to the `README.md` file in the backend directory for detailed setup instructions.

## Latest releases

To check for the latest releases and updates to this codebase, refer to the release information provided on Azure DevOps or any other
release management system your project uses.

# Contribute

While the current version of the scheduling tool meets the foundational needs, there is always room for improvement. Refer to the Canvas Meeting Scheduler Development Documentation in the project's Google Folder.

If you want to learn more about creating good readme files then refer the following [guidelines](https://docs.microsoft.com/en-us/azure/devops/repos/git/create-a-readme?view=azure-devops). You can also seek inspiration from the below readme files:

- [ASP.NET Core](https://github.com/aspnet/Home)
- [Visual Studio Code](https://github.com/Microsoft/vscode)
- [Chakra Core](https://github.com/Microsoft/ChakraCore)
