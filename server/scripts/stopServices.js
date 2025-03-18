const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// Configuration
const SERVICES = {
  API_SERVER: {
    name: 'photo-op-api',
    port: process.env.PORT || 3000
  },
  MONGODB: {
    name: 'MongoDB',
    port: 27017
  }
};

async function findProcessByPort(port) {
  try {
    if (process.platform === 'win32') {
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      const lines = stdout.split('\n');
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts[1].includes(`:${port}`)) {
          return parts[parts.length - 1]; // PID is the last column
        }
      }
    } else {
      const { stdout } = await execAsync(`lsof -i :${port} -t`);
      return stdout.trim();
    }
  } catch (error) {
    console.log(`No process found on port ${port}`);
    return null;
  }
}

async function killProcess(pid) {
  try {
    if (process.platform === 'win32') {
      await execAsync(`taskkill /F /PID ${pid}`);
    } else {
      await execAsync(`kill -9 ${pid}`);
    }
    return true;
  } catch (error) {
    console.error(`Failed to kill process ${pid}:`, error.message);
    return false;
  }
}

async function stopMongoDB() {
  try {
    if (process.platform === 'win32') {
      await execAsync('net stop MongoDB');
    } else {
      await execAsync('sudo service mongod stop');
    }
    console.log('MongoDB service stopped successfully');
  } catch (error) {
    console.error('Failed to stop MongoDB service:', error.message);
  }
}

async function stopServices() {
  console.log('Stopping all project services...');

  // Stop API Server
  const apiPid = await findProcessByPort(SERVICES.API_SERVER.port);
  if (apiPid) {
    console.log(`Stopping API server (PID: ${apiPid})...`);
    await killProcess(apiPid);
  }

  // Stop MongoDB
  console.log('Stopping MongoDB service...');
  await stopMongoDB();

  console.log('\nAll services have been stopped.');
  console.log('To restart the services:');
  console.log('1. Start MongoDB service');
  console.log('2. Run the API server');
}

// Run the script
stopServices().catch(error => {
  console.error('Error stopping services:', error);
  process.exit(1);
}); 