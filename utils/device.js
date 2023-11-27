module.exports.isKnownDevice = (uuid, config) => {
    return Object.values(config.DEVICE_PAIRS).some(device => device.PlexDeviceUUID === uuid);
}

module.exports.getKeyByValue = (object, value) => {
    return Object.keys(object).find(key => object[key].PlexDeviceUUID === value);
}