class BaseLogProps {
    static getFormattedLogMessage(logProps, logLevel) {
        const { message, browser, ip } = logProps;
        const currentTime = this.getCurrentTime();
        const formattedLogMessage = `[${currentTime}][${logLevel}] ${message} | Browser: ${browser} | IP: ${ip}`;

        console.log(formattedLogMessage);
    }

    static getCurrentTime() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
}

class Log extends BaseLogProps {
    static props = {}

    static info(message) {
        this.getFormattedLogMessage({ message, ...this.props }, "INFO");
    }

    static warn(message) {
        this.getFormattedLogMessage({ message, ...this.props }, "WARN");
    }

    static error(message) {
        this.getFormattedLogMessage({ message, ...this.props }, "ERROR");
    }

    static debug(message) {
        this.getFormattedLogMessage({ message, ...this.props }, "DEBUG");
    }
}

module.exports = Log;