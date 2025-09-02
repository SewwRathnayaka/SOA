# 🔧 **Dependency Verification Guide**

## ✅ **Required Applications & Dependencies**

### **1. Java 11 Verification**
```bash
# Check Java version
java -version

# Expected output:
# openjdk version "11.0.x" 2023-xx-xx
# OpenJDK Runtime Environment (build 11.0.x+x-Ubuntu-x)
# OpenJDK 64-Bit Server VM (build 11.0.x+x-Ubuntu-x, mixed mode, sharing)

# Check JAVA_HOME
echo $JAVA_HOME
# Should point to Java 11 installation directory
```

### **2. Maven Verification**
```bash
# Check Maven version
mvn -version

# Expected output:
# Apache Maven 3.8.x (xxxxx)
# Maven home: /usr/share/maven
# Java version: 11.0.x, vendor: Eclipse Adoptium
```

### **3. Docker Verification**
```bash
# Check Docker version
docker --version
# Expected: Docker version 20.10.x or higher

# Check Docker Compose version
docker-compose --version
# Expected: docker-compose version 1.29.x or higher

# Test Docker daemon
docker run hello-world
# Should download and run hello-world container successfully
```

### **4. Node.js Verification (for local development)**
```bash
# Check Node.js version
node --version
# Expected: v16.x.x or higher

# Check npm version
npm --version
# Expected: 8.x.x or higher
```

### **5. SoapUI Verification**
```bash
# Check if SoapUI is installed (Windows)
# Look for SoapUI in Start Menu or:
"C:\Program Files\SmartBear\SoapUI-5.x.x\bin\soapui.bat" -v

# For Linux/Mac:
# Check if SoapUI is in PATH or installed via package manager
```

## 🚨 **Common Issues & Solutions**

### **Java 11 Issues**
```bash
# If multiple Java versions installed:
sudo update-alternatives --config java
# Select Java 11

# Set JAVA_HOME manually:
export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
# Add to ~/.bashrc for persistence
```

### **Maven Issues**
```bash
# If Maven not found:
sudo apt update
sudo apt install maven

# Or download from: https://maven.apache.org/download.cgi
```

### **Docker Issues**
```bash
# Start Docker service:
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group:
sudo usermod -aG docker $USER
# Logout and login again
```

### **Node.js Issues**
```bash
# Install Node.js 16+:
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Or use nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 16
nvm use 16
```

## 🧪 **Quick Test Commands**

### **Test Java + Maven**
```bash
# Create test project
mkdir test-maven
cd test-maven
mvn archetype:generate -DgroupId=com.test -DartifactId=test-app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false

# Build test project
cd test-app
mvn clean compile
```

### **Test Docker**
```bash
# Test basic Docker functionality
docker run -d -p 8080:80 nginx
curl http://localhost:8080
docker stop $(docker ps -q)
```

### **Test SoapUI**
1. Open SoapUI
2. Create new SOAP project
3. Enter WSDL URL: `http://localhost:8080/CatalogService?wsdl`
4. Verify it can load the WSDL

## 📋 **Pre-Flight Checklist**

- [ ] Java 11 installed and JAVA_HOME set
- [ ] Maven 3.8+ installed and in PATH
- [ ] Docker and Docker Compose installed and running
- [ ] Node.js 16+ installed (for local development)
- [ ] SoapUI installed and accessible
- [ ] At least 4GB RAM available
- [ ] Ports 3000-3003, 8080, 5672, 15672, 27017-27019 available

## 🎯 **Next Steps**

Once all dependencies are verified:
1. Clone/download the project
2. Follow the individual service running guide
3. Test each service independently
4. Run the complete system with docker-compose
