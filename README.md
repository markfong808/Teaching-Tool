# Introduction 
Welcome to UWTechPrep, a unique initiative designed to equip software engineering students with the necessary skills and knowledge to excel in 
technical interviews. The goal is to give students a curated practice plan and the ability to practice interviewing without pressure.

The motivation behind UWTechPrep stems from wanting to assist our fellow students to prepare for technical interviews. With this in mind, we 
decided to develop a platform where students can schedule one-on-one mentor sessions and mock-interviews with industry professionals in order 
to practice interviewing and gain confidence for job interviews.  

The scheduling tool serves as the main interface for interaction between industry mentors and students, facilitating the scheduling of mock 
interviews and mentoring sessions. Mentors can indicate time block availabilities, which are broken down into 30 minute appointments for precise 
scheduling. Students are then able to select and book appointments. When an appointment is booked, an automated email is sent to both the mentor 
and student of that booking.

The user interface is crafted using ReactJS, ensuring a responsive and intuitive design. The backend API is powered by Python Flask. 
This framework processes mentor availability, student reservations, and triggers the automated email system. MySQL serves as the project's database 
engine, maintaining user accounts, records of mentor availability, student bookings, and other relevant data.


# Getting Started
Welcome to UWTechPrep! This guide will help you get started with running the code locally and setting up any necessary API keys.

## Installation process

1. **Clone the Repository**: 
```bash
git clone https://dev.azure.com/software-engineering-studio/studio-course/_git/mentor-network
```

### Setting Up the Frontend
2. **Navigate to the frontend Directory**:
In your terminal, change to the frontend directory:
```bash
cd mentor-network/frontend/mentorweb 
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
cd mentor-network/backend
```

#### Follow Backend Setup Instructions:
Refer to the `README.md` file in the backend directory for detailed setup instructions.


## Latest releases
To check for the latest releases and updates to this codebase, refer to the release information provided on Azure DevOps or any other 
release management system your project uses.

# Contribute
While the current version of the scheduling tool meets the foundational needs, there is always room for improvement. Refer to the Future Work doc in the project's Google Folder.


If you want to learn more about creating good readme files then refer the following [guidelines](https://docs.microsoft.com/en-us/azure/devops/repos/git/create-a-readme?view=azure-devops). You can also seek inspiration from the below readme files:
- [ASP.NET Core](https://github.com/aspnet/Home)
- [Visual Studio Code](https://github.com/Microsoft/vscode)
- [Chakra Core](https://github.com/Microsoft/ChakraCore) 

If you want to learn more about creating good readme files then refer the following [guidelines](https://docs.microsoft.com/en-us/azure/devops/repos/git/create-a-readme?view=azure-devops). You can also seek inspiration from the below readme files:
- [ASP.NET Core](https://github.com/aspnet/Home)
- [Visual Studio Code](https://github.com/Microsoft/vscode)
- [Chakra Core](https://github.com/Microsoft/ChakraCore)