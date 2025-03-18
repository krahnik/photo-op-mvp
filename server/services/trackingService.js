const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

class TrackingService {
  constructor() {
    this.eventsPath = path.join(__dirname, '../data/events.csv');
    this.trackingPath = path.join(__dirname, '../../ai_model/image_tracking.csv');
    this.ensureDataDirectory();
    this.initializeTrackingFile();
  }

  ensureDataDirectory() {
    const dataDir = path.dirname(this.eventsPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(this.eventsPath)) {
      fs.writeFileSync(this.eventsPath, 'timestamp,event_type,user_id,details\n');
    }
  }

  initializeTrackingFile() {
    if (!fs.existsSync(this.trackingPath)) {
      const headers = ['timestamp', 'request_id', 'filename', 'status', 'user_id', 'metadata'];
      fs.writeFileSync(this.trackingPath, headers.join(',') + '\n');
    }

    this.csvWriter = createCsvWriter({
      path: this.trackingPath,
      header: [
        { id: 'timestamp', title: 'timestamp' },
        { id: 'request_id', title: 'request_id' },
        { id: 'filename', title: 'filename' },
        { id: 'status', title: 'status' },
        { id: 'user_id', title: 'user_id' },
        { id: 'metadata', title: 'metadata' }
      ],
      append: true
    });
  }

  async trackEvent(eventType, userId, details = {}) {
    const timestamp = new Date().toISOString();
    const eventData = {
      timestamp,
      event_type: eventType,
      user_id: userId,
      details: JSON.stringify(details)
    };

    const eventString = `${eventData.timestamp},${eventData.event_type},${eventData.user_id},${eventData.details}\n`;
    await fs.promises.appendFile(this.eventsPath, eventString);

    return eventData;
  }

  async getEvents(filters = {}) {
    const events = [];
    return new Promise((resolve, reject) => {
      fs.createReadStream(this.eventsPath)
        .pipe(csv())
        .on('data', (data) => {
          if (this.matchesFilters(data, filters)) {
            try {
              data.details = JSON.parse(data.details);
              events.push(data);
            } catch (e) {
              console.error('Error parsing event details:', e);
            }
          }
        })
        .on('end', () => resolve(events))
        .on('error', reject);
    });
  }

  matchesFilters(event, filters) {
    return Object.entries(filters).every(([key, value]) => {
      if (key === 'startDate' && value) {
        return new Date(event.timestamp) >= new Date(value);
      }
      if (key === 'endDate' && value) {
        return new Date(event.timestamp) <= new Date(value);
      }
      return !value || event[key] === value;
    });
  }

  async trackOperation(data) {
    try {
      // Convert metadata to string if it's an object
      if (data.metadata && typeof data.metadata === 'object') {
        data.metadata = JSON.stringify(data.metadata);
      }

      await this.csvWriter.writeRecords([data]);
      return true;
    } catch (error) {
      console.error('Error tracking operation:', error);
      return false;
    }
  }

  async getTrackingHistory(requestId) {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(this.trackingPath)
        .pipe(csv())
        .on('data', (data) => {
          if (data.request_id === requestId) {
            // Parse metadata if it exists
            if (data.metadata) {
              try {
                data.metadata = JSON.parse(data.metadata);
              } catch (e) {
                // Keep as string if parsing fails
              }
            }
            results.push(data);
          }
        })
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  async getAllRecords() {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(this.trackingPath)
        .pipe(csv())
        .on('data', (data) => {
          // Parse metadata if it exists
          if (data.metadata) {
            try {
              data.metadata = JSON.parse(data.metadata);
            } catch (e) {
              // Keep as string if parsing fails
            }
          }
          results.push(data);
        })
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  async getStatistics() {
    const records = await this.getAllRecords();
    const stats = {
      total: records.length,
      byStatus: {},
      byUser: {},
      recent: records.slice(-10) // Last 10 records
    };

    records.forEach(record => {
      // Count by status
      stats.byStatus[record.status] = (stats.byStatus[record.status] || 0) + 1;
      
      // Count by user if user_id exists
      if (record.user_id) {
        stats.byUser[record.user_id] = (stats.byUser[record.user_id] || 0) + 1;
      }
    });

    return stats;
  }
}

module.exports = new TrackingService(); 