const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function stopServices() {
    console.log('Stopping all Photo-Op services...');

    try {
        // Stop Node.js server processes
        console.log('Stopping Node.js servers...');
        try {
            await execAsync('taskkill /F /IM node.exe');
            console.log('Node.js servers stopped successfully');
        } catch (error) {
            // Ignore error if no Node processes were running
            console.log('No Node.js processes were running');
        }

        // Stop Docker containers
        console.log('Stopping Docker containers...');
        try {
            await execAsync('docker-compose down');
            console.log('Docker containers stopped successfully');
        } catch (error) {
            console.error('Error stopping Docker containers:', error.message);
        }

        // Clean up any remaining processes on port 5000 (API server)
        console.log('Cleaning up port 5000...');
        try {
            const { stdout } = await execAsync('netstat -ano | findstr :5000');
            if (stdout) {
                const pid = stdout.split(/\s+/)[4];
                await execAsync(`taskkill /F /PID ${pid}`);
                console.log('Cleaned up process on port 5000');
            }
        } catch (error) {
            // Ignore error if no process was using port 5000
            console.log('No process running on port 5000');
        }

        // Remove any temporary files
        console.log('Cleaning up temporary files...');
        try {
            await execAsync('del /F /Q server\\server.pid server\\server.log');
            console.log('Temporary files cleaned up');
        } catch (error) {
            // Ignore error if files don't exist
            console.log('No temporary files to clean up');
        }

        console.log('\nAll services stopped successfully!');
    } catch (error) {
        console.error('Error during shutdown:', error.message);
        process.exit(1);
    }
}

// Run the shutdown process
stopServices(); 