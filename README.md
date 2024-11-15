# pt-artemis
practical task for artemis

[Demo (only front-end)](https://ring-r.github.io/pt-artemis/)

## Project Deployment Guide

This project consists of a **backend API** built with FastAPI and a **frontend application** built with React. This guide explains how to run the project locally and deploy it on an AWS EC2 instance.

---

### **Table of Contents**
1. [Requirements](#requirements)
2. [Local Deployment](#local-deployment)
3. [AWS EC2 Deployment](#aws-ec2-deployment)

---

### **Requirements**

#### Prerequisites:
- **Docker**: Install Docker from [https://www.docker.com/](https://www.docker.com/).
- **Docker Compose**: Install Docker Compose ([Guide](https://docs.docker.com/compose/install/)).
- (For AWS EC2) An AWS account with a free-tier EC2 instance created.

---

### **Local Deployment**

1. Clone the repository to your local machine:
   ```bash
    git clone https://github.com/Ring-r/pt-artemis.git
    cd pt-artemis
   ```

2. Build and run the services using Docker Compose:
   ```bash
   docker-compose up --build
   ```

3. Access the applications:
   - **Frontend**: Open [http://localhost](http://localhost) in your browser.
   - **Backend API**: Open [http://localhost/api/ping](http://localhost/api/ping) to check the API health.

4. Stop the services when done:
   ```bash
   docker-compose down
   ```

---

### **AWS EC2 Deployment**

#### 1. **Prepare the EC2 Instance**
   - Launch an **Ubuntu EC2 instance** from the AWS Management Console.
   - Allow inbound traffic on ports `80` and `443`. Open ports `80` and `443` in the security group associated with your instance.

Note. If you plan to enable HTTPS, update the configuration to include SSL certificates. For example, you can add a Let’s Encrypt certificate using the `certbot` Docker image.

#### 2. **Connect to the EC2 Instance**
   Use SSH to connect:
   ```bash
   ssh -i <your-key.pem> ubuntu@<your-ec2-public-ip>
   ```

#### 3. **Install Docker and Docker Compose**
   Run the following commands to install Docker and Docker Compose:
   ```bash
   sudo apt update
   sudo apt install -y docker.io
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.18.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

#### 4. **Deploy the Project**
   1. Clone the repository:
      ```bash
      git clone https://github.com/Ring-r/pt-artemis.git
      cd pt-artemis
      ```

   2. Change environment variables in `docker-compose.yml` file if it is necessary.

   3. Build and run the services:
      ```bash
      sudo docker-compose up --build -d
      ```

   4. Verify the containers:
      ```bash
      sudo docker ps
      ```

#### 5. **Access the Applications**
   - **Frontend**: Open `http://<your-ec2-public-ip>/` in your browser.
   - **Backend API**: Open `http://<your-ec2-public-ip>/api/` for the API documentation.

---

### **Stopping Services on EC2**
To stop and remove containers:
```bash
sudo docker-compose down
```

## Additional Explanation

### Done

**Part 1: Android Application**
- The app allows users to access the camera and capture images.
- Users can add text-based metadata for each image.

**Part 2: Backend Development**
- An API endpoint is implemented to store image files and use the flower count model to detect the number of flowers in each image.

**Part 3: Frontend Development**
- The frontend app allows users to capture images automatically at predefined intervals (e.g., 1, 2, 5, or 10 seconds).
- A collection of captured images is displayed.
- Users can add or modify additional metadata for each image.
- Asynchronous requests can be made to the backend API to retrieve the flower count for each image.

### Not Implemented or Poorly Implemented

**Part 1: Android Application**
- The app works correctly only as a web application or in the emulator. Captured images do not appear on real devices.
- A timer feature for automatic image capture has not been implemented.
- There is no guideline for creating the final application file and deploying it.

**Part 2: Backend Development**
- Authentication mechanisms (e.g., API key or user login) are not yet implemented.
- The backend does not yet fully optimize for efficiency. It would be beneficial to separate the web request handling from the machine learning computation to improve performance. The request works too long.

**Part 3: Frontend Development**
- Usability issues remain unresolved due to time constraints.

### Challanges

**Part 1: Android Application**
- A major challenge was setting up the developer environment, which I hadn’t prepared in advance.

**Part 2: Backend Development**
- There was a lack of clear documentation on how to use the required machine learning model correctly.
- The AWS Free Tier has a limited storage capacity (8 GB), and with the operating system consuming part of that space, the resulting Docker image size of 6.6 GB left insufficient room for deployment. It is not resolved.
